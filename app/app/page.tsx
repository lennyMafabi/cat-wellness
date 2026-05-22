'use client';

import { useState } from 'react';
import AccountSystem from '@/components/AccountSystem';
import type { Account, Session } from '@/types/accountSystem';

export default function AppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  const handleAuthenticated = (acc: Account, session: Session, isReturning: boolean) => {
    setAccount(acc);
    setIsAuthenticated(true);
    console.log('Authenticated:', acc.username, 'Returning:', isReturning);
  };

  const handleCancel = () => {
    // Navigate back to home
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountSystem 
        onAuthenticated={handleAuthenticated}
        onCancel={handleCancel}
      />
    </div>
  );
}
