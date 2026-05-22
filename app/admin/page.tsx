'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import AdminChat from '@/components/AdminChat';
import OnlineHarmsAdmin from '@/components/OnlineHarmsAdmin';
import AdminAnalyticsDashboard from '@/components/AdminAnalyticsDashboard';
import ProgressLineChart from '@/components/ProgressLineChart';
import MediaManager from '@/components/admin/MediaManager';

// Modern color palette
const COLORS = {
  primary: '#667eea',
  primaryLight: '#a78bfa',
  secondary: '#8B5CF6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#DC2626',
  dark: '#1e293b',
  light: '#f8fafc',
  white: '#ffffff',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
};

interface Assessment {
  id: string;
  userInfo: {
    name: string;
    phone: string;
    altContact?: string;
    relationship?: string;
  };
  result: {
    riskLevel: string;
    summary: string;
    topCluster?: string;
    recommendations: string[];
  };
  track: string;
  userType?: 'victim' | 'practitioner';
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

interface Account {
  accountId: string;
  username: string;
  alias?: string;
  email?: string;
  phone?: string;
  role: 'survivor' | 'practitioner' | 'online_harms';
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
  totalSessions: number;
  metadata?: {
    firstIntakeComplete?: boolean;
    preferredLanguage?: string;
    requirePasswordChange?: boolean;
    passwordResetAt?: string;
  };
}

interface Session {
  sessionId: string;
  accountId: string;
  date: string;
  module: string;
  isFirstSession: boolean;
  round: number;
  riskScore: number;
  emotionalState: string;
  completedAt?: string;
  responses?: Array<{
    questionId: string;
    questionText: string;
    answer: string | number | boolean;
    timestamp: string;
  }>;
  followUpResult?: {
    ptsdScore: number;
    anxietyScore: number;
    depressionScore: number;
    functioningScore: number;
    wellnessScore: number;
    overallTrend: 'improving' | 'worsening' | 'stable';
    severity: 'minimal' | 'mild' | 'moderate' | 'severe';
    recommendations: string[];
  };
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'assessments' | 'users' | 'chat' | 'online-harms' | 'analytics' | 'user-accounts' | 'media'>('assessments');
  
  // Online Harms stats
  const [onlineHarmsStats, setOnlineHarmsStats] = useState({
    totalCases: 0,
    openCases: 0,
    criticalCases: 0,
    recentCases: [] as any[]
  });
  
  // Search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  
  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff');
  
  // User Accounts (from account system)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSessions, setAccountSessions] = useState<Session[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetResult, setResetResult] = useState<{username: string; tempPassword: string} | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Password reset requests
  const [passwordResetRequests, setPasswordResetRequests] = useState<Array<{
    requestId: string;
    accountId: string;
    username: string;
    email?: string;
    phone?: string;
    requestedAt: string;
    status: 'pending' | 'completed';
  }>>([]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        loadData();
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };
  
