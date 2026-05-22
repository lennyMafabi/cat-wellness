'use client';

import { useState, useEffect } from 'react';
import type { 
  SystemAnalytics, 
  ClientProfile, 
  RiskDataPoint, 
  EmotionalDataPoint,
  AdminMirrorRecord 
} from '@/types/accountSystem';

// ==================== TYPES ====================

interface AdminAnalyticsDashboardProps {
  adminUsername: string;
}

interface ClientListItem extends AdminMirrorRecord {
  username?: string;
  alias?: string;
}

type ViewState = 'overview' | 'clients' | 'client-detail';

// ==================== COMPONENT ====================

export default function AdminAnalyticsDashboard({ adminUsername }: AdminAnalyticsDashboardProps) {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);

  // Load analytics on mount
  useEffect(() => {
    loadOverview();
  }, []);

  // ==================== DATA LOADING ====================

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/analytics?type=overview');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    setIsLoading(true);
    setCurrentView('clients');
    try {
      const response = await fetch('/api/admin/analytics?type=clients');
      const data = await response.json();
      
      if (data.success) {
        setClients(data.clients);
      } else {
        setError(data.message || 'Failed to load clients');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientDetail = async (clientId: string) => {
    setIsLoading(true);
    setSelectedClientId(clientId);
    setCurrentView('client-detail');
    
    try {
      const response = await fetch(`/api/admin/analytics?type=client-profile&clientId=${clientId}`);
      const data = await response.json();
      
      if (data.success) {
        setClientProfile(data.profile);
      } else {
        setError(data.message || 'Failed to load client profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER HELPERS ====================

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return '#22C55E';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getEmotionalColor = (state: string) => {
    switch(state) {
      case 'calm': return '#22C55E';
      case 'distressed': return '#F59E0B';
      case 'high_risk': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==================== VIEWS ====================

  const renderOverview = () => {
    if (!analytics) return null;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 System Analytics Dashboard</h1>
          <p style={styles.subtitle}>Longitudinal Monitoring Overview</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Key Metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{analytics.totalAccounts}</div>
            <div style={styles.metricLabel}>Total Accounts</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{analytics.activeAccountsToday}</div>
            <div style={styles.metricLabel}>Active Today</div>
          </div>
          <div style={styles.metricValueHighlight}>
            <div style={styles.metricValue}>{analytics.sessionsLast7Days}</div>
            <div style={styles.metricLabel}>Sessions (7 Days)</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{analytics.sessionsLast30Days}</div>
            <div style={styles.metricLabel}>Sessions (30 Days)</div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Risk Level Distribution</h2>
          <div style={styles.riskDistribution}>
            <div style={{...styles.riskBar, background: getRiskColor('low')}}>
              <span style={styles.riskCount}>{analytics.riskDistribution.low}</span>
              <span style={styles.riskLabel}>Low</span>
            </div>
            <div style={{...styles.riskBar, background: getRiskColor('medium')}}>
              <span style={styles.riskCount}>{analytics.riskDistribution.medium}</span>
              <span style={styles.riskLabel}>Medium</span>
            </div>
            <div style={{...styles.riskBar, background: getRiskColor('high')}}>
              <span style={styles.riskCount}>{analytics.riskDistribution.high}</span>
              <span style={styles.riskLabel}>High</span>
            </div>
            <div style={{...styles.riskBar, background: getRiskColor('critical')}}>
              <span style={styles.riskCount}>{analytics.riskDistribution.critical}</span>
              <span style={styles.riskLabel}>Critical</span>
            </div>
          </div>
        </div>

        {/* Module Usage */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Module Usage</h2>
          <div style={styles.moduleGrid}>
            <div style={styles.moduleCard}>
              <div style={styles.moduleIcon}>🧠</div>
              <div style={styles.moduleValue}>{analytics.moduleUsage.survivor}</div>
              <div style={styles.moduleLabel}>Survivor Module</div>
            </div>
            <div style={styles.moduleCard}>
              <div style={styles.moduleIcon}>👨‍⚕️</div>
              <div style={styles.moduleValue}>{analytics.moduleUsage.practitioner}</div>
              <div style={styles.moduleLabel}>Practitioner Module</div>
            </div>
            <div style={styles.moduleCard}>
              <div style={styles.moduleIcon}>🌐</div>
              <div style={styles.moduleValue}>{analytics.moduleUsage.online_harms}</div>
              <div style={styles.moduleLabel}>Online Harms</div>
            </div>
          </div>
        </div>

        {/* Emotional State Distribution */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Emotional State Distribution</h2>
          <div style={styles.emotionalGrid}>
            {Object.entries(analytics.emotionalStateDistribution).map(([state, count]) => (
              <div key={state} style={styles.emotionalItem}>
                <div style={{...styles.emotionalDot, background: getEmotionalColor(state)}} />
                <span style={styles.emotionalLabel}>{state.replace('_', ' ')}</span>
                <span style={styles.emotionalCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button onClick={loadClients} style={styles.primaryButton}>
            View All Clients →
          </button>
        </div>
      </div>
    );
  };

  const renderClients = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Client List</h1>
        <button onClick={() => setCurrentView('overview')} style={styles.backButton}>
          ← Back to Overview
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.clientList}>
        {clients.map((client) => (
          <div 
            key={client.clientId} 
            style={styles.clientCard}
            onClick={() => loadClientDetail(client.clientId)}
          >
            <div style={styles.clientHeader}>
              <div style={styles.clientInfo}>
                <h3 style={styles.clientName}>{client.username || 'Unknown'}</h3>
                {client.alias && <span style={styles.clientAlias}>({client.alias})</span>}
              </div>
              <span style={{
                ...styles.riskBadge,
                background: getRiskColor(client.currentRiskLevel || 'low')
              }}>
                {(client.currentRiskLevel || 'low').toUpperCase()}
              </span>
            </div>

            <div style={styles.clientMeta}>
              <span style={styles.clientRole}>{client.role}</span>
              <span style={styles.clientStatus}>{client.status}</span>
            </div>

            <div style={styles.clientStats}>
              <div>
                <strong>{client.sessionCount}</strong> sessions
              </div>
              <div>
                Last active: {formatDate(client.lastActivityAt)}
              </div>
            </div>

            <div style={styles.viewProfile}>
              Click to view full profile →
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClientDetail = () => {
    if (!clientProfile) return null;

    const { account, sessions, stats, riskTimeline, emotionalTrend, chatHistory } = clientProfile;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 Client Profile</h1>
          <div>
            <button onClick={() => setCurrentView('clients')} style={styles.backButton}>
              ← Back to Clients
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Client Header Card */}
        <div style={styles.profileHeader}>
          <div>
            <h2 style={styles.profileName}>{account.username}</h2>
            {account.alias && <p style={styles.profileAlias}>{account.alias}</p>}
            <p style={styles.profileRole}>{account.role} • {account.status}</p>
          </div>
          <div style={styles.profileMeta}>
            <div style={styles.profileStat}>
              <strong>{stats.totalSessions}</strong>
              <span>Sessions</span>
            </div>
            <div style={styles.profileStat}>
              <strong>{(stats.averageRiskScore * 100).toFixed(0)}%</strong>
              <span>Avg Risk</span>
            </div>
            <div style={styles.profileStat}>
              <strong>{stats.trendDirection}</strong>
              <span>Trend</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact Information</h3>
          <div style={styles.contactGrid}>
            <div>
              <label style={styles.contactLabel}>Phone</label>
              <p style={styles.contactValue}>{account.phone || 'Not provided'}</p>
            </div>
            <div>
              <label style={styles.contactLabel}>Email</label>
              <p style={styles.contactValue}>{account.email || 'Not provided'}</p>
            </div>
            <div>
              <label style={styles.contactLabel}>Account ID</label>
              <p style={styles.contactValue}>{account.accountId.slice(0, 8)}...</p>
            </div>
            <div>
              <label style={styles.contactLabel}>Created</label>
              <p style={styles.contactValue}>{formatDate(account.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Risk Timeline Visualization */}
        {riskTimeline.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📈 Risk Score Timeline</h3>
            <div style={styles.chartContainer}>
              {/* Simple bar chart */}
              <div style={styles.timelineChart}>
                {riskTimeline.slice(0, 10).map((point, index) => (
                  <div key={index} style={styles.timelineItem}>
                    <div style={styles.timelineBar}>
                      <div 
                        style={{
                          ...styles.timelineBarFill,
                          height: `${point.riskScore * 100}%`,
                          background: getEmotionalColor(point.emotionalState)
                        }}
                      />
                    </div>
                    <span style={styles.timelineDate}>
                      {new Date(point.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Session History */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Session History</h3>
          <div style={styles.sessionList}>
            {sessions.map((session) => (
              <div key={session.sessionId} style={styles.sessionItem}>
                <div style={styles.sessionHeader}>
                  <span style={styles.sessionModule}>{session.module}</span>
                  <span style={styles.sessionRound}>Round {session.round}</span>
                </div>
                <div style={styles.sessionDetails}>
                  <span>{formatDate(session.date)}</span>
                  <span style={{
                    ...styles.sessionRisk,
                    color: getEmotionalColor(session.emotionalState)
                  }}>
                    {(session.riskScore * 100).toFixed(0)}% - {session.emotionalState}
                  </span>
                </div>
                {session.durationMinutes && (
                  <span style={styles.sessionDuration}>{session.durationMinutes} min</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💬 Chat History ({chatHistory.length} conversations)</h3>
            <div style={styles.chatList}>
              {chatHistory.slice(0, 5).map((chat) => (
                <div key={chat.chatId} style={styles.chatItem}>
                  <div style={styles.chatHeader}>
                    <span style={styles.chatModule}>{chat.module}</span>
                    <span style={styles.chatDate}>{formatDate(chat.startedAt)}</span>
                  </div>
                  <div style={styles.chatMeta}>
                    <span>{chat.messageCount} messages</span>
                    {chat.endedAt && <span>Ended: {formatDate(chat.endedAt)}</span>}
                  </div>
                  {chat.summary && (
                    <p style={styles.chatSummary}>{chat.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div>
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingSpinner}>Loading...</div>
        </div>
      )}
      
      {currentView === 'overview' && renderOverview()}
      {currentView === 'clients' && renderClients()}
      {currentView === 'client-detail' && renderClientDetail()}
    </div>
  );
}

// ==================== STYLES ====================

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '8px 0 0 0',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  metricCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  metricValueHighlight: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  metricLabel: {
    fontSize: '14px',
    opacity: 0.9,
  },
  section: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 20px 0',
  },
  riskDistribution: {
    display: 'flex',
    gap: '8px',
    height: '60px',
  },
  riskBar: {
    flex: 1,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    minWidth: 0,
  },
  riskCount: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  riskLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  moduleCard: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  moduleIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  moduleValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '4px',
  },
  moduleLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  emotionalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  emotionalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  emotionalDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  emotionalLabel: {
    fontSize: '14px',
    color: '#374151',
    flex: 1,
    textTransform: 'capitalize',
  },
  emotionalCount: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '32px',
  },
  primaryButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  backButton: {
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  clientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  clientCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  clientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  clientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  clientName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
  },
  clientAlias: {
    fontSize: '14px',
    color: '#6b7280',
  },
  riskBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  clientMeta: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
  },
  clientRole: {
    fontSize: '14px',
    color: '#667eea',
    textTransform: 'capitalize',
  },
  clientStatus: {
    fontSize: '14px',
    color: '#22c55e',
    textTransform: 'capitalize',
  },
  clientStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
  },
  viewProfile: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: 500,
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  profileAlias: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  profileRole: {
    fontSize: '14px',
    color: '#667eea',
    textTransform: 'capitalize',
  },
  profileMeta: {
    display: 'flex',
    gap: '32px',
  },
  profileStat: {
    textAlign: 'center',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  contactLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  contactValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: 500,
    margin: 0,
  },
  chartContainer: {
    height: '200px',
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
  },
  timelineChart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    gap: '8px',
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  timelineBar: {
    width: '40px',
    height: '140px',
    background: '#e5e7eb',
    borderRadius: '4px 4px 0 0',
    position: 'relative',
    overflow: 'hidden',
  },
  timelineBarFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s',
  },
  timelineDate: {
    fontSize: '10px',
    color: '#6b7280',
    marginTop: '8px',
    textAlign: 'center',
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sessionItem: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  sessionModule: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#667eea',
    textTransform: 'capitalize',
  },
  sessionRound: {
    fontSize: '12px',
    color: '#6b7280',
    background: '#e5e7eb',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  sessionDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#6b7280',
  },
  sessionRisk: {
    fontWeight: 600,
  },
  sessionDuration: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chatItem: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  chatModule: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#667eea',
    textTransform: 'capitalize',
  },
  chatDate: {
    fontSize: '12px',
    color: '#6b7280',
  },
  chatMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  chatSummary: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
    fontStyle: 'italic',
  },
};
