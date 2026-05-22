'use client';

export default function Logo() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '20px',
      padding: '16px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {/* Hands icon */}
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '24px',
      }}>
        🤝
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '0.5px',
          lineHeight: 1.3,
          textTransform: 'uppercase',
        }}>
          Centre Against Torture<br />
          <span style={{ color: '#FCA5A5', fontWeight: 800 }}>Kenya Foundation</span>
        </div>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.9)',
          marginTop: '4px',
          fontStyle: 'italic',
        }}>
          A World Free From Torture
        </div>
      </div>
    </div>
  );
}
