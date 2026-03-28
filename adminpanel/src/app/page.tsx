'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin panel
    router.push('/admin');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f7fa'
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          💊
        </div>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#2E7D32',
          marginBottom: '8px'
        }}>
          OrdoGo
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: '#757575'
        }}>
          Redirecting to admin panel...
        </p>
      </div>
    </div>
  );
}
