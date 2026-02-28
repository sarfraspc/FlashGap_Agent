// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Callee.sol";

/**
 * @title  FlashGap — AI-Triggered Arbitrage via Flash Swaps
 * @author FlashGap AI Team
 * @notice Borrows tokens via PancakeSwap V2 flash swap, routes through a
 *         second DEX, and repays with profit.  Only the owner (AI bot) can
 *         trigger executions.
 *
 *         Security: ReentrancyGuard + Ownable + Pausable + slippage guard
 */
contract FlashGap is IUniswapV2Callee, Ownable, ReentrancyGuard, Pausable {

    // Struct (avoids stack-too-deep)
    struct ArbParams {
        address tokenBorrow;
        address tokenTarget;
        uint256 amount;
        address routerA;
        address routerB;
        uint256 minAmountOut;
    }

    // State
    address public factoryA;
    uint256 public minProfitBps;
    uint256 public maxSlippageBps;
    uint256 public flashFeeNumerator;
    uint256 public constant FEE_DENOMINATOR = 10_000;

    uint256 public totalTrades;
    uint256 public totalProfit;

    // Events
    event ArbitrageExecuted(
        address indexed tokenBorrow,
        address indexed tokenTarget,
        uint256 amount,
        uint256 profit,
        address routerA,
        address routerB,
        uint256 timestamp
    );

    event MinProfitUpdated(uint256 oldBps, uint256 newBps);
    event MaxSlippageUpdated(uint256 oldBps, uint256 newBps);
    event FactoryUpdated(address oldFactory, address newFactory);
    event EmergencyWithdraw(address indexed token, uint256 amount, address indexed to);
    event EmergencyWithdrawBNB(uint256 amount, address indexed to);

    // Errors
    error ZeroAmount();
    error PairNotFound(address tokenA, address tokenB);
    error UnauthorizedCallback(address caller, address expectedPair);
    error SenderMismatch(address sender);
    error NotProfitable(uint256 finalAmount, uint256 repayAmount);
    error BelowMinProfit(uint256 profit, uint256 minRequired);
    error SlippageExceeded(uint256 received, uint256 minExpected);
    error ZeroAddress();
    error TransferFailed();

    // Constructor
    constructor(
        address _factoryA,
        uint256 _minProfitBps
    ) Ownable(msg.sender) {
        if (_factoryA == address(0)) revert ZeroAddress();
        factoryA          = _factoryA;
        minProfitBps      = _minProfitBps;
        maxSlippageBps    = 100;   // 1 %
        flashFeeNumerator = 25;    // 0.25 %
    }

    // EXTERNAL ARBITRAGE

    function requestArbitrage(
        address tokenBorrow,
        address tokenTarget,
        uint256 amount,
        address routerA,
        address routerB,
        uint256 minAmountOut
    ) external onlyOwner nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();

        address pair = IUniswapV2Factory(factoryA).getPair(tokenBorrow, tokenTarget);
        if (pair == address(0)) revert PairNotFound(tokenBorrow, tokenTarget);

        address token0 = IUniswapV2Pair(pair).token0();
        uint256 amount0Out = tokenBorrow == token0 ? amount : 0;
        uint256 amount1Out = tokenBorrow == token0 ? 0      : amount;

        bytes memory data = abi.encode(
            tokenBorrow, tokenTarget, amount, routerA, routerB, minAmountOut
        );

        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // CALLBACK pancakeCall

    function pancakeCall(
        address _sender,
        uint256,
        uint256,
        bytes calldata _data
    ) external override {
        ArbParams memory p = _decodeAndValidate(_sender, _data);
        uint256 finalAmount = _executeSwaps(p);
        _validateAndSettle(p, finalAmount);
    }

    // INTERNAL SPLIT TO AVOID STACK DEPTH

    function _decodeAndValidate(
        address _sender,
        bytes calldata _data
    ) internal view returns (ArbParams memory p) {
        (
            p.tokenBorrow,
            p.tokenTarget,
            p.amount,
            p.routerA,
            p.routerB,
            p.minAmountOut
        ) = abi.decode(_data, (address, address, uint256, address, address, uint256));

        address pair = IUniswapV2Factory(factoryA).getPair(p.tokenBorrow, p.tokenTarget);
        if (msg.sender != pair) revert UnauthorizedCallback(msg.sender, pair);
        if (_sender != address(this)) revert SenderMismatch(_sender);
    }

    function _executeSwaps(ArbParams memory p) internal returns (uint256 finalAmount) {
        // Swap borrowed → target on Router A
        address[] memory pathA = new address[](2);
        pathA[0] = p.tokenBorrow;
        pathA[1] = p.tokenTarget;

        _approveIfNeeded(p.tokenBorrow, p.routerA, p.amount);
        uint256[] memory amountsA = IUniswapV2Router02(p.routerA)
            .swapExactTokensForTokens(p.amount, 0, pathA, address(this), block.timestamp + 120);
        uint256 targetReceived = amountsA[amountsA.length - 1];

        // Swap target → borrow on Router B
        address[] memory pathB = new address[](2);
        pathB[0] = p.tokenTarget;
        pathB[1] = p.tokenBorrow;

        _approveIfNeeded(p.tokenTarget, p.routerB, targetReceived);
        uint256[] memory amountsB = IUniswapV2Router02(p.routerB)
            .swapExactTokensForTokens(targetReceived, 0, pathB, address(this), block.timestamp + 120);

        finalAmount = amountsB[amountsB.length - 1];
    }

    function _validateAndSettle(ArbParams memory p, uint256 finalAmount) internal {
        // Slippage guard (per-call)
        if (p.minAmountOut > 0 && finalAmount < p.minAmountOut) {
            revert SlippageExceeded(finalAmount, p.minAmountOut);
        }
        // Repayment = borrowed + flash fee
        uint256 repayAmount = p.amount + (p.amount * flashFeeNumerator / FEE_DENOMINATOR);

        // Slippage guard (global)
        uint256 slippageFloor = repayAmount - (repayAmount * maxSlippageBps / FEE_DENOMINATOR);
        if (finalAmount < slippageFloor) {
            revert SlippageExceeded(finalAmount, slippageFloor);
        }

        if (finalAmount < repayAmount) {
            revert NotProfitable(finalAmount, repayAmount);
        }

        uint256 profit = finalAmount - repayAmount;

        // Min-profit check
        uint256 minRequired = p.amount * minProfitBps / FEE_DENOMINATOR;
        if (profit < minRequired) {
            revert BelowMinProfit(profit, minRequired);
        }

        // Repay the pair
        address pair = IUniswapV2Factory(factoryA).getPair(p.tokenBorrow, p.tokenTarget);
        bool ok = IERC20(p.tokenBorrow).transfer(pair, repayAmount);
        if (!ok) revert TransferFailed();

        // Update stats
        unchecked {
            totalTrades += 1;
            totalProfit += profit;
        }

        emit ArbitrageExecuted(
            p.tokenBorrow, p.tokenTarget, p.amount, profit,
            p.routerA, p.routerB, block.timestamp
        );
    }

    // ADMIN / CONFIG

    function setMinProfitBps(uint256 _bps) external onlyOwner {
        emit MinProfitUpdated(minProfitBps, _bps);
        minProfitBps = _bps;
    }

    function setMaxSlippageBps(uint256 _bps) external onlyOwner {
        emit MaxSlippageUpdated(maxSlippageBps, _bps);
        maxSlippageBps = _bps;
    }

    function setFactory(address _factory) external onlyOwner {
        if (_factory == address(0)) revert ZeroAddress();
        emit FactoryUpdated(factoryA, _factory);
        factoryA = _factory;
    }

    function setFlashFeeNumerator(uint256 _num) external onlyOwner {
        flashFeeNumerator = _num;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ═══════════════════════════════════════════════════════════
    //               EMERGENCY WITHDRAW
    // ═══════════════════════════════════════════════════════════

    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        uint256 bal = IERC20(token).balanceOf(address(this));
        uint256 toSend = amount > bal ? bal : amount;
        bool ok = IERC20(token).transfer(owner(), toSend);
        if (!ok) revert TransferFailed();
        emit EmergencyWithdraw(token, toSend, owner());
    }

    function emergencyWithdrawBNB() external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = payable(owner()).call{value: bal}("");
        if (!ok) revert TransferFailed();
        emit EmergencyWithdrawBNB(bal, owner());
    }

    // VIEW HELPERS

    function estimateProfit(
        address tokenBorrow,
        address tokenTarget,
        uint256 amount,
        address routerA,
        address routerB
    ) external view returns (int256 estimatedProfit, uint256 repayAmount) {
        address[] memory pathA = new address[](2);
        pathA[0] = tokenBorrow;
        pathA[1] = tokenTarget;

        uint256[] memory outA = IUniswapV2Router02(routerA).getAmountsOut(amount, pathA);

        address[] memory pathB = new address[](2);
        pathB[0] = tokenTarget;
        pathB[1] = tokenBorrow;

        uint256[] memory outB = IUniswapV2Router02(routerB).getAmountsOut(outA[outA.length - 1], pathB);

        repayAmount = amount + (amount * flashFeeNumerator / FEE_DENOMINATOR);
        estimatedProfit = int256(outB[outB.length - 1]) - int256(repayAmount);
    }

    // ─────────────────── Internal ────────────────────────────

    function _approveIfNeeded(address token, address spender, uint256 amount) internal {
        if (IERC20(token).allowance(address(this), spender) < amount) {
            IERC20(token).approve(spender, 0);
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    receive() external payable {}
}

// Minimal ERC-20 interface
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}
