'use client';

import { useState, useEffect } from 'react';
import type { ClientSummary, CaseDetail, OnlineHarmsCase } from '@/types/onlineHarms';
import AdminCaseReviewPDF from './AdminCaseReviewPDF';
import { TFGBV_CLUSTERS } from '@/data/tfgbvQuestions';

interface OnlineHarmsAdminProps {
  adminUsername: string;
}

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626'
};

const STATUS_COLORS: Record<string, string> = {
  open: '#3B82F6',
  in_progress: '#8B5CF6',
  closed: '#6B7280',
  escalated: '#DC2626'
};

export default function OnlineHarmsAdmin({ adminUsername }: OnlineHarmsAdminProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'clients' | 'cases' | 'case-detail'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [cases, setCases] = useState<OnlineHarmsCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchName, setSearchName] = useState<string>('');
  
  // Load dashboard stats
  const loadStats = async () => {
    try {
      const res = await fetch('/api/online-harms/admin?action=stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  };
  
  // Load clients
  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/online-harms/admin?action=clients');
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };
  
  // Load cases
  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/online-harms/admin?action=cases');
      const data = await res.json();
      if (data.success) {
        setCases(data.cases);
      }
    } catch (err) {
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };
  
  // Load case detail
  const loadCaseDetail = async (caseId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/online-harms/admin?action=case-detail&caseId=${caseId}&admin=${adminUsername}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.case);
        setActiveView('case-detail');
      } else {
        setError(data.error || 'Failed to load case');
      }
    } catch (err) {
      setError('Failed to load case detail');
    } finally {
      setLoading(false);
    }
  };
  
  // Update case status
  const updateStatus = async (caseId: string, status: string) => {
    try {
      const res = await fetch('/api/online-harms/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          caseId,
          status,
          assignedTo: adminUsername
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Refresh case detail
        loadCaseDetail(caseId);
        // Refresh cases list
        loadCases();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };
  
  // Add admin note
  const addNote = async (caseId: string) => {
    if (!newNote.trim()) return;
    
    try {
      const res = await fetch('/api/online-harms/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addNote',
          caseId,
          note: newNote,
          adminUsername
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setNewNote('');
        loadCaseDetail(caseId);
      }
    } catch (err) {
      alert('Failed to add note');
    }
  };
  
  // Link wellness assessment
  const linkWellness = async (caseId: string, assessmentId: string) => {
    try {
      const res = await fetch('/api/online-harms/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'linkWellness',
          caseId,
          assessmentId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Wellness assessment linked successfully');
        loadCaseDetail(caseId);
      }
    } catch (err) {
      alert('Failed to link wellness assessment');
    }
  };
  
  // Delete client
  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client and all their data? This cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/online-harms/admin?clientId=${clientId}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Client deleted successfully');
        loadClients();
        loadStats();
      }
    } catch (err) {
      alert('Failed to delete client');
    }
  };
  
  // Initial load
  useEffect(() => {
    loadStats();
  }, []);
  
  // Load data when view changes
  useEffect(() => {
    if (activeView === 'clients') {
      loadClients();
    } else if (activeView === 'cases') {
      loadCases();
    }
  }, [activeView]);
  
  // Render Dashboard
  if (activeView === 'dashboard') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🛡️ Online Harms Dashboard</h2>
          <div style={styles.navButtons}>
            <button onClick={() => setActiveView('clients')} style={styles.navButton}>Clients</button>
            <button onClick={() => setActiveView('cases')} style={styles.navButton}>Cases</button>
          </div>
        </div>
        
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalClients}</div>
              <div style={styles.statLabel}>Total Clients</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.totalCases}</div>
              <div style={styles.statLabel}>Total Cases</div>
            </div>
            <div style={{...styles.statCard, borderLeft: `4px solid ${RISK_COLORS.high}`}}>
              <div style={styles.statNumber}>{stats.openCases}</div>
              <div style={styles.statLabel}>Open Cases</div>
            </div>
            <div style={{...styles.statCard, borderLeft: `4px solid ${RISK_COLORS.critical}`}}>
              <div style={styles.statNumber}>{stats.criticalCases}</div>
              <div style={styles.statLabel}>Critical Cases</div>
            </div>
          </div>
        )}
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Cases</h3>
          {stats?.recentCases?.length > 0 ? (
            <div style={styles.caseList}>
              {stats.recentCases.map((c: OnlineHarmsCase) => (
                <div 
                  key={c.caseId} 
                  style={styles.caseItem}
                  onClick={() => loadCaseDetail(c.caseId)}
                >
                  <div style={styles.caseHeader}>
                    <span style={{...styles.riskBadge, background: RISK_COLORS[c.riskLevel]}}>
                      {c.riskLevel.toUpperCase()}
                    </span>
                    <span style={{...styles.statusBadge, background: STATUS_COLORS[c.status]}}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.caseType}>{c.tfgbvType.replace(/_/g, ' ')}</div>
                  <div style={styles.caseDate}>{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No cases yet</p>
          )}
        </div>
      </div>
    );
  }
  
  // Render Clients List
  if (activeView === 'clients') {
    const filteredClients = clients.filter(c => {
      if (!searchName.trim()) return true;
      const searchLower = searchName.toLowerCase();
      return (c.fullName?.toLowerCase().includes(searchLower) || false) ||
             (c.contact?.toLowerCase().includes(searchLower) || false) ||
             c.clientId.toLowerCase().includes(searchLower);
    });
    
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>👥 Clients</h2>
          <button onClick={() => setActiveView('dashboard')} style={styles.backButton}>← Back</button>
        </div>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name, contact, or ID..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : filteredClients.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Client ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>Cases</th>
                  <th style={styles.th}>Consent</th>
                  <th style={styles.th}>Last Activity</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client.clientId} style={styles.tr}>
                    <td style={styles.td}>{client.clientId.slice(0, 8)}...</td>
                    <td style={styles.td}>{client.fullName || '-'}</td>
                    <td style={styles.td}>{client.contact || '-'}</td>
                    <td style={styles.td}>{client.caseCount}</td>
                    <td style={styles.td}>
                      {client.consentGiven ? 
                        <span style={styles.consentYes}>✓ Yes</span> : 
                        <span style={styles.consentNo}>✗ No</span>
                      }
                    </td>
                    <td style={styles.td}>{new Date(client.latestActivity).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => deleteClient(client.clientId)}
                        style={styles.deleteButton}
                        title="Delete all client data"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={styles.emptyText}>No clients yet</p>
        )}
      </div>
    );
  }
  
  // Render Cases List
  if (activeView === 'cases') {
    const filteredCases = cases.filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterRisk !== 'all' && c.riskLevel !== filterRisk) return false;
      return true;
    });
    
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>📋 All Cases</h2>
          <button onClick={() => setActiveView('dashboard')} style={styles.backButton}>← Back</button>
        </div>
        
        <div style={styles.filters}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
            <option value="escalated">Escalated</option>
          </select>
          
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : filteredCases.length > 0 ? (
          <div style={styles.caseList}>
            {filteredCases.map(c => (
              <div 
                key={c.caseId} 
                style={styles.caseCard}
                onClick={() => loadCaseDetail(c.caseId)}
              >
                <div style={styles.caseCardHeader}>
                  <span style={{...styles.riskBadge, background: RISK_COLORS[c.riskLevel]}}>
                    {c.riskLevel.toUpperCase()}
                  </span>
                  <span style={{...styles.statusBadge, background: STATUS_COLORS[c.status]}}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 style={styles.caseTitle}>{c.tfgbvType.replace(/_/g, ' ')}</h4>
                <p style={styles.caseDesc}>{c.description.slice(0, 100)}...</p>
                <div style={styles.caseMeta}>
                  <span>Client: {c.clientId.slice(0, 8)}...</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {!c.consentGiven && (
                  <div style={styles.noConsentWarning}>⚠️ No consent - limited data</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No cases match the filters</p>
        )}
      </div>
    );
  }
  
  // Render Case Detail
  if (activeView === 'case-detail' && selectedCase) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Case Detail</h2>
          <div style={styles.headerActions}>
            {selectedCase.consentGiven && (
              <AdminCaseReviewPDF 
                caseData={selectedCase} 
                adminUsername={adminUsername}
                generatedAt={new Date().toISOString()}
              />
            )}
            <button onClick={() => setActiveView('cases')} style={styles.backButton}>← Back to Cases</button>
          </div>
        </div>
        
        {!selectedCase.consentGiven && (
          <div style={styles.noConsentBanner}>
            ⚠️ User did not consent to data storage. Limited information available.
          </div>
        )}
        
        <div style={styles.caseDetailGrid}>
          {/* Case Info */}
          <div style={styles.detailCard}>
            <h3 style={styles.cardTitle}>Case Information</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Case ID:</span>
              <span style={styles.infoValue}>{selectedCase.caseId}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Client ID:</span>
              <span style={styles.infoValue}>{selectedCase.clientId}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Client Name:</span>
              <span style={styles.infoValue}>{selectedCase.clientFullName || 'Anonymous'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Risk Level:</span>
              <span style={{...styles.riskBadge, background: RISK_COLORS[selectedCase.riskLevel]}}>
                {selectedCase.riskLevel.toUpperCase()}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Type:</span>
              <span style={styles.infoValue}>{selectedCase.tfgbvType.replace(/_/g, ' ')}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Status:</span>
              <select 
                value={selectedCase.status}
                onChange={(e) => updateStatus(selectedCase.caseId, e.target.value)}
                style={styles.statusSelect}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Created:</span>
              <span style={styles.infoValue}>{new Date(selectedCase.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {/* Patient/Client Details */}
          <div style={styles.detailCard}>
            <h3 style={styles.cardTitle}>👤 Patient Information</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Full Name:</span>
              <span style={styles.infoValue}>{selectedCase.clientFullName || 'Not provided'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phone:</span>
              <span style={styles.infoValue}>{selectedCase.clientPhone || 'Not provided'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{selectedCase.clientEmail || 'Not provided'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Client ID:</span>
              <span style={styles.infoValue}>{selectedCase.clientId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={styles.fullWidthSection}>
          <div style={styles.detailCard}>
            <h3 style={styles.cardTitle}>📝 Incident Description</h3>
            <p style={styles.descriptionText}>{selectedCase.description}</p>
            {selectedCase.platforms && selectedCase.platforms.length > 0 && (
              <div style={styles.platforms}>
                <strong>Platforms:</strong> {selectedCase.platforms.join(', ')}
              </div>
            )}
          </div>
        </div>
        
        {/* Diagnosis & Assessment */}
        {selectedCase.consentGiven && selectedCase.assessmentResult && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔍 Diagnosis & Impact Assessment</h3>
            
            {/* Overall Risk */}
            <div style={{...styles.diagnosisCard, borderColor: RISK_COLORS[selectedCase.assessmentResult.overallRisk] || '#6B7280'}}>
              <div style={styles.diagnosisHeader}>
                <span style={styles.diagnosisLabel}>Overall Risk Level:</span>
                <span style={{...styles.riskBadgeLarge, background: RISK_COLORS[selectedCase.assessmentResult.overallRisk] || '#6B7280'}}>
                  {selectedCase.assessmentResult.overallRisk.toUpperCase()}
                </span>
              </div>
              <p style={styles.diagnosisSummary}>{selectedCase.assessmentResult.summary}</p>
              
              <div style={styles.topConcern}>
                <strong>Primary Concern:</strong> {TFGBV_CLUSTERS[selectedCase.assessmentResult.topCluster as keyof typeof TFGBV_CLUSTERS]?.en || selectedCase.assessmentResult.topCluster}
              </div>
            </div>

            {/* Cluster Breakdown */}
            <h4 style={styles.subsectionTitle}>Impact by Category:</h4>
            <div style={styles.clustersGrid}>
              {Object.entries(selectedCase.assessmentResult.clusterLevels).map(([cluster, level]) => (
                <div key={cluster} style={styles.clusterCard}>
                  <div style={styles.clusterHeader}>
                    <span style={styles.clusterNameSmall}>
                      {TFGBV_CLUSTERS[cluster as keyof typeof TFGBV_CLUSTERS]?.en || cluster}
                    </span>
                    <span style={{...styles.clusterBadge, background: RISK_COLORS[level] || '#6B7280'}}>
                      {level}
                    </span>
                  </div>
                  <div style={styles.clusterBarBg}>
                    <div style={{
                      ...styles.clusterBarFill, 
                      width: `${selectedCase.assessmentResult?.rawScores[cluster]}%`,
                      background: RISK_COLORS[level] || '#6B7280'
                    }} />
                  </div>
                  <div style={styles.clusterScore}>
                    Score: {selectedCase.assessmentResult?.rawScores[cluster]}%
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <h4 style={styles.subsectionTitle}>Clinical Recommendations:</h4>
            <ol style={styles.recommendationsList}>
              {selectedCase.assessmentResult.recommendations.map((rec, idx) => (
                <li key={idx} style={styles.recommendationItem}>
                  <span style={styles.recommendationNumber}>{idx + 1}</span>
                  {rec}
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Evidence */}
        {selectedCase.consentGiven && selectedCase.evidence.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Evidence ({selectedCase.evidence.length} items)</h3>
            <div style={styles.evidenceGrid}>
              {selectedCase.evidence.map(ev => (
                <div key={ev.evidenceId} style={styles.evidenceItem}>
                  {ev.type === 'image' || ev.type === 'screenshot' ? (
                    <img 
                      src={ev.content} 
                      alt={ev.filename || 'Evidence'} 
                      style={styles.evidenceImage}
                    />
                  ) : (
                    <div style={styles.evidenceText}>{ev.content.slice(0, 200)}...</div>
                  )}
                  <div style={styles.evidenceMeta}>
                    <span>{ev.filename || ev.type}</span>
                    <span>{ev.tags.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Admin Notes */}
        {selectedCase.consentGiven && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Admin Notes</h3>
            
            <div style={styles.addNote}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                style={styles.noteInput}
                rows={3}
              />
              <button 
                onClick={() => addNote(selectedCase.caseId)}
                style={styles.addNoteButton}
              >
                Add Note
              </button>
            </div>
            
            {selectedCase.adminNotes.length > 0 ? (
              <div style={styles.notesList}>
                {selectedCase.adminNotes.map(note => (
                  <div key={note.noteId} style={styles.noteItem}>
                    <div style={styles.noteHeader}>
                      <strong>{note.adminUsername}</strong>
                      <span style={styles.noteDate}>
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={styles.noteText}>{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No notes yet</p>
            )}
          </div>
        )}
        
        {/* Wellness Referral */}
        {selectedCase.consentGiven && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Wellness Module</h3>
            {selectedCase.wellnessReferral?.referred ? (
              <div style={styles.wellnessLinked}>
                ✓ Linked to wellness assessment: {selectedCase.wellnessReferral.assessmentId?.slice(0, 8)}...
                <br />
                Referred: {new Date(selectedCase.wellnessReferral.referredAt!).toLocaleDateString()}
              </div>
            ) : (
              <div style={styles.wellnessNotLinked}>
                <p>Not yet linked to wellness assessment</p>
                <input 
                  type="text" 
                  placeholder="Assessment ID to link"
                  id="wellness-link-input"
                  style={styles.input}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('wellness-link-input') as HTMLInputElement;
                    if (input.value) {
                      linkWellness(selectedCase.caseId, input.value);
                    }
                  }}
                  style={styles.linkButton}
                >
                  Link Assessment
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Audit Trail */}
        {selectedCase.consentGiven && selectedCase.auditLogs.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Audit Trail</h3>
            <div style={styles.auditList}>
              {selectedCase.auditLogs.map(log => (
                <div key={log.logId} style={styles.auditItem}>
                  <span style={styles.auditAction}>{log.action.replace(/_/g, ' ')}</span>
                  <span style={styles.auditUser}>{log.adminUsername || 'System'}</span>
                  <span style={styles.auditTime}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
    color: '#1f2937',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  navButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  backButton: {
    padding: '8px 16px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #667eea',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#374151',
  },
  caseList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  caseItem: {
    background: 'white',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  caseHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  caseType: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    textTransform: 'capitalize',
  },
  caseDate: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  riskBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    background: '#f9fafb',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#374151',
  },
  consentYes: {
    color: '#22C55E',
    fontWeight: 500,
  },
  consentNo: {
    color: '#DC2626',
    fontWeight: 500,
  },
  deleteButton: {
    background: '#fee2e2',
    color: '#DC2626',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  searchBox: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
  },
  select: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: 'white',
  },
  caseCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  caseCardHeader: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  caseTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    textTransform: 'capitalize',
  },
  caseDesc: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  caseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#9ca3af',
  },
  noConsentWarning: {
    marginTop: '12px',
    padding: '8px 12px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '6px',
    fontSize: '12px',
  },
  noConsentBanner: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  caseDetailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '32px',
  },
  detailCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  infoLabel: {
    fontWeight: 500,
    color: '#6b7280',
  },
  infoValue: {
    color: '#374151',
  },
  statusSelect: {
    padding: '4px 12px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
  },
  descriptionText: {
    lineHeight: 1.6,
    color: '#374151',
  },
  platforms: {
    marginTop: '16px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    fontSize: '14px',
  },
  evidenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  evidenceItem: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  evidenceImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  evidenceText: {
    padding: '12px',
    fontSize: '13px',
    color: '#374151',
  },
  evidenceMeta: {
    padding: '8px 12px',
    background: '#f9fafb',
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    justifyContent: 'space-between',
  },
  addNote: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  noteInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    resize: 'vertical',
  },
  addNoteButton: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  noteItem: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  noteDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  noteText: {
    margin: 0,
    lineHeight: 1.5,
  },
  wellnessLinked: {
    background: '#dcfce7',
    padding: '16px',
    borderRadius: '8px',
    color: '#166534',
  },
  wellnessNotLinked: {
    background: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginRight: '8px',
  },
  linkButton: {
    padding: '8px 16px',
    background: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  auditItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    fontSize: '14px',
  },
  auditAction: {
    color: '#667eea',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  auditUser: {
    color: '#6b7280',
  },
  auditTime: {
    color: '#9ca3af',
    fontSize: '12px',
  },
  // New styles for enhanced case detail
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  fullWidthSection: {
    marginBottom: '32px',
  },
  // Diagnosis section styles
  diagnosisCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '3px solid',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  diagnosisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  diagnosisLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
  },
  riskBadgeLarge: {
    padding: '8px 20px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  diagnosisSummary: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#4b5563',
    margin: '0 0 16px 0',
  },
  topConcern: {
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#92400e',
  },
  subsectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#4b5563',
    margin: '24px 0 12px 0',
  },
  clustersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  clusterCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  clusterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  clusterNameSmall: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
  },
  clusterBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clusterBarBg: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  clusterBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  clusterScore: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'right',
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  recommendationItem: {
    fontSize: '14px',
    color: '#374151',
    margin: '12px 0',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    lineHeight: 1.5,
  },
  recommendationNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: '#667eea',
    color: 'white',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
};
