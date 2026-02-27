/**
 * FlashGap AI — Formatting Utilities
 */

export function formatBNB(wei, decimals = 4) {
    if (wei === undefined || wei === null) return '0.0000';
    return (Number(wei) / 1e18).toFixed(decimals);
}

export function formatUSD(value) {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatCompact(value) {
    if (value === undefined || value === null) return '0';
    const num = Number(value);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
}

export function truncateAddress(address) {
    if (!address) return '—';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatGwei(wei) {
    if (wei === undefined || wei === null) return '—';
    return `${(Number(wei) / 1e9).toFixed(1)}`;
}

export function formatBps(bps) {
    if (bps === undefined || bps === null) return '—';
    return `${(Number(bps) / 100).toFixed(2)}%`;
}

export function formatPrice(value, decimals = 6) {
    if (value === undefined || value === null) return '—';
    return Number(value).toFixed(decimals);
}

export function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() / 1000) - Number(timestamp));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function getBscScanUrl(hash, type = 'tx', testnet = true) {
    const base = testnet ? 'https://testnet.bscscan.com' : 'https://bscscan.com';
    return `${base}/${type}/${hash}`;
}