  const loadData = async () => {
    try {
      const [assessRes, usersRes, ohRes] = await Promise.all([
        fetch('/api/assessments'),
        fetch('/api/users'),
        fetch('/api/online-harms/admin')
      ]);
      
      const assessmentsData = await assessRes.json();
      const usersData = await usersRes.json();
      const ohData = await ohRes.json();
      
      setAssessments(assessmentsData.assessments || []);
      setUsers(usersData.users || []);
      
      if (ohData.success) {
        setOnlineHarmsStats({
          totalCases: ohData.stats?.totalCases || 0,
          openCases: ohData.stats?.openCases || 0,
          criticalCases: ohData.stats?.criticalCases || 0,
          recentCases: ohData.recentCases || []
        });
      }
    } catch (err) {
      console.error('Failed to load data');
    }
  };
  
  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load accounts');
    }
  };
  
  const handleResetPassword = async (accountId: string, username: string) => {
    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/accounts/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      const data = await res.json();
      if (data.success) {
        setResetResult({ username, tempPassword: data.tempPassword });
        setShowResetModal(true);
        // Reload accounts to reflect changes
        loadAccounts();
      } else {
        alert('Failed to reset password: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to reset password', err);
      alert('Failed to reset password: ' + (err instanceof Error ? err.message : 'Network error'));
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  const loadAccountDetails = async (accountId: string) => {
    setIsLoadingAccount(true);
    try {
      const res = await fetch(`/api/accounts/sessions?accountId=${accountId}`);
      const data = await res.json();
      if (data.success) {
        setAccountSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load account sessions');
    } finally {
      setIsLoadingAccount(false);
    }
  };
  
  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    loadAccountDetails(account.accountId);
    setShowAccountModal(true);
  };
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      
      const res = await fetch(`/api/assessments?${params}`);
      const data = await res.json();
      setAssessments(data.assessments || []);
    } catch (err) {
      console.error('Search failed');
    }
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        setNewRole('staff');
        loadData();
      }
    } catch (err) {
      console.error('Failed to create user');
    }
  };
  
  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      await fetch(`/api/assessments?id=${id}`, { method: 'DELETE' });
      loadData();
      setSelectedAssessment(null);
    } catch (err) {
      console.error('Delete failed');
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  // Download PDF for patient report
  const handleDownloadPDF = (assessment: Assessment) => {
    const reportDate = new Date(assessment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const getRiskBadgeColor = (risk: string) => {
      switch(risk) {
        case 'low': return '#22c55e';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const pdfHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Trauma Wellness Report - ${assessment.userInfo.name}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; 
      padding: 0; 
      background: #fff; 
      color: #333;
      line-height: 1.6;
    }
    .container { max-width: 210mm; margin: 0 auto; padding: 30px; }
    
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 40px 30px; 
      border-radius: 16px; 
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; letter-spacing: 1px; }
    .header .subtitle { margin: 0; font-size: 14px; opacity: 0.9; font-style: italic; }
    .header .logo-icon { font-size: 48px; margin-bottom: 15px; }
    
    .client-info { 
      background: #f8fafc; 
      padding: 20px; 
      border-radius: 12px; 
      margin-bottom: 25px;
      border-left: 4px solid #667eea;
    }
    .client-info h3 { margin: 0 0 15px 0; color: #667eea; font-size: 16px; }
    
    .score-section { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 40px; 
      margin-bottom: 30px;
    }
    .score-circle { 
      width: 140px; 
      height: 140px; 
      border-radius: 50%; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      color: white;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .score-number { font-size: 42px; font-weight: 700; line-height: 1; }
    .score-label { font-size: 12px; margin-top: 5px; opacity: 0.9; }
    
    .risk-badge { 
      padding: 12px 30px; 
      border-radius: 50px; 
      font-weight: 700; 
      font-size: 16px;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary { 
      background: #fef3c7; 
      padding: 20px 25px; 
      border-radius: 12px; 
      margin-bottom: 25px;
      border-left: 4px solid #f59e0b;
    }
    .summary h3 { margin: 0 0 10px 0; color: #92400e; font-size: 15px; }
    .summary p { margin: 0; color: #78350f; font-size: 13px; line-height: 1.7; }
    
    .section { margin-bottom: 25px; }
    .section h3 { 
      color: #667eea; 
      font-size: 16px; 
      margin-bottom: 15px; 
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e7ff;
    }
    .recommendations { margin: 0; padding-left: 20px; }
    .recommendations li { margin-bottom: 8px; font-size: 13px; color: #374151; }
    
    .footer { 
      background: #1e293b; 
      color: white; 
      padding: 25px; 
      border-radius: 12px;
      text-align: center;
      margin-top: 30px;
    }
    .footer h4 { margin: 0 0 15px 0; font-size: 16px; }
    .footer p { margin: 6px 0; font-size: 12px; opacity: 0.9; }
    
    .user-type-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
      color: white;
    }
    
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-icon">🤝</div>
      <h1>CENTRE AGAINST TORTURE KENYA FOUNDATION</h1>
      <p class="subtitle">A World Free From Torture</p>
      <div class="user-type-badge" style="background: ${assessment.userType === 'practitioner' ? '#8B5CF6' : '#667eea'}">
        ${assessment.userType === 'practitioner' ? '🛡️ Practitioner Assessment' : '🤝 Survivor Assessment'}
      </div>
    </div>
    
    <div class="client-info">
      <h3>📋 CLIENT INFORMATION</h3>
      <p><strong>Name:</strong> ${assessment.userInfo.name}</p>
      <p><strong>Phone:</strong> ${assessment.userInfo.phone}</p>
      ${assessment.userInfo.altContact ? `<p><strong>Emergency Contact:</strong> ${assessment.userInfo.altContact} (${assessment.userInfo.relationship})</p>` : ''}
      <p><strong>Assessment Date:</strong> ${reportDate}</p>
      <p><strong>Assessment ID:</strong> ${assessment.id}</p>
    </div>
    
    <div class="score-section">
      <div class="score-circle">
        <span class="score-number">${assessment.result.riskLevel.toUpperCase()}</span>
        <span class="score-label">Risk Level</span>
      </div>
      <div>
        <span class="risk-badge" style="background: ${getRiskBadgeColor(assessment.result.riskLevel)}">
          ${assessment.result.riskLevel} Priority
        </span>
      </div>
    </div>
    
    <div class="summary">
      <h3>📊 CLINICAL SUMMARY</h3>
      <p>${assessment.result.summary}</p>
      <p style="margin-top: 10px;"><strong>Top Concern:</strong> ${assessment.result.topCluster || 'None identified'}</p>
    </div>
    
    <div class="section">
      <h3>💡 RECOMMENDATIONS</h3>
      <ul class="recommendations">
        ${assessment.result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    
    <div class="footer">
      <h4>Centre Against Torture Kenya Foundation</h4>
      <p>We're here to support you on your healing journey.</p>
      <p><strong>Phone:</strong> 0727540055 | <strong>Email:</strong> humanrights.catkenya@gmail.com</p>
      <p><strong>Website:</strong> www.catkenya.co.ke</p>
      <p style="margin-top: 15px; font-size: 10px; font-style: italic;">
        This assessment is for self-awareness purposes only and not a medical diagnosis.
        Please consult qualified mental health professionals for proper evaluation.
      </p>
    </div>
  </div>
</body>
</html>`;

    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(pdfHTML);
      pdfWindow.document.close();
      setTimeout(() => {
        pdfWindow.focus();
        pdfWindow.print();
      }, 500);
    }
  };
  
  // Login Page
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <Logo />
          <h1 style={styles.loginTitle}>Admin Login</h1>
          <p style={styles.loginSubtitle}>Centre Against Torture Kenya Foundation</p>
          
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.formInput}
                placeholder="Enter username"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.formInput}
                placeholder="Enter password"
              />
            </div>
            
            {loginError && <p style={styles.errorText}>{loginError}</p>}
            
            <button type="submit" style={styles.loginButton}>
              Login
            </button>
          </form>
          
          <p style={styles.defaultCreds}>
            Default: admin / admin123
          </p>
        </div>
      </div>
    );
  }
  
  // Calculate stats
  const totalAssessments = assessments.length;
  const survivorCount = assessments.filter(a => a.userType === 'victim' || !a.userType).length;
  const practitionerCount = assessments.filter(a => a.userType === 'practitioner').length;
  const highRiskCount = assessments.filter(a => a.result.riskLevel === 'high').length;

  // Dashboard
  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            <span style={styles.logoIcon}>🤝</span>
            <span style={styles.logoText}>CAT Kenya</span>
          </div>
        </div>
        
        <nav style={styles.sidebarNav}>
          <button
            onClick={() => setActiveTab('assessments')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'assessments' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>📋</span>
            <span>Assessments</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'chat' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>💬</span>
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'users' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>👥</span>
            <span>Staff Users</span>
          </button>
          <button
            onClick={() => setActiveTab('online-harms')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'online-harms' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>🛡️</span>
            <span>Online Harms</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'analytics' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>📊</span>
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('user-accounts')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'user-accounts' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>👤</span>
            <span>User Accounts</span>
          </button>
          <button
            onClick={() => setActiveTab('media')}
            style={{
              ...styles.navItem,
              ...(activeTab === 'media' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>🖼️</span>
            <span>Media Manager</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfoCard}>
            <div style={styles.userAvatar}>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={styles.userName}>{currentUser?.username}</div>
              <div style={styles.userRole}>{currentUser?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Top Header */}
        <header style={styles.topHeader}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.headerSearchInput}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div style={styles.headerActions}>
            <span style={styles.dateDisplay}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        {/* Page Title */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'assessments' && '📊 Assessments Dashboard'}
            {activeTab === 'chat' && '💬 Live Chat Support'}
            {activeTab === 'users' && '👥 Staff Management'}
            {activeTab === 'online-harms' && '🛡️ Online Harms Management'}
            {activeTab === 'analytics' && '📈 Longitudinal Analytics'}
            {activeTab === 'user-accounts' && '👤 User Accounts'}
            {activeTab === 'media' && '🖼️ Media Manager'}
          </h1>
        </div>

        {/* Stats Cards - Only show on assessments tab */}
        {activeTab === 'assessments' && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconBg}>
                <span style={styles.statIcon}>📊</span>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{totalAssessments}</div>
                <div style={styles.statLabel}>Total Assessments</div>
                <div style={styles.statSub}>All time records</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIconBg, background: '#fef3c7'}}>
                <span style={{...styles.statIcon, color: '#f59e0b'}}>🤝</span>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{survivorCount}</div>
                <div style={styles.statLabel}>Survivors</div>
                <div style={styles.statSub}>Victim assessments</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIconBg, background: '#ede9fe'}}>
                <span style={{...styles.statIcon, color: '#8b5cf6'}}>🛡️</span>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{practitionerCount}</div>
                <div style={styles.statLabel}>Practitioners</div>
                <div style={styles.statSub}>Secondary trauma</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIconBg, background: '#fee2e2'}}>
                <span style={{...styles.statIcon, color: '#dc2626'}}>⚠️</span>
              </div>
              <div style={styles.statInfo}>
                <div style={{...styles.statValue, color: '#dc2626'}}>{highRiskCount}</div>
                <div style={styles.statLabel}>High Risk</div>
                <div style={styles.statSub}>Require attention</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIconBg, background: '#dbeafe'}}>
                <span style={{...styles.statIcon, color: '#2563eb'}}>🛡️</span>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{onlineHarmsStats.totalCases}</div>
                <div style={styles.statLabel}>Online Harms</div>
                <div style={styles.statSub}>Total reports</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIconBg, background: onlineHarmsStats.criticalCases > 0 ? '#fee2e2' : '#f3f4f6'}}>
                <span style={{...styles.statIcon, color: onlineHarmsStats.criticalCases > 0 ? '#dc2626' : '#6b7280'}}>🚨</span>
              </div>
              <div style={styles.statInfo}>
                <div style={{...styles.statValue, color: onlineHarmsStats.criticalCases > 0 ? '#dc2626' : '#6b7280'}}>{onlineHarmsStats.criticalCases}</div>
                <div style={styles.statLabel}>Critical Cases</div>
                <div style={styles.statSub}>Online harms</div>
              </div>
            </div>
            <div style={{...styles.statCard, cursor: 'pointer'}} onClick={() => setActiveTab('online-harms')}>
              <div style={{...styles.statIconBg, background: '#fef3c7'}}>
                <span style={{...styles.statIcon, color: '#d97706'}}>📂</span>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{onlineHarmsStats.openCases}</div>
                <div style={styles.statLabel}>Open Cases</div>
                <div style={styles.statSub}>Click to view →</div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={styles.contentArea}>
          {activeTab === 'assessments' ? (
            <div style={styles.assessmentsLayout}>
              {/* Left: Assessment List */}
              <div style={styles.listPanel}>
                <div style={styles.listHeader}>
                  <h3 style={styles.listTitle}>Recent Assessments</h3>
                  <div style={styles.filterRow}>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      style={styles.filterInput}
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      style={styles.filterInput}
                    />
                    <button onClick={handleSearch} style={styles.filterBtn}>Filter</button>
                    <button onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); loadData(); }} style={styles.resetBtn}>Reset</button>
                  </div>
                </div>
                
                <div style={styles.assessmentTable}>
                  <div style={styles.tableHeader}>
                    <span style={styles.th}>Name</span>
                    <span style={styles.th}>Type</span>
                    <span style={styles.th}>Risk</span>
                    <span style={styles.th}>Date</span>
                  </div>
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      onClick={() => setSelectedAssessment(assessment)}
                      style={{
                        ...styles.tableRow,
                        ...(selectedAssessment?.id === assessment.id ? styles.tableRowActive : {}),
                        ...(assessment.userType === 'practitioner' ? styles.tableRowPractitioner : {})
                      }}
                    >
                      <div style={styles.tdName}>
                        <div style={styles.nameMain}>{assessment.userInfo.name}</div>
                        <div style={styles.nameSub}>{assessment.userInfo.phone}</div>
                      </div>
                      <div style={styles.td}>
                        <span style={{
                          ...styles.typeBadge,
                          background: assessment.userType === 'practitioner' ? '#ede9fe' : '#dbeafe',
                          color: assessment.userType === 'practitioner' ? '#7c3aed' : '#2563eb'
                        }}>
                          {assessment.userType === 'practitioner' ? '🛡️ Practitioner' : '🤝 Survivor'}
                        </span>
                      </div>
                      <div style={styles.td}>
                        <span style={{
                          ...styles.riskBadgePill,
                          background: assessment.result.riskLevel === 'high' ? '#fee2e2' : 
                                      assessment.result.riskLevel === 'medium' ? '#fef3c7' : '#dcfce7',
                          color: assessment.result.riskLevel === 'high' ? '#dc2626' : 
                                 assessment.result.riskLevel === 'medium' ? '#f59e0b' : '#16a34a'
                        }}>
                          {assessment.result.riskLevel}
                        </span>
                      </div>
                      <div style={styles.tdDate}>
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {assessments.length === 0 && (
                    <div style={styles.emptyTable}>No assessments found</div>
                  )}
                </div>
              </div>

              {/* Right: Assessment Detail */}
              {selectedAssessment && (
                <div style={{
                  ...styles.detailPanel,
                  ...(selectedAssessment.userType === 'practitioner' ? styles.detailPanelPractitioner : {})
                }}>
                  <div style={styles.detailHeader}>
                    <div>
                      <h2 style={styles.detailTitle}>Assessment Details</h2>
                      <span style={{
                        ...styles.detailTypeBadge,
                        background: selectedAssessment.userType === 'practitioner' ? '#8b5cf6' : '#667eea'
                      }}>
                        {selectedAssessment.userType === 'practitioner' ? '🛡️ Practitioner' : '🤝 Survivor'}
                      </span>
                    </div>
                    <div style={styles.detailActions}>
                      <button
                        onClick={() => handleDownloadPDF(selectedAssessment)}
                        style={styles.actionBtnPrimary}
                      >
                        📥 Download PDF
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(selectedAssessment.id)}
                        style={styles.actionBtnDanger}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.detailContent}>
                    <div style={styles.infoCard}>
                      <h4 style={styles.infoCardTitle}>👤 Client Information</h4>
                      <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                          <span style={styles.infoLabel}>Name</span>
                          <span style={styles.infoValue}>{selectedAssessment.userInfo.name}</span>
                        </div>
                        <div style={styles.infoItem}>
                          <span style={styles.infoLabel}>Phone</span>
                          <span style={styles.infoValue}>{selectedAssessment.userInfo.phone}</span>
                        </div>
                        {selectedAssessment.userInfo.altContact && (
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Emergency Contact</span>
                            <span style={styles.infoValue}>{selectedAssessment.userInfo.altContact} ({selectedAssessment.userInfo.relationship})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={styles.resultCard}>
                      <div style={styles.riskDisplay}>
                        <div style={{
                          ...styles.riskCircle,
                          background: selectedAssessment.result.riskLevel === 'high' ? '#dc2626' : 
                                      selectedAssessment.result.riskLevel === 'medium' ? '#f59e0b' : '#16a34a'
                        }}>
                          <span style={styles.riskLevelText}>{selectedAssessment.result.riskLevel.toUpperCase()}</span>
                        </div>
                        <div>
                          <div style={styles.riskLabel}>Risk Level</div>
                          <div style={styles.riskDate}>Assessed on {new Date(selectedAssessment.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.infoCard}>
                      <h4 style={styles.infoCardTitle}>📊 Clinical Summary</h4>
                      <p style={styles.summaryText}>{selectedAssessment.result.summary}</p>
                      {selectedAssessment.result.topCluster && (
                        <div style={styles.topConcern}>
                          <span style={styles.concernLabel}>Top Concern:</span>
                          <span style={styles.concernValue}>{selectedAssessment.result.topCluster}</span>
                        </div>
                      )}
                    </div>

                    <div style={styles.infoCard}>
                      <h4 style={styles.infoCardTitle}>💡 Recommendations</h4>
                      <ul style={styles.recommendationsList}>
                        {selectedAssessment.result.recommendations.map((rec, i) => (
                          <li key={i} style={styles.recommendationItem}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {!selectedAssessment && (
                <div style={styles.emptyDetail}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={styles.emptyText}>Select an assessment to view details</p>
                </div>
              )}
            </div>
          ) : activeTab === 'chat' ? (
            <div style={styles.chatPanel}>
              <AdminChat currentStaffName={currentUser?.username || 'Staff'} />
            </div>
          ) : activeTab === 'users' ? (
            <div style={styles.usersPanel}>
              {/* Create User Form (Admin only) */}
              {currentUser?.role === 'admin' && (
                <div style={styles.userFormCard}>
                  <h3 style={styles.formCardTitle}>➕ Create New Staff Account</h3>
                  <form onSubmit={handleCreateUser} style={styles.inlineForm}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      style={styles.inlineInput}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={styles.inlineInput}
                      required
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'staff' | 'admin')}
                      style={styles.inlineSelect}
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" style={styles.createBtn}>Create Account</button>
                  </form>
                </div>
              )}
              
              {/* Users Table */}
              <div style={styles.usersTableCard}>
                <h3 style={styles.tableCardTitle}>👥 Staff Accounts ({users.length})</h3>
                <div style={styles.usersTable}>
                  <div style={styles.userTableHeader}>
                    <span>User</span>
                    <span>Role</span>
                    <span>Created</span>
                  </div>
                  {users.map((user) => (
                    <div key={user.id} style={styles.userTableRow}>
                      <div style={styles.userCell}>
                        <div style={styles.userTableAvatar}>{user.username[0]?.toUpperCase()}</div>
                        <span style={styles.userTableName}>{user.username}</span>
                      </div>
                      <div>
                        <span style={{
                          ...styles.roleBadgePill,
                          background: user.role === 'admin' ? '#ede9fe' : '#f3f4f6',
                          color: user.role === 'admin' ? '#7c3aed' : '#6b7280'
                        }}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 Staff'}
                        </span>
                      </div>
                      <span style={styles.userTableDate}>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'online-harms' ? (
            <OnlineHarmsAdmin adminUsername={currentUser?.username || 'unknown'} />
          ) : activeTab === 'analytics' ? (
            <AdminAnalyticsDashboard adminUsername={currentUser?.username || 'unknown'} />
          ) : activeTab === 'user-accounts' ? (
            <div style={styles.content}>
              {/* Password Reset Requests Section */}
              <div style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={styles.sectionTitle}>🔔 Password Reset Requests</h2>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/accounts/forgot-password');
                        const data = await res.json();
                        if (data.success) {
                          setPasswordResetRequests(data.requests || []);
                        }
                      } catch (err) {
                        console.error('Failed to load password reset requests');
                      }
                    }}
                    style={{ padding: '8px 16px', background: '#667eea', color: 'white', borderRadius: '6px', border: 'none', fontSize: '14px' }}
                  >
                    Refresh
                  </button>
                </div>
                
                {passwordResetRequests.length === 0 ? (
                  <p style={{ color: '#666', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                    No pending password reset requests.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {passwordResetRequests.map((request) => (
                      <div 
                        key={request.requestId} 
                        style={{ 
                          padding: '16px', 
                          background: '#fef3c7', 
                          borderRadius: '8px', 
                          border: '2px solid #f59e0b',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>
                            {request.username}
                          </h4>
                          <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                            {request.email && `📧 ${request.email}`}
                            {request.email && request.phone && ' | '}
                            {request.phone && `📞 ${request.phone}`}
                          </p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                            Requested: {new Date(request.requestedAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            await handleResetPassword(request.accountId, request.username);
                            // Mark request as completed
                            const updatedRequests = passwordResetRequests.filter(r => r.requestId !== request.requestId);
                            setPasswordResetRequests(updatedRequests);
                          }}
                          style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 600 }}
                        >
                          Generate Password
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Search User Accounts</h2>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Search by username, email, or phone..."
                    value={accountSearchQuery}
                    onChange={(e) => setAccountSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  <button
                    onClick={loadAccounts}
                    style={{ padding: '12px 24px', background: '#667eea', color: 'white', borderRadius: '8px', border: 'none' }}
                  >
                    Search
                  </button>
                </div>
                
                {accounts.length === 0 ? (
                  <p style={{ color: '#666' }}>No accounts found. Click Search to load accounts.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {accounts
                      .filter(acc => 
                        acc.username.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
                        (acc.email && acc.email.toLowerCase().includes(accountSearchQuery.toLowerCase())) ||
                        (acc.phone && acc.phone.includes(accountSearchQuery))
                      )
                      .map(account => (
                        <div 
                          key={account.accountId} 
                          onClick={() => handleViewAccount(account)}
                          style={{ 
                            padding: '16px', 
                            background: 'white', 
                            borderRadius: '8px', 
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '2px solid transparent'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{account.username}</h3>
                              <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                {account.email && `📧 ${account.email}`}
                                {account.email && account.phone && ' | '}
                                {account.phone && `📞 ${account.phone}`}
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
                                Role: {account.role} | Status: {account.status} | Sessions: {account.totalSessions} | Created: {new Date(account.createdAt).toLocaleDateString()}
                                {account.metadata?.requirePasswordChange && (
                                  <span style={{ color: '#f59e0b', fontWeight: 600, marginLeft: '8px' }}>⚠️ Password Reset Required</span>
                                )}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetPassword(account.accountId, account.username);
                                }}
                                style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', borderRadius: '6px', border: 'none', fontSize: '14px' }}
                              >
                                Reset Password
                              </button>
                              <span style={{ fontSize: '20px', color: '#667eea' }}>→</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'media' ? (
            <MediaManager />
          ) : null}
        </div>
      </main>
      
      {/* Session Detail Modal */}
      {selectedSession && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div style={{...styles.modalContent, maxWidth: '700px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📋 Session Diagnosis</h2>
              <button onClick={() => setSelectedSession(null)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Session Overview */}
              <div style={styles.infoSection}>
                <h3 style={styles.sectionHeader}>Session Overview</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Date:</span>
                    <span style={styles.infoValue}>{new Date(selectedSession.date).toLocaleString()}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Risk Score:</span>
                    <span style={{...styles.infoValue, 
                      color: Math.round(selectedSession.riskScore) > 7 ? '#ef4444' : 
                             Math.round(selectedSession.riskScore) > 4 ? '#f59e0b' : '#10b981',
                      fontWeight: 700
                    }}>
                      {Math.round(selectedSession.riskScore)}/10
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Emotional State:</span>
                    <span style={styles.infoValue}>{selectedSession.emotionalState}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Module:</span>
                    <span style={styles.infoValue}>{selectedSession.module}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Round:</span>
                    <span style={styles.infoValue}>{selectedSession.round}</span>
                  </div>
                </div>
              </div>

              {/* Extended Assessment Results */}
              {selectedSession.followUpResult && (
                <div style={styles.infoSection}>
                  <h3 style={styles.sectionHeader}>🔍 Extended Assessment Results</h3>
                  
                  {/* Overall Trend */}
                  <div style={{
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    background: selectedSession.followUpResult.overallTrend === 'improving' ? '#dcfce7' :
                               selectedSession.followUpResult.overallTrend === 'worsening' ? '#fee2e2' : '#fef9c3',
                    borderLeft: `4px solid ${selectedSession.followUpResult.overallTrend === 'improving' ? '#22c55e' :
                                              selectedSession.followUpResult.overallTrend === 'worsening' ? '#ef4444' : '#eab308'}`
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      Overall Trend: {selectedSession.followUpResult.overallTrend.charAt(0).toUpperCase() + selectedSession.followUpResult.overallTrend.slice(1)}
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                      Based on PTSD, Anxiety, Depression, Functioning, and Wellness scores
                    </p>
                  </div>

                  {/* Scores Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const,
                      border: '2px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '4px' }}>PTSD</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 
                        selectedSession.followUpResult.ptsdScore <= 33 ? '#22c55e' :
                        selectedSession.followUpResult.ptsdScore <= 66 ? '#eab308' : '#ef4444'
                      }}>
                        {selectedSession.followUpResult.ptsdScore}%
                      </div>
                    </div>
                    <div style={{
                      background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const,
                      border: '2px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Anxiety</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 
                        selectedSession.followUpResult.anxietyScore <= 33 ? '#22c55e' :
                        selectedSession.followUpResult.anxietyScore <= 66 ? '#eab308' : '#ef4444'
                      }}>
                        {selectedSession.followUpResult.anxietyScore}%
                      </div>
                    </div>
                    <div style={{
                      background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const,
                      border: '2px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Depression</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 
                        selectedSession.followUpResult.depressionScore <= 33 ? '#22c55e' :
                        selectedSession.followUpResult.depressionScore <= 66 ? '#eab308' : '#ef4444'
                      }}>
                        {selectedSession.followUpResult.depressionScore}%
                      </div>
                    </div>
                    <div style={{
                      background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const,
                      border: '2px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Functioning</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 
                        selectedSession.followUpResult.functioningScore >= 67 ? '#22c55e' :
                        selectedSession.followUpResult.functioningScore >= 34 ? '#eab308' : '#ef4444'
                      }}>
                        {selectedSession.followUpResult.functioningScore}%
                      </div>
                    </div>
                    <div style={{
                      background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const,
                      border: '2px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: '4px' }}>Wellness</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 
                        selectedSession.followUpResult.wellnessScore >= 67 ? '#22c55e' :
                        selectedSession.followUpResult.wellnessScore >= 34 ? '#eab308' : '#ef4444'
                      }}>
                        {selectedSession.followUpResult.wellnessScore}%
                      </div>
                    </div>
                  </div>

                  {/* Severity Level */}
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: 
                      selectedSession.followUpResult.severity === 'minimal' ? '#22c55e' :
                      selectedSession.followUpResult.severity === 'mild' ? '#3b82f6' :
                      selectedSession.followUpResult.severity === 'moderate' ? '#eab308' : '#ef4444'
                  }}>
                    Severity: {selectedSession.followUpResult.severity.charAt(0).toUpperCase() + selectedSession.followUpResult.severity.slice(1)}
                  </div>

                  {/* Recommendations */}
                  {selectedSession.followUpResult.recommendations && selectedSession.followUpResult.recommendations.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>🎯 Recommended Actions</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {selectedSession.followUpResult.recommendations.map((rec, idx) => (
                          <li key={idx} style={{ marginBottom: '8px', fontSize: '13px', color: '#4b5563' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Basic Assessment Responses */}
              {selectedSession.responses && Object.keys(selectedSession.responses).length > 0 && !selectedSession.followUpResult && (
                <div style={styles.infoSection}>
                  <h3 style={styles.sectionHeader}>📝 Assessment Responses</h3>
                  <div style={{ 
                    background: '#f9fafb', 
                    padding: '16px', 
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {selectedSession.responses?.map((response, idx) => (
                      <div key={idx} style={{ 
                        padding: '10px 0', 
                        borderBottom: idx < (selectedSession.responses?.length || 0) - 1 ? '1px solid #e5e7eb' : 'none'
                      }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize', marginBottom: '4px' }}>
                          {response.questionText || response.questionId}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                          {Array.isArray(response.answer) ? response.answer.join(', ') : String(response.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  onClick={() => setSelectedSession(null)}
                  style={styles.primaryButton}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Detail Modal */}
      {showAccountModal && selectedAccount && (
        <div style={styles.modalOverlay} onClick={() => setShowAccountModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>👤 {selectedAccount.username}</h2>
              <button onClick={() => setShowAccountModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Personal Information */}
              <div style={styles.infoSection}>
                <h3 style={styles.sectionHeader}>Personal Information</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Username:</span>
                    <span style={styles.infoValue}>{selectedAccount.username}</span>
                  </div>
                  {selectedAccount.alias && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Alias:</span>
                      <span style={styles.infoValue}>{selectedAccount.alias}</span>
                    </div>
                  )}
                  {selectedAccount.email && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Email:</span>
                      <span style={styles.infoValue}>{selectedAccount.email}</span>
                    </div>
                  )}
                  {selectedAccount.phone && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Phone:</span>
                      <span style={styles.infoValue}>{selectedAccount.phone}</span>
                    </div>
                  )}
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Role:</span>
                    <span style={styles.infoValue}>{selectedAccount.role}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Status:</span>
                    <span style={{...styles.infoValue, color: selectedAccount.status === 'active' ? '#10b981' : '#ef4444'}}>
                      {selectedAccount.status}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Created:</span>
                    <span style={styles.infoValue}>{new Date(selectedAccount.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Last Login:</span>
                    <span style={styles.infoValue}>
                      {selectedAccount.lastLoginAt ? new Date(selectedAccount.lastLoginAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Total Sessions:</span>
                    <span style={styles.infoValue}>{selectedAccount.totalSessions}</span>
                  </div>
                </div>
              </div>
              
              {/* Session History */}
              <div style={styles.infoSection}>
                <h3 style={styles.sectionHeader}>📊 Session History & Diagnosis</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                  Click on any session to view detailed diagnosis and assessment results
                </p>
                {isLoadingAccount ? (
                  <p>Loading sessions...</p>
                ) : accountSessions.length === 0 ? (
                  <p style={{ color: '#666' }}>No sessions recorded yet.</p>
                ) : (
                  <div style={styles.sessionList}>
                    {accountSessions.map((session, index) => (
                      <div 
                        key={session.sessionId} 
                        style={{...styles.sessionCard, cursor: 'pointer'}}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div style={styles.sessionHeader}>
                          <span style={styles.sessionDate}>
                            Session #{accountSessions.length - index}: {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span style={{...styles.sessionRisk, 
                            background: Math.round(session.riskScore) > 7 ? '#fee2e2' : Math.round(session.riskScore) > 4 ? '#fef3c7' : '#d1fae5',
                            color: Math.round(session.riskScore) > 7 ? '#dc2626' : Math.round(session.riskScore) > 4 ? '#f59e0b' : '#059669'
                          }}>
                            Risk: {Math.round(session.riskScore)}/10
                          </span>
                        </div>
                        <div style={styles.sessionDetails}>
                          <span><strong>Module:</strong> {session.module}</span>
                          <span> | <strong>Round:</strong> {session.round}</span>
                          <span> | <strong>State:</strong> {session.emotionalState}</span>
                          {session.followUpResult && (
                            <span style={{ color: '#667eea', fontWeight: 600 }}> | 📋 Extended Assessment</span>
                          )}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea' }}>
                          Click to view diagnosis details →
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Multi-Line Progress Chart */}
              {accountSessions.length > 0 && (
                <div style={styles.infoSection}>
                  <h3 style={styles.sectionHeader}>📈 Therapeutic Progress Visualization</h3>
                  
                  {/* Progress Summary */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                    <div style={{ flex: 1, minWidth: '150px', background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>
                        {accountSessions.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Sessions</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px', background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: 
                        Math.round(accountSessions[0].riskScore) > 7 ? '#ef4444' : 
                        Math.round(accountSessions[0].riskScore) > 4 ? '#f59e0b' : '#10b981'
                      }}>
                        {Math.round(accountSessions[0].riskScore)}/10
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Latest Risk Score</div>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px', background: '#f9fafb', padding: '12px', borderRadius: '8px', textAlign: 'center' as const }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: 
                        accountSessions.length > 1 && Math.round(accountSessions[0].riskScore) < Math.round(accountSessions[accountSessions.length - 1].riskScore) 
                          ? '#10b981' : 
                        accountSessions.length > 1 && Math.round(accountSessions[0].riskScore) > Math.round(accountSessions[accountSessions.length - 1].riskScore)
                          ? '#ef4444' : '#f59e0b'
                      }}>
                        {accountSessions.length > 1 && Math.round(accountSessions[0].riskScore) < Math.round(accountSessions[accountSessions.length - 1].riskScore) 
                          ? '↘ Improving' : 
                        accountSessions.length > 1 && Math.round(accountSessions[0].riskScore) > Math.round(accountSessions[accountSessions.length - 1].riskScore)
                          ? '↗ Worsening' : '→ Stable'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Overall Trend</div>
                    </div>
                  </div>

                  {/* Multi-Line Chart */}
                  <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    border: '1px solid #e5e7eb',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <ProgressLineChart 
                      data={[...accountSessions].reverse().map((session, idx) => ({
                        date: session.date,
                        sessionNumber: idx + 1,
                        symptomSeverity: session.followUpResult 
                          ? Math.round(session.followUpResult.ptsdScore * 0.4 + session.followUpResult.anxietyScore * 0.3 + session.followUpResult.depressionScore * 0.3)
                          : Math.round(session.riskScore * 10),
                        functionalImprovement: session.followUpResult 
                          ? session.followUpResult.functioningScore 
                          : Math.max(0, 100 - Math.round(session.riskScore * 10)),
                        therapeuticAlliance: session.followUpResult 
                          ? session.followUpResult.wellnessScore 
                          : Math.max(0, 100 - Math.round(session.riskScore * 8))
                      }))}
                      width={620}
                      height={380}
                    />
                  </div>

                  {/* Metrics Explanation */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#dc2626', fontSize: '13px' }}>🔴 Symptom Severity</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>
                        Combined PTSD, anxiety, depression. Lower is better.
                      </p>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#2563eb', fontSize: '13px' }}>🔵 Functional Improvement</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>
                        Daily functioning and relationships. Higher is better.
                      </p>
                    </div>
                    <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#d97706', fontSize: '13px' }}>🟠 Therapeutic Alliance</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>
                        Wellness and coping strategies. Higher is better.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div style={styles.modalActions}>
                <button
                  onClick={() => {
                    handleResetPassword(selectedAccount.accountId, selectedAccount.username);
                    setShowAccountModal(false);
                  }}
                  style={{ ...styles.actionButton, background: '#f59e0b' }}
                >
                  🔑 Reset Password
                </button>
                <button
                  onClick={() => setShowAccountModal(false)}
                  style={{ ...styles.actionButton, background: '#6b7280' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Reset Modal */}
      {showResetModal && resetResult && (
        <div style={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div style={{...styles.modalContent, maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🔑 Password Reset Generated</h2>
              <button onClick={() => setShowResetModal(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#92400e' }}>
                  <strong>Important:</strong> Copy these credentials and share them securely with the user. 
                  They will be required to change their password on next login.
                </p>
              </div>
              
              <div style={styles.credentialBox}>
                <div style={styles.credentialRow}>
                  <span style={styles.credentialLabel}>Username:</span>
                  <div style={styles.credentialValueContainer}>
                    <span style={styles.credentialValue}>{resetResult.username}</span>
                    <button
                      onClick={() => copyToClipboard(resetResult.username, 'username')}
                      style={styles.copyButton}
                    >
                      {copiedField === 'username' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
                
                <div style={styles.credentialRow}>
                  <span style={styles.credentialLabel}>Temporary Password:</span>
                  <div style={styles.credentialValueContainer}>
                    <span style={{...styles.credentialValue, fontFamily: 'monospace', fontSize: '18px'}}>
                      {resetResult.tempPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(resetResult.tempPassword, 'password')}
                      style={styles.copyButton}
                    >
                      {copiedField === 'password' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    copyToClipboard(`Username: ${resetResult.username}\nPassword: ${resetResult.tempPassword}`, 'all');
                  }}
                  style={{ ...styles.actionButton, background: '#667eea', width: '100%' }}
                >
                  {copiedField === 'all' ? '✓ All Copied!' : '📋 Copy All Credentials'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Login styles
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  loginCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px'
  },
  loginTitle: {
    textAlign: 'center',
    margin: '0 0 8px 0',
    color: '#1e293b',
    fontSize: '24px'
  },
  loginSubtitle: {
    textAlign: 'center',
    margin: '0 0 24px 0',
    color: '#64748b',
    fontSize: '14px'
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151'
  },
  formInput: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none'
  },
  errorText: {
    color: '#DC2626',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0
  },
  loginButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px'
  },
  defaultCreds: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '16px'
  },

  // Dashboard Layout
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f1f5f9'
  },

  // Sidebar
  sidebar: {
    width: '260px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed' as const,
    height: '100vh',
    zIndex: 100
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #e2e8f0'
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '28px'
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b'
  },
  sidebarNav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    background: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    transition: 'all 0.2s'
  },
  navItemActive: {
    background: '#ede9fe',
    color: '#7c3aed'
  },
  navIcon: {
    fontSize: '18px'
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  userInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: '16px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b'
  },
  userRole: {
    fontSize: '12px',
    color: '#64748b'
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Main Content
  mainContent: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },

  // Top Header
  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f1f5f9',
    padding: '10px 16px',
    borderRadius: '10px',
    width: '320px'
  },
  searchIcon: {
    fontSize: '16px',
    color: '#64748b'
  },
  headerSearchInput: {
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    color: '#1e293b'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  dateDisplay: {
    fontSize: '14px',
    color: '#64748b'
  },

  // Page Header
  pageHeader: {
    padding: '24px 24px 0'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    padding: '24px'
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIconBg: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statIcon: {
    fontSize: '24px'
  },
  statInfo: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px'
  },
  statSub: {
    fontSize: '12px',
    color: '#94a3b8'
  },

  // Content Area
  contentArea: {
    flex: 1,
    padding: '0 24px 24px'
  },

  // Assessments Layout
  assessmentsLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    height: 'calc(100vh - 280px)'
  },

  // List Panel
  listPanel: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  listHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  },
  listTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  filterRow: {
    display: 'flex',
    gap: '8px'
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none'
  },
  filterBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500
  },
  resetBtn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },

  // Assessment Table
  assessmentTable: {
    flex: 1,
    overflow: 'auto'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '12px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  th: {
    textAlign: 'left' as const
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignItems: 'center'
  },
  tableRowActive: {
    background: '#ede9fe'
  },
  tableRowPractitioner: {
    borderLeft: '3px solid #8b5cf6'
  },
  tdName: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nameMain: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b'
  },
  nameSub: {
    fontSize: '12px',
    color: '#64748b'
  },
  td: {
    fontSize: '13px'
  },
  tdDate: {
    fontSize: '13px',
    color: '#64748b'
  },
  typeBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500
  },
  riskBadgePill: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize' as const
  },
  emptyTable: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#94a3b8'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  modalBody: {
    padding: '24px'
  },
  infoSection: {
    marginBottom: '24px'
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500
  },
  infoValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 600
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  sessionCard: {
    background: '#f9fafb',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  sessionDate: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151'
  },
  sessionRisk: {
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '12px'
  },
  sessionDetails: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const
  },
  chartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '8px',
    height: '150px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  chartBar: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px'
  },
  chartBarFill: {
    width: '24px',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s ease'
  },
  chartLabel: {
    fontSize: '11px',
    color: '#6b7280'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  actionButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  credentialBox: {
    background: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  credentialRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  credentialLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500
  },
  credentialValueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  credentialValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b'
  },
  copyButton: {
    padding: '6px 12px',
    background: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer'
  },

  // Detail Panel
  detailPanel: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  detailPanelPractitioner: {
    border: '2px solid #8b5cf6'
  },
  detailHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  detailTypeBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'white'
  },
  detailActions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtnPrimary: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  actionBtnDanger: {
    padding: '8px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  detailContent: {
    flex: 1,
    overflow: 'auto',
    padding: '20px'
  },
  infoCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  infoCardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 12px 0'
  },
  resultCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  riskDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  riskCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700
  },
  riskLevelText: {
    textAlign: 'center' as const
  },
  riskLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b'
  },
  riskDate: {
    fontSize: '13px',
    color: '#64748b'
  },
  summaryText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151'
  },
  topConcern: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0'
  },
  concernLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginRight: '8px'
  },
  concernValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b'
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151'
  },
  recommendationItem: {
    marginBottom: '8px'
  },
  emptyDetail: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b'
  },

  // Chat Panel
  chatPanel: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 180px)',
    overflow: 'hidden'
  },

  // Users Panel
  usersPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  userFormCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  formCardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  inlineForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const
  },
  inlineInput: {
    padding: '10px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    minWidth: '200px'
  },
  inlineSelect: {
    padding: '10px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer'
  },
  createBtn: {
    padding: '10px 24px',
    background: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  usersTableCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tableCardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  usersTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  userTableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  userTableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userTableAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600,
    fontSize: '14px'
  },
  userTableName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b'
  },
  roleBadgePill: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500
  },
  userTableDate: {
    fontSize: '13px',
    color: '#64748b'
  }
};
