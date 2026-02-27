export default function Footer() {
    return (
        <footer style={{
            position: 'relative',
            zIndex: 10,
            marginTop: 32,
            padding: '20px 24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            background: 'linear-gradient(to top, rgba(5,8,20,0.8), transparent)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 12 }}>⚡</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>FlashGap AI</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>© 2026</span>
            </div>
            <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                Built for BNB Chain x YZi Labs Hack Series · Bengaluru
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
                <a href="https://testnet.greenfieldscan.com/" target="_blank" rel="noopener noreferrer" className="btn-ghost"
                    style={{ fontSize: 11, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--accent)' }}>●</span> Audit on Greenfield
                </a>
                <a href="https://testnet.bscscan.com/address/0xa6acB349c32B59c20c898a025971f9e3080B6bf0" target="_blank" rel="noopener noreferrer" className="btn-ghost"
                    style={{ fontSize: 11, padding: '8px 16px' }}>
                    Contract Verified
                </a>
                <a href="https://github.com/sarfraspc/novum-risk-oracle" target="_blank" rel="noopener noreferrer" className="btn-ghost"
                    style={{ fontSize: 11, padding: '8px 16px' }}>
                    Source Code
                </a>
            </div>
        </footer>
    );
}
