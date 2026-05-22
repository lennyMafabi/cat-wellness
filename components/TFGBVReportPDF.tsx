'use client';

import { useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { TfgbvAnalysisResult, TfgbvLanguage } from '@/data/tfgbvQuestions';
import { TFGBV_CLUSTERS } from '@/data/tfgbvQuestions';
import type { TfgbvType } from '@/types/onlineHarms';

interface TFGBVReportPDFProps {
  clientId: string;
  caseId: string;
  caseReference: string;
  tfgbvType: TfgbvType;
  description: string;
  platforms: string[];
  analysis: TfgbvAnalysisResult;
  language: TfgbvLanguage;
  fullName?: string;
  submittedAt: string;
}

export default function TFGBVReportPDF({
  clientId,
  caseId,
  caseReference,
  tfgbvType,
  description,
  platforms,
  analysis,
  language,
  fullName,
  submittedAt
}: TFGBVReportPDFProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const t = useCallback((translations: Record<TfgbvLanguage, string>) => {
    return translations[language];
  }, [language]);

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
    const labels: Record<string, Record<TfgbvLanguage, string>> = {
      low: { en: 'LOW', sw: 'CHINI', kal: 'CHINI' },
      moderate: { en: 'MODERATE', sw: 'WASTANI', kal: 'WASTANI' },
      high: { en: 'HIGH', sw: 'JUJU', kal: 'JUJU' },
      critical: { en: 'CRITICAL', sw: 'HATARI', kal: 'HATARI' }
    };
    return labels[risk]?.[language] || risk.toUpperCase();
  };

  const getTfgbvTypeLabel = (type: TfgbvType) => {
    const labels: Record<TfgbvType, Record<TfgbvLanguage, string>> = {
      sextortion: { en: 'Sextortion', sw: 'Sextortion', kal: 'Sextortion' },
      cyberstalking: { en: 'Cyberstalking', sw: 'Kufuatilia Mtandaoni', kal: 'Cyberstalking' },
      'non-consensual_sharing': { en: 'Non-Consensual Image Sharing', sw: 'Kusambaza Picha Bila Idhini', kal: 'Non-Consensual Image Sharing' },
      deepfake: { en: 'Deepfake/AI Content', sw: 'Deepfake', kal: 'Deepfake' },
      harassment: { en: 'Online Harassment', sw: 'Uharifu Mtandaoni', kal: 'Uharifu' },
      misinformation: { en: 'Misinformation', sw: 'Uongo', kal: 'Misinformation' },
      identity_theft: { en: 'Identity Theft', sw: 'Wizi wa Utambulisho', kal: 'Identity Theft' },
      other: { en: 'Other', sw: 'Nyingine', kal: 'Other' }
    };
    return labels[type]?.[language] || type;
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let imgY = 0;
    let remainingHeight = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    remainingHeight -= pdfHeight / ratio;
    
    // Add additional pages if content overflows
    while (remainingHeight > 0) {
      position = remainingHeight - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      remainingHeight -= pdfHeight / ratio;
    }
    
    pdf.save(`TFGBV-Report-${caseReference}.pdf`);
  };

  const summaryText = language === 'sw' ? analysis.summarySw : language === 'kal' ? analysis.summaryKal : analysis.summary;
  const recommendations = language === 'sw' ? analysis.recommendationsSw : language === 'kal' ? analysis.recommendationsKal : analysis.recommendations;

  return (
    <div>
      {/* Download Button */}
      <button 
        onClick={downloadPDF}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 auto 20px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
      >
        <span>📥</span>
        {t({ en: 'Download PDF Report', sw: 'Pakua Ripoti PDF', kal: 'Download PDF Report' })}
      </button>

      {/* Report Content (for PDF generation) */}
      <div ref={reportRef} style={reportStyles.container}>
        {/* Letterhead / Header */}
        <div style={reportStyles.letterhead}>
          <div style={reportStyles.letterheadTop}>
            <div style={reportStyles.catLogo}>CAT</div>
            <div style={reportStyles.letterheadText}>
              <h1 style={reportStyles.orgName}>CENTRE AGAINST TORTURE</h1>
              <p style={reportStyles.orgTagline}>Protecting Human Rights • Kenya</p>
            </div>
          </div>
          <div style={reportStyles.letterheadLine} />
        </div>

        {/* Report Title */}
        <div style={reportStyles.header}>
          <h1 style={reportStyles.title}>
            {t({ en: 'TFGBV DIAGNOSIS REPORT', sw: 'RIPOTI YA UTAMBUZI WA TFGBV', kal: 'TFGBV DIAGNOSIS REPORT' })}
          </h1>
          <p style={reportStyles.subtitle}>
            {t({ en: 'Centre Against Torture - Kenya', sw: 'Centre Against Torture - Kenya', kal: 'Centre Against Torture - Kenya' })}
          </p>
        </div>

        {/* Case Info */}
        <div style={reportStyles.caseInfoBox}>
          <div style={reportStyles.infoGrid}>
            <div>
              <p style={reportStyles.infoLabel}>{t({ en: 'Case Reference:', sw: 'Kumbu Kumbu:', kal: 'Case Reference:' })}</p>
              <p style={reportStyles.infoValue}>{caseReference}</p>
            </div>
            <div>
              <p style={reportStyles.infoLabel}>{t({ en: 'Date Submitted:', sw: 'Tarehe Iliyotumwa:', kal: 'Date Submitted:' })}</p>
              <p style={reportStyles.infoValue}>{new Date(submittedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={reportStyles.infoLabel}>{t({ en: 'Report Type:', sw: 'Aina ya Ripoti:', kal: 'Report Type:' })}</p>
              <p style={reportStyles.infoValue}>{getTfgbvTypeLabel(tfgbvType)}</p>
            </div>
            {fullName && (
              <div>
                <p style={reportStyles.infoLabel}>{t({ en: 'Name:', sw: 'Jina:', kal: 'Name:' })}</p>
                <p style={reportStyles.infoValue}>{fullName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Overall Risk Assessment */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '1. OVERALL RISK ASSESSMENT', sw: '1. TATHMINI YA HATARI JUU', kal: '1. OVERALL RISK ASSESSMENT' })}
          </h2>
          <div style={{ ...reportStyles.riskBox, borderColor: getRiskColor(analysis.overallRisk) }}>
            <div style={{ ...reportStyles.riskBadge, background: getRiskColor(analysis.overallRisk) }}>
              {getRiskLabel(analysis.overallRisk)}
            </div>
            <p style={reportStyles.riskDescription}>{summaryText}</p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '2. DETAILED IMPACT ANALYSIS', sw: '2. UCHAMBUZI WA KINA WA ATHARI', kal: '2. DETAILED IMPACT ANALYSIS' })}
          </h2>
          <div style={reportStyles.clustersTable}>
            {Object.entries(analysis.clusterLevels).map(([cluster, level]) => (
              <div key={cluster} style={reportStyles.clusterRow}>
                <div style={reportStyles.clusterName}>
                  {t(TFGBV_CLUSTERS[cluster as keyof typeof TFGBV_CLUSTERS])}
                </div>
                <div style={reportStyles.clusterBarContainer}>
                  <div style={{ ...reportStyles.clusterBar, width: `${analysis.rawScores[cluster]}%`, background: getRiskColor(level) }} />
                </div>
                <div style={{ ...reportStyles.clusterLevel, color: getRiskColor(level) }}>
                  {analysis.rawScores[cluster]}% - {getRiskLabel(level)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Summary */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '3. INCIDENT SUMMARY', sw: '3. MUHTASARI WA TUKIO', kal: '3. INCIDENT SUMMARY' })}
          </h2>
          <div style={reportStyles.incidentBox}>
            <p style={reportStyles.incidentLabel}>{t({ en: 'Platforms Affected:', sw: 'Majukwaa Yaliyoathirika:', kal: 'Platforms Affected:' })}</p>
            <p style={reportStyles.incidentValue}>{platforms.join(', ') || t({ en: 'Not specified', sw: 'Haijatajwa', kal: 'Not specified' })}</p>
            
            <p style={reportStyles.incidentLabel}>{t({ en: 'Description:', sw: 'Maelezo:', kal: 'Description:' })}</p>
            <p style={reportStyles.incidentDescription}>{description}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '4. RECOMMENDED WAY FORWARD', sw: '4. Njia Iliyopendekezwa ya Kuelekea Mbele', kal: '4. RECOMMENDED WAY FORWARD' })}
          </h2>
          <ol style={reportStyles.recommendationsList}>
            {recommendations.map((rec, i) => (
              <li key={i} style={reportStyles.recommendationItem}>
                <span style={reportStyles.recommendationNumber}>{i + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Legal Rights */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '5. YOUR LEGAL RIGHTS', sw: '5. HAKI ZAKO ZA KISHERIA', kal: '5. YOUR LEGAL RIGHTS' })}
          </h2>
          <div style={reportStyles.legalBox}>
            <p style={reportStyles.legalText}>
              {t({
                en: 'Under the Computer Misuse and Cybercrimes Act 2018 of Kenya, you have the right to:',
                sw: 'Kwa mujibu wa Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao 2018 ya Kenya, una haki ya:',
                kal: 'Under Computer Misuse ak Cybercrimes Act 2018 Kenya, right to:'
              })}
            </p>
            <ul style={reportStyles.legalList}>
              <li>{t({ en: 'Report online harassment to the police', sw: 'Kuripoti uharifu mtandaoni kwa polisi', kal: 'Report online harassment police' })}</li>
              <li>{t({ en: 'Seek a protection order from the court', sw: 'Kutafuta amri ya ulinzi kutoka mahakamani', kal: 'Seek protection order court' })}</li>
              <li>{t({ en: 'Demand content removal from platforms', sw: 'Kudai kuondolewa kwa maudhui kutoka majukwaa', kal: 'Demand content removal platforms' })}</li>
              <li>{t({ en: 'Access free legal aid services', sw: 'Kufikia huduma za msaada wa kisheria bila malipo', kal: 'Access free legal aid' })}</li>
            </ul>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div style={reportStyles.section}>
          <h2 style={reportStyles.sectionTitle}>
            {t({ en: '6. EMERGENCY CONTACTS & SUPPORT', sw: '6. MAWASILIANO YA DHARURA NA USAIDIZI', kal: '6. EMERGENCY CONTACTS SUPPORT' })}
          </h2>
          <div style={reportStyles.contactsGrid}>
            <div style={{...reportStyles.contactCard, ...reportStyles.catContactCard}}>
              <p style={reportStyles.contactName}>{t({ en: '🏢 Centre Against Torture', sw: '🏢 Centre Against Torture', kal: '🏢 Centre Against Torture' })}</p>
              <p style={reportStyles.contactDetail}>support@catkenya.org</p>
              <p style={reportStyles.contactDetail}>{t({ en: 'TFGBV Support Services', sw: 'Huduma za Usaidizi wa TFGBV', kal: 'TFGBV Support Services' })}</p>
            </div>
            <div style={reportStyles.contactCard}>
              <p style={reportStyles.contactName}>{t({ en: 'Police Emergency', sw: 'Dharura ya Polisi', kal: 'Police Emergency' })}</p>
              <p style={reportStyles.contactNumber}>999</p>
            </div>
            <div style={reportStyles.contactCard}>
              <p style={reportStyles.contactName}>{t({ en: 'GBV Hotline', sw: 'Laini ya GBV', kal: 'GBV Hotline' })}</p>
              <p style={reportStyles.contactNumber}>1195</p>
            </div>
            <div style={reportStyles.contactCard}>
              <p style={reportStyles.contactName}>{t({ en: 'Child Helpline', sw: 'Laini ya Watoto', kal: 'Child Helpline' })}</p>
              <p style={reportStyles.contactNumber}>116</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={reportStyles.footer}>
          <p style={reportStyles.footerText}>
            {t({
              en: 'This report is confidential and intended for the named individual only. For support, contact Centre Against Torture Kenya.',
              sw: 'Ripoti hii ni ya siri na imekusudiwa kwa mtu aliyetajwa pekee. Kwa usaidizi, wasiliana na Centre Against Torture Kenya.',
              kal: 'Report confidential intended named individual only. Support contact Centre Against Torture Kenya.'
            })}
          </p>
          <p style={reportStyles.footerNote}>
            Case ID: {caseId} | Client ID: {clientId}
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles for the PDF report
const reportStyles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    color: '#1f2937',
    lineHeight: 1.6,
  },
  // Letterhead styles
  letterhead: {
    marginBottom: '20px',
  },
  letterheadTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  catLogo: {
    width: '60px',
    height: '60px',
    background: '#1e40af',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: '3px solid #f59e0b',
  },
  letterheadText: {
    flex: 1,
  },
  orgName: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0 0 4px 0',
    letterSpacing: '1px',
  },
  orgTagline: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    fontStyle: 'italic',
  },
  letterheadLine: {
    height: '4px',
    background: 'linear-gradient(90deg, #1e40af 0%, #f59e0b 50%, #dc2626 100%)',
    borderRadius: '2px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '3px solid #667eea',
    paddingBottom: '20px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  caseInfoBox: {
    background: '#f3f4f6',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  infoLabel: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb',
  },
  riskBox: {
    border: '3px solid',
    borderRadius: '12px',
    padding: '20px',
    background: '#fafafa',
  },
  riskBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  riskDescription: {
    fontSize: '15px',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.6,
  },
  clustersTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  clusterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  clusterName: {
    width: '150px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  clusterBarContainer: {
    flex: 1,
    height: '20px',
    background: '#e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  clusterBar: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s',
  },
  clusterLevel: {
    width: '100px',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'right',
  },
  incidentBox: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
  },
  incidentLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6b7280',
    margin: '0 0 4px 0',
  },
  incidentValue: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 16px 0',
  },
  incidentDescription: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: '0',
    listStyle: 'none',
  },
  recommendationItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.6,
  },
  recommendationNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  legalBox: {
    background: '#ede9fe',
    borderRadius: '8px',
    padding: '16px',
    borderLeft: '4px solid #6d28d9',
  },
  legalText: {
    fontSize: '14px',
    color: '#5b21b6',
    margin: '0 0 12px 0',
  },
  legalList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#6d28d9',
  },
  contactsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  contactCard: {
    background: '#fef2f2',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  catContactCard: {
    background: '#dbeafe',
    border: '2px solid #2563eb',
    gridColumn: 'span 2',
  },
  contactName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e40af',
    margin: '0 0 8px 0',
  },
  contactNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#dc2626',
    margin: 0,
  },
  contactDetail: {
    fontSize: '13px',
    color: '#374151',
    margin: '4px 0',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  footerNote: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: 0,
  },
};
