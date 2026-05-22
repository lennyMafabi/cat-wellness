'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '@/types/accountSystem';
import { FollowUpResult, followUpQuestions, calculateFollowUpResult } from '@/lib/followUpAssessment';
import ProgressLineChart from './ProgressLineChart';
import ExtendedAssessmentReport from './ExtendedAssessmentReport';

interface UserDashboardProps {
  accountId: string;
  username: string;
  onStartFollowUp: () => void;
  onLogout: () => void;
}

interface SessionWithFollowUp extends Session {
  followUpResult?: FollowUpResult;
  isFollowUp?: boolean;
}

export default function UserDashboard({ accountId, username, onStartFollowUp, onLogout }: UserDashboardProps) {
  const [sessions, setSessions] = useState<SessionWithFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'coping'>('overview');
  const [selectedSession, setSelectedSession] = useState<SessionWithFollowUp | null>(null);
  const [viewingFullReport, setViewingFullReport] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [accountId]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`/api/accounts/sessions?accountId=${accountId}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate trend data
  const getTrendData = () => {
    if (sessions.length < 2) return null;
    
    const sorted = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((s, index) => ({
      session: index + 1,
      date: new Date(s.date).toLocaleDateString(),
      riskScore: s.riskScore,
      emotionalState: s.emotionalState
    }));
  };

  const trendData = getTrendData();
  const latestSession = sessions[0];

  // Coping resources
  const copingResources = [
    {
      category: 'Immediate Relief',
      resources: [
        { title: '5-4-3-2-1 Grounding Technique', description: 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste' },
        { title: 'Box Breathing', description: 'Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 5 times.' },
        { title: 'Cold Water Reset', description: 'Splash cold water on face or hold ice cube to activate dive reflex' }
      ]
    },
    {
      category: 'Daily Wellness',
      resources: [
        { title: 'Morning Routine', description: 'Start with 5 minutes of stretching, deep breathing, and positive affirmation' },
        { title: 'Sleep Hygiene', description: 'Same bedtime/wake time, no screens 1hr before bed, cool dark room' },
        { title: 'Movement', description: '20-30 minutes of walking, dancing, or any enjoyable physical activity' }
      ]
    },
    {
      category: 'Emotional Processing',
      resources: [
        { title: 'Journaling', description: 'Write freely for 10 minutes without editing. Focus on feelings, not grammar.' },
        { title: 'Trauma Timeline', description: 'Create a visual timeline of your healing journey to see progress' },
        { title: 'Letter Writing', description: 'Write unsent letters to process emotions (not to send)' }
      ]
    },
    {
      category: 'Connection & Support',
      resources: [
        { title: 'Trusted Contact', description: 'Identify 3 people you can reach out to when struggling' },
        { title: 'Support Groups', description: 'Connect with others who understand. CAT Kenya offers peer support.' },
        { title: 'Professional Help', description: 'Trauma-informed therapy: CBT, EMDR, or Somatic Experiencing' }
      ]
    },
    {
      category: 'Safety Planning',
      resources: [
        { title: 'Safety Plan', description: 'Write down warning signs, coping strategies, and emergency contacts' },
        { title: 'Emergency Contacts', description: 'CAT Kenya: help@catkenya.org | Police: 999 | Childline: 116' },
        { title: 'Safe Space', description: 'Create a physical or mental safe space with comforting items/memories' }
      ]
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Show full report view if requested
  if (viewingFullReport && selectedSession?.followUpResult) {
    return (
      <ExtendedAssessmentReport
        result={selectedSession.followUpResult}
        username={username}
        accountId={accountId}
        onClose={() => setViewingFullReport(false)}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {username}</h1>
          <p style={styles.subtitle}>Your personal wellness dashboard</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={onStartFollowUp} style={styles.primaryButton}>
            {sessions.length === 0 ? 'Start Initial Assessment' : 'Start Follow-up Assessment'}
          </button>
          <button onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {})}}
        >
          History & Progress
        </button>
        <button 
          onClick={() => setActiveTab('coping')}
          style={{...styles.tab, ...(activeTab === 'coping' ? styles.activeTab : {})}}
        >
          Coping Resources
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={styles.content}>
          {/* Status Cards */}
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Total Sessions</h3>
              <p style={styles.cardValue}>{sessions.length}</p>
              <p style={styles.cardSubtitle}>Assessments completed</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Latest Risk Level</h3>
              <p style={{...styles.cardValue, color: getRiskColor(latestSession?.riskScore || 0)}}>
                {latestSession ? getRiskLabel(latestSession.riskScore) : 'N/A'}
              </p>
              <p style={styles.cardSubtitle}>{latestSession ? new Date(latestSession.date).toLocaleDateString() : 'No sessions'}</p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Progress Trend</h3>
              <p style={styles.cardValue}>
                {trendData && trendData.length >= 2 
                  ? (trendData[trendData.length - 1].riskScore < trendData[0].riskScore ? '↘ Improving' : '↗ Needs Attention')
                  : 'Start tracking'}
              </p>
              <p style={styles.cardSubtitle}>Based on your assessments</p>
            </div>
          </div>

          {/* Recent Sessions */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Sessions</h2>
            {sessions.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No sessions yet. Complete your initial assessment to start tracking your wellness journey.</p>
                <button onClick={onStartFollowUp} style={styles.primaryButton}>
                  Start Initial Assessment
                </button>
              </div>
            ) : (
              <div style={styles.sessionList}>
                {sessions.slice(0, 5).map((session) => (
                  <div 
                    key={session.sessionId} 
                    style={styles.sessionCard}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div style={styles.sessionHeader}>
                      <span style={styles.sessionDate}>
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span style={{...styles.riskBadge, background: getRiskColor(session.riskScore)}}>
                        {getRiskLabel(session.riskScore)}
                      </span>
                    </div>
                    <p style={styles.sessionType}>{session.module} - {session.round}</p>
                    <p style={styles.sessionDetail}>Emotional State: {session.emotionalState}</p>
                    {session.followUpResult && (
                      <div style={styles.followUpBadge}>
                        Follow-up Assessment
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={styles.content}>
          {/* Multi-Line Progress Chart */}
          {sessions.length >= 1 && (
            <div style={styles.chartContainer}>
              <h2 style={styles.sectionTitle}>📊 Therapeutic Progress Over Time</h2>
              
              {/* Progress Summary Cards */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
                <div style={{ flex: 1, minWidth: '120px', background: '#f9fafb', padding: '16px', borderRadius: '8px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>
                    {sessions.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Sessions</div>
                </div>
                <div style={{ flex: 1, minWidth: '120px', background: '#f9fafb', padding: '16px', borderRadius: '8px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 
                    Math.round(sessions[0]?.riskScore || 0) > 7 ? '#ef4444' : 
                    Math.round(sessions[0]?.riskScore || 0) > 4 ? '#eab308' : '#22c55e'
                  }}>
                    {Math.round(sessions[0]?.riskScore || 0)}/10
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Latest Risk Score</div>
                </div>
              </div>

              {/* Multi-Line Chart */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <ProgressLineChart 
                  data={sessions.slice().reverse().map((session, idx) => ({
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
                  width={550}
                  height={380}
                />
              </div>

              {/* Metrics Explanation */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px', 
                marginTop: '24px' 
              }}>
                <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>🔴 Symptom Severity</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                    Combined measure of PTSD, anxiety, and depression symptoms. Lower scores indicate improvement.
                  </p>
                </div>
                <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2563eb', fontSize: '14px' }}>🔵 Functional Improvement</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                    Daily functioning, relationships, and ability to perform activities. Higher scores are better.
                  </p>
                </div>
                <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#d97706', fontSize: '14px' }}>🟠 Therapeutic Alliance</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                    Wellness, coping strategies, and therapeutic relationship quality. Higher scores indicate stronger alliance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Session History Table */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Complete Session History</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Risk Score</th>
                    <th style={styles.th}>Emotional State</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.sessionId} style={styles.tr}>
                      <td style={styles.td}>{new Date(session.date).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        {session.isFollowUp ? 'Follow-up' : `${session.module} - ${session.round}`}
                      </td>
                      <td style={styles.td}>
                        <span style={{color: getRiskColor(session.riskScore), fontWeight: 600}}>
                          {session.riskScore}
                        </span>
                      </td>
                      <td style={styles.td}>{session.emotionalState}</td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => setSelectedSession(session)}
                          style={styles.viewButton}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Coping Resources Tab */}
      {activeTab === 'coping' && (
        <div style={styles.content}>
          <div style={styles.copingHeader}>
            <h2 style={styles.sectionTitle}>Wellness Toolkit</h2>
            <p style={styles.copingSubtitle}>Evidence-based strategies for healing and resilience</p>
          </div>
          
          <div style={styles.copingGrid}>
            {copingResources.map((category, idx) => (
              <div key={idx} style={styles.copingCard}>
                <h3 style={styles.copingCategory}>{category.category}</h3>
                <div style={styles.resourceList}>
                  {category.resources.map((resource, ridx) => (
                    <div key={ridx} style={styles.resourceItem}>
                      <h4 style={styles.resourceTitle}>{resource.title}</h4>
                      <p style={styles.resourceDesc}>{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Section */}
          <div style={styles.emergencySection}>
            <h3 style={styles.emergencyTitle}>Need Immediate Support?</h3>
            <div style={styles.emergencyGrid}>
              <div style={styles.emergencyCard}>
                <h4>CAT Kenya Support</h4>
                <p>Email: help@catkenya.org</p>
                <p>For counseling and trauma support</p>
              </div>
              <div style={styles.emergencyCard}>
                <h4>Emergency Services</h4>
                <p>Police: 999 or 112</p>
                <p>Ambulance: 999</p>
              </div>
              <div style={styles.emergencyCard}>
                <h4>Child Helpline</h4>
                <p>Call: 116</p>
                <p>Free, confidential support</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Session Details</h2>
              <button onClick={() => setSelectedSession(null)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <label>Date:</label>
                  <span>{new Date(selectedSession.date).toLocaleString()}</span>
                </div>
                <div style={styles.detailItem}>
                  <label>Risk Score:</label>
                  <span style={{color: getRiskColor(selectedSession.riskScore)}}>
                    {selectedSession.riskScore} - {getRiskLabel(selectedSession.riskScore)}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <label>Module:</label>
                  <span>{selectedSession.module}</span>
                </div>
                <div style={styles.detailItem}>
                  <label>Round:</label>
                  <span>{selectedSession.round}</span>
                </div>
                <div style={styles.detailItem}>
                  <label>Emotional State:</label>
                  <span>{selectedSession.emotionalState}</span>
                </div>
                <div style={styles.detailItem}>
                  <label>Duration:</label>
                  <span>{selectedSession.durationMinutes} minutes</span>
                </div>
              </div>
              
              {selectedSession.responses && (
                <div style={styles.responsesSection}>
                  <h3>Your Responses</h3>
                  {Object.entries(selectedSession.responses).map(([key, value]) => {
                    // Extract just the answer value from response objects
                    let displayValue: string;
                    if (typeof value === 'object' && value !== null) {
                      // If it's a response object with 'answer' property, extract just that
                      const answer = (value as any).answer;
                      if (answer !== undefined) {
                        displayValue = String(answer);
                      } else {
                        displayValue = JSON.stringify(value);
                      }
                    } else if (typeof value === 'number') {
                      displayValue = (value as number).toString();
                    } else {
                      displayValue = String(value);
                    }
                    return (
                      <div key={key} style={styles.responseItem}>
                        <span style={styles.responseKey}>Q{parseInt(key) + 1}:</span>
                        <span style={styles.responseValue}>{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* View Full Report Button */}
              {selectedSession.followUpResult && (
                <div style={styles.fullReportButtonContainer}>
                  <button 
                    onClick={() => setViewingFullReport(true)}
                    style={styles.fullReportButton}
                  >
                    📄 View Comprehensive Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getRiskColor(score: number): string {
  if (score <= 33) return '#22c55e'; // green
  if (score <= 66) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getRiskLabel(score: number): string {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Moderate';
  return 'High';
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: 'white'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 700
  },
  subtitle: {
    margin: 0,
    opacity: 0.9,
    fontSize: '16px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '2px'
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: 500
  },
  activeTab: {
    color: '#667eea',
    borderBottom: '2px solid #667eea',
    marginBottom: '-2px'
  },
  content: {
    animation: 'fadeIn 0.3s ease'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center' as const
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  cardValue: {
    margin: '0 0 8px 0',
    fontSize: '36px',
    fontWeight: 700,
    color: '#1f2937'
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#9ca3af'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '16px'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  sessionCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #e5e7eb'
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  sessionDate: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500
  },
  riskBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white'
  },
  sessionType: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937'
  },
  sessionDetail: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280'
  },
  followUpBadge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '4px 8px',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500
  },
  chartContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '32px'
  },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '20px',
    height: '250px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginTop: '16px'
  },
  chartBarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px'
  },
  chartBar: {
    width: '40px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.5s ease'
  },
  chartLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500
  },
  chartValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937'
  },
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  th: {
    textAlign: 'left' as const,
    padding: '16px',
    background: '#f9fafb',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb'
  },
  tr: {
    transition: 'background 0.2s'
  },
  viewButton: {
    padding: '6px 12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  copingHeader: {
    marginBottom: '24px'
  },
  copingSubtitle: {
    margin: '8px 0 0 0',
    color: '#6b7280',
    fontSize: '15px'
  },
  copingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  copingCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #667eea'
  },
  copingCategory: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937'
  },
  resourceList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  resourceItem: {
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  resourceTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151'
  },
  resourceDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.5
  },
  emergencySection: {
    background: '#fef2f2',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #fecaca'
  },
  emergencyTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#dc2626'
  },
  emergencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  emergencyCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center' as const
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#9ca3af',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '24px'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  responsesSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  responseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  responseKey: {
    fontWeight: 500,
    color: '#6b7280'
  },
  responseValue: {
    color: '#1f2937'
  },
  fullReportButtonContainer: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center' as const
  },
  fullReportButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  }
};
