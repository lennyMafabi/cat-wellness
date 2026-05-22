'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error securely (without exposing to client)
  if (process.env.NODE_ENV === 'production') {
    // In production, send to logging service
    console.error('Global error occurred:', error.digest || 'unknown');
  }

  return (
    <html>
      <body style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8f9fa'
      }}>
        <h1 style={{ color: '#2C3E50', marginBottom: '16px', fontSize: '24px' }}>
          Application Error
        </h1>
        <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
