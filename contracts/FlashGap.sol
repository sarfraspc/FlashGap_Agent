// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Callee.sol";

/**
 * @title FlashGap — AI-Triggered Arbitrage via Flash Swaps
 * @notice Borrows tokens via PancakeSwap V2 flash swap, routes through a
 *         second DEX, and repays with profit. Only the owner (AI bot) can
 *         trigger executions.
 */
contract FlashGap is IUniswapV2Callee, Ownable, ReentrancyGuard {
    // ── State ──────────────────────────────────────────────
    address public factoryA;       // e.g. PancakeSwap factory
    uint256 public minProfitBps;   // minimum profit in basis points (e.g. 30 = 0.30%)
    uint256 public totalTrades;
    uint256 public totalProfit;

    // ── Events ─────────────────────────────────────────────
    event ArbitrageExecuted(
        address indexed tokenBorrow,
        uint256 amount,
        uint256 profit,
        address routerA,
        address routerB,
        uint256 timestamp
    );

    event MinProfitUpdated(uint256 oldBps, uint256 newBps);

    // ── Constructor ────────────────────────────────────────
    constructor(address _factoryA, uint256 _minProfitBps) Ownable(msg.sender) {
        factoryA = _factoryA;
        minProfitBps = _minProfitBps;
    }

    // ── External: kick-off arbitrage ───────────────────────
    /**
     * @notice Called by the AI watcher bot to start a flash-swap arbitrage.
     * @param tokenBorrow  The token to borrow (e.g. BUSD).
     * @param tokenTarget  The intermediate token (e.g. WBNB).
     * @param amount       Amount of tokenBorrow to flash-borrow.
     * @param routerA      Router of the DEX where we borrow & buy.
     * @param routerB      Router of the DEX where we sell back.
     */
    function requestArbitrage(
        address tokenBorrow,
        address tokenTarget,
        uint256 amount,
        address routerA,
        address routerB
    ) external onlyOwner nonReentrant {
        require(amount > 0, "FlashGap: zero amount");

        // Determine the pair on Factory A
        address pair = IUniswapV2Factory(factoryA).getPair(tokenBorrow, tokenTarget);
        require(pair != address(0), "FlashGap: pair not found");

        // Determine which token is token0 / token1
        address token0 = IUniswapV2Pair(pair).token0();
        uint256 amount0Out = tokenBorrow == token0 ? amount : 0;
        uint256 amount1Out = tokenBorrow == token0 ? 0 : amount;

        // Encode data so the callback knows what to do
        bytes memory data = abi.encode(tokenBorrow, tokenTarget, amount, routerA, routerB);

        // Initiate flash swap — triggers pancakeCall
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // ── Callback: PancakeSwap V2 flash-swap callback ───────
    function pancakeCall(
        address _sender,
        uint256 /* _amount0 */,
        uint256 /* _amount1 */,
        bytes calldata _data
    ) external override {
        // Security: only the pair contract should call this
        (
            address tokenBorrow,
            address tokenTarget,
            uint256 borrowedAmount,
            address routerA,
            address routerB
        ) = abi.decode(_data, (address, address, uint256, address, address));

        address pair = IUniswapV2Factory(factoryA).getPair(tokenBorrow, tokenTarget);
        require(msg.sender == pair, "FlashGap: unauthorized caller");
        require(_sender == address(this), "FlashGap: sender mismatch");

        // ── Step 1: Swap borrowed token → target token on Router A ──
        address[] memory pathA = new address[](2);
        pathA[0] = tokenBorrow;
        pathA[1] = tokenTarget;

        _approveIfNeeded(tokenBorrow, routerA, borrowedAmount);
        uint256[] memory amountsA = IUniswapV2Router02(routerA).swapExactTokensForTokens(
            borrowedAmount,
            0, // accept any amount (checked later via profit threshold)
            pathA,
            address(this),
            block.timestamp + 120
        );
        uint256 targetReceived = amountsA[amountsA.length - 1];

        // ── Step 2: Swap target token → borrow token on Router B ──
        address[] memory pathB = new address[](2);
        pathB[0] = tokenTarget;
        pathB[1] = tokenBorrow;

        _approveIfNeeded(tokenTarget, routerB, targetReceived);
        uint256[] memory amountsB = IUniswapV2Router02(routerB).swapExactTokensForTokens(
            targetReceived,
            0,
            pathB,
            address(this),
            block.timestamp + 120
        );
        uint256 finalAmount = amountsB[amountsB.length - 1];

        // ── Step 3: Calculate repayment (borrowed + 0.25% fee) ──
        uint256 repayAmount = borrowedAmount + ((borrowedAmount * 25) / 10000);
        require(finalAmount >= repayAmount, "FlashGap: not profitable");

        uint256 profit = finalAmount - repayAmount;

        // Enforce minimum profit threshold
        uint256 minRequired = (borrowedAmount * minProfitBps) / 10000;
        require(profit >= minRequired, "FlashGap: below min profit");

        // ── Step 4: Repay the pair ──
        IERC20(tokenBorrow).transfer(pair, repayAmount);

        // Update stats
        totalTrades += 1;
        totalProfit += profit;

        emit ArbitrageExecuted(
            tokenBorrow,
            borrowedAmount,
            profit,
            routerA,
            routerB,
            block.timestamp
        );
    }

    // ── Admin ──────────────────────────────────────────────
    function setMinProfitBps(uint256 _bps) external onlyOwner {
        emit MinProfitUpdated(minProfitBps, _bps);
        minProfitBps = _bps;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ── Internal ───────────────────────────────────────────
    function _approveIfNeeded(address token, address spender, uint256 amount) internal {
        uint256 currentAllowance = IERC20(token).allowance(address(this), spender);
        if (currentAllowance < amount) {
            IERC20(token).approve(spender, type(uint256).max);
        }
    }

    receive() external payable {}
}

// Minimal ERC-20 interface used internally
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}
