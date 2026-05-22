'use client';

import { useRef, useCallback } from 'react';
import { FollowUpResult } from '@/lib/followUpAssessment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExtendedAssessmentReportProps {
  result: FollowUpResult;
  username: string;
  accountId: string;
  onClose: () => void;
  responses?: Record<string, number>;
}

const CLUSTERS = {
  reexperiencing: { name: 'Re-experiencing', questions: ['ptsd_1', 'ptsd_2', 'ptsd_3', 'ptsd_4'] },
  avoidance: { name: 'Avoidance', questions: ['ptsd_5', 'ptsd_6'] },
  hyperarousal: { name: 'Hyperarousal', questions: ['ptsd_7', 'ptsd_8', 'ptsd_9', 'ptsd_10'] },
  'affect dysregulation': { name: 'Affect Dysregulation', questions: ['anxiety_1', 'anxiety_2'] },
  'negative self concept': { name: 'Negative Self-Concept', questions: ['depression_1', 'depression_2', 'depression_3'] },
  'disturbed relationships': { name: 'Disturbed Relationships', questions: ['functioning_1', 'functioning_2', 'wellness_1'] }
};

export default function ExtendedAssessmentReport({ result, username, accountId, onClose, responses }: ExtendedAssessmentReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return '#22C55E';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = { low: 'LOW', moderate: 'MODERATE', high: 'HIGH', critical: 'CRITICAL' };
    return labels[risk] || risk.toUpperCase();
  };

  const calculateClusterScores = () => {
    if (!responses) return null;
    const clusterScores: Record<string, { score: number; max: number; percentage: number; level: string }> = {};
    Object.entries(CLUSTERS).forEach(([key, cluster]) => {
      let total = 0, count = 0;
      cluster.questions.forEach(qId => { if (responses[qId] !== undefined) { total += responses[qId]; count++; } });
      const max = count * 4;
      const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
      let level = 'low'; if (percentage > 66) level = 'high'; else if (percentage > 33) level = 'moderate';
      clusterScores[key] = { score: total, max, percentage, level };
    });
    return clusterScores;
  };

  const clusterScores = calculateClusterScores();
  const topCluster = clusterScores ? Object.entries(clusterScores).sort((a, b) => b[1].percentage - a[1].percentage)[0] : null;

  const downloadPDF = useCallback(async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    let imgY = 0, remainingHeight = imgHeight, position = 0;
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    remainingHeight -= pdfHeight / ratio;
    while (remainingHeight > 0) {
      position = remainingHeight - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      remainingHeight -= pdfHeight / ratio;
    }
    pdf.save(`CAT-Wellness-Report-${username}.pdf`);
  }, [username]);

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <button onClick={downloadPDF} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
        <span>📥</span> Download PDF Report
      </button>

      <div ref={reportRef} style={{ background: 'white', padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: "Arial, sans-serif", color: '#1f2937', lineHeight: 1.6 }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '60px', height: '60px', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', borderRadius: '4px' }}>CAT</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>CENTRE AGAINST TORTURE</h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Protecting Human Rights • Kenya</p>
            </div>
          </div>
          <div style={{ height: '3px', background: '#1e40af', borderRadius: '2px' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px 0', borderBottom: '2px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', letterSpacing: '1px' }}>WELLNESS DIAGNOSIS REPORT</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Centre Against Torture - Kenya</p>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div><p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: 500 }}>Client ID:</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{accountId.slice(0, 8)}</p></div>
            <div><p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: 500 }}>Username:</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{username}</p></div>
            <div><p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: 500 }}>Date:</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{reportDate}</p></div>
            <div><p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: 500 }}>Type:</p><p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Comprehensive Assessment</p></div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>1. OVERALL RISK ASSESSMENT</h2>
          <div style={{ borderRadius: '8px', padding: '20px', border: '3px solid ' + getRiskColor(result.severity === 'severe' ? 'critical' : result.severity === 'moderate' ? 'high' : result.severity), background: '#f8fafc' }}>
            <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', background: getRiskColor(result.severity === 'severe' ? 'critical' : result.severity === 'moderate' ? 'high' : result.severity) }}>
              {getRiskLabel(result.severity === 'severe' ? 'critical' : result.severity === 'moderate' ? 'high' : result.severity)}
            </div>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, margin: 0 }}>
              {result.overallTrend === 'improving' ? 'Your responses indicate positive progress across assessed domains. Continue with current strategies.' : result.overallTrend === 'worsening' ? 'Your responses suggest increased distress. We recommend scheduling a consultation with a mental health professional.' : 'Your responses suggest generally stable mental health across all assessed domains. Continue monitoring your wellbeing.'}
            </p>
          </div>
        </div>

        {topCluster && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>2. PRIMARY CONCERN AREA</h2>
            <div style={{ borderRadius: '8px', padding: '20px', border: '3px solid ' + getRiskColor(topCluster[1].level), background: '#f8fafc' }}>
              <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', background: getRiskColor(topCluster[1].level) }}>
                {topCluster[1].percentage}% - {getRiskLabel(topCluster[1].level)}
              </div>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>{CLUSTERS[topCluster[0] as keyof typeof CLUSTERS]?.name}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Score: {topCluster[1].score} / {topCluster[1].max}</p>
            </div>
          </div>
        )}

        {clusterScores && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>3. DETAILED CLUSTER ANALYSIS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(CLUSTERS).map(([key, cluster]) => {
                const scores = clusterScores[key];
                if (!scores) return null;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ width: '180px', fontSize: '14px', fontWeight: 500, color: '#374151', flexShrink: 0 }}>{cluster.name}</div>
                    <div style={{ flex: 1, height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '6px', transition: 'width 0.3s ease', width: `${scores.percentage}%`, background: getRiskColor(scores.level) }} />
                    </div>
                    <div style={{ width: '100px', fontSize: '13px', fontWeight: 600, textAlign: 'right', flexShrink: 0, color: getRiskColor(scores.level) }}>
                      {scores.percentage}% - {getRiskLabel(scores.level)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>4. DOMAIN SCORES</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['PTSD Symptoms', 'Anxiety', 'Depression', 'Functioning', 'Wellness'].map((label, idx) => {
              const scores = [result.ptsdScore, result.anxietyScore, result.depressionScore, result.functioningScore, result.wellnessScore];
              const score = scores[idx];
              const isFunctioning = idx === 3 || idx === 4;
              const color = isFunctioning ? (score > 70 ? '#22C55E' : score > 40 ? '#F59E0B' : '#EF4444') : getRiskColor(score > 70 ? 'high' : score > 40 ? 'moderate' : 'low');
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ width: '180px', fontSize: '14px', fontWeight: 500, color: '#374151', flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '6px', transition: 'width 0.3s ease', width: `${score}%`, background: color }} />
                  </div>
                  <div style={{ width: '100px', fontSize: '13px', fontWeight: 600, textAlign: 'right', flexShrink: 0, color: color }}>{score}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>5. RECOMMENDED WAY FORWARD</h2>
          <ol style={{ margin: 0, paddingLeft: '24px' }}>
            {result.recommendations.map((rec, i) => (
              <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', background: '#1e40af', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #1e40af', letterSpacing: '0.5px' }}>6. EMERGENCY CONTACTS & SUPPORT</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#1e40af', color: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>🏢 Centre Against Torture</p>
              <p style={{ fontSize: '12px', margin: '2px 0', opacity: 0.9 }}>support@catkenya.org</p>
              <p style={{ fontSize: '12px', margin: '2px 0', opacity: 0.9 }}>Mental Health Support</p>
            </div>
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>Police Emergency</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: '4px 0 0 0' }}>999</p>
            </div>
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>GBV Hotline</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: '4px 0 0 0' }}>1195</p>
            </div>
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>Child Helpline</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: '4px 0 0 0' }}>116</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', lineHeight: 1.5 }}>This report is confidential and intended for the named individual only. For support, contact Centre Against Torture Kenya.</p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '8px 0 0 0' }}>Client ID: {accountId} | Generated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <button onClick={onClose} style={{ background: '#f3f4f6', color: '#374151', border: '2px solid #e5e7eb', padding: '14px 28px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '20px auto 0' }}>
        ← Return to Dashboard
      </button>
    </div>
  );
}
