export default function Footer() {
    return (
        <footer style={{
            marginTop: 20, padding: '16px 28px',
            borderTop: '1px solid rgba(148,163,184,0.05)',
            textAlign: 'center',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 12 }}>⚡</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>FlashGap AI</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>© 2026</span>
            </div>
            <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                Built for BNB Chain x YZi Labs Hack Series · Bengaluru
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
                <a href="https://testnet.greenfield.bscscan.com/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}>
                    🟢 Greenfield Logs
                </a>
                <a href={`https://testnet.bscscan.com/address/0xa6ac8422b4bF298dBB8A00f9b5E5C59B41c3BF00`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}>
                    📜 Contract
                </a>
                <a href="https://github.com/0xNavendu" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}>
                    ⭐ GitHub
                </a>
            </div>
        </footer>
    );
}
