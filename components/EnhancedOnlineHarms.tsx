'use client';

import { useState, useCallback, useRef } from 'react';
import type { TfgbvType, RiskLevel, EvidenceType } from '@/types/onlineHarms';
import { 
  TFGBV_QUESTIONS, 
  TFGBV_ANSWER_OPTIONS, 
  TFGBV_CLUSTERS,
  analyzeTfgbvResponses,
  type TfgbvAnalysisResult,
  type TfgbvLanguage
} from '@/data/tfgbvQuestions';
import { 
  LEGAL_GUIDANCE_BY_TYPE, 
  PLATFORM_REPORTING_GUIDES, 
  SAFETY_TIPS,
  EMERGENCY_RESOURCES
} from '@/data/tfgbvGuidance';
import TFGBVReportPDF from './TFGBVReportPDF';
import ChatWidget from './ChatWidget';

interface EnhancedOnlineHarmsProps {
  onClose: () => void;
  onComplete: (data: {
    clientId: string;
    caseId: string;
    tfgbvAnalysis: TfgbvAnalysisResult;
    wellnessAssessmentNeeded: boolean;
  }) => void;
  userName?: string;
  userPhone?: string;
}

type Step = 
  | 'language-select'
  | 'consent'
  | 'report-form'
  | 'legal-guidance'
  | 'safety-tips'
  | 'tfgbv-assessment'
  | 'submitting'
  | 'diagnosis'
  | 'contacts'
  | 'limited';

const TFGBV_TYPES: { value: TfgbvType; icon: string; translations: Record<TfgbvLanguage, string> }[] = [
  { 
    value: 'sextortion', 
    icon: '📸',
    translations: {
      en: 'Sextortion (Threatening to share private images)',
      sw: 'Sextortion (Kutisha kusambaza picha za faragha)',
      kal: 'Sextortion (Threaten distribute private images)'
    }
  },
  { 
    value: 'cyberstalking', 
    icon: '👁️',
    translations: {
      en: 'Cyberstalking (Persistent online harassment)',
      sw: 'Kufuatilia Mtandaoni (Uharifu endelevu)',
      kal: 'Cyberstalking (Persistent harassment)'
    }
  },
  { 
    value: 'non-consensual_sharing', 
    icon: '📤',
    translations: {
      en: 'Non-consensual Image Sharing',
      sw: 'Kusambaza Picha Bila Idhini',
      kal: 'Non-consensual Image Sharing'
    }
  },
  { 
    value: 'deepfake', 
    icon: '🎭',
    translations: {
      en: 'Deepfake/ manipulated images or videos',
      sw: 'Deepfake/ picha au video zilizohaririwa',
      kal: 'Deepfake/ manipulated images ak videos'
    }
  },
  { 
    value: 'harassment', 
    icon: '💬',
    translations: {
      en: 'Online Harassment & Bullying',
      sw: 'Uharifu na Udhalimu Mtandaoni',
      kal: 'Online Harassment ak Bullying'
    }
  },
  { 
    value: 'identity_theft', 
    icon: '🎭',
    translations: {
      en: 'Identity Theft/Impersonation',
      sw: 'Wizi wa Utambulisho/Kujifanya',
      kal: 'Identity Theft/Impersonation'
    }
  }
];

const PLATFORMS = ['Facebook', 'WhatsApp', 'Instagram', 'Twitter/X', 'TikTok', 'Telegram', 'Email', 'Other'];

export default function EnhancedOnlineHarms({ onClose, onComplete, userName, userPhone }: EnhancedOnlineHarmsProps) {
  // Language state
  const [language, setLanguage] = useState<TfgbvLanguage>('en');
  
  // Step management
  const [step, setStep] = useState<Step>('language-select');
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    tfgbvType: null as TfgbvType | null,
    description: '',
    platforms: [] as string[],
    consentGiven: false,
    evidence: [] as { type: EvidenceType; content: string; filename: string; mimeType: string }[]
  });
  
  // Assessment data
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [analysis, setAnalysis] = useState<TfgbvAnalysisResult | null>(null);
  
  // Submission data
  const [caseReference, setCaseReference] = useState('');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Translation helper
  const t = (translations: Record<TfgbvLanguage, string>) => translations[language];

  const stepLabels: Record<Step, Record<TfgbvLanguage, string>> = {
    'language-select': { en: 'Select Language', sw: 'Chagua Lugha', kal: 'Select Language' },
    'consent': { en: 'Data Consent', sw: 'Idhini ya Data', kal: 'Data Consent' },
    'report-form': { en: 'Report Incident', sw: 'Ripoti Tukio', kal: 'Report Incident' },
    'legal-guidance': { en: 'Legal Guidance', sw: 'Mwongozo wa Kisheria', kal: 'Legal Guidance' },
    'safety-tips': { en: 'Safety Tips', sw: 'Vidokezo vya Usalama', kal: 'Safety Tips' },
    'tfgbv-assessment': { en: 'Impact Assessment', sw: 'Tathmini ya Athari', kal: 'Impact Assessment' },
    'submitting': { en: 'Submitting...', sw: 'Inatuma...', kal: 'Submitting...' },
    'diagnosis': { en: 'Diagnosis Report', sw: 'Ripoti ya Utambuzi', kal: 'Diagnosis Report' },
    'contacts': { en: 'Support Contacts', sw: 'Mawasiliano ya Msaada', kal: 'Support Contacts' },
    'limited': { en: 'Limited Mode', sw: 'Hali ya Kikomo', kal: 'Limited Mode' }
  };

  // Language Selection
  if (step === 'language-select') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>🌐 Select Language / Chagua Lugha</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.content}>
            <div style={styles.languageGrid}>
              <button 
                onClick={() => { setLanguage('en'); setStep('consent'); }}
                style={styles.languageButton}
              >
                <span style={styles.languageFlag}>🇬🇧</span>
                <span style={styles.languageName}>English</span>
              </button>
              <button 
                onClick={() => { setLanguage('sw'); setStep('consent'); }}
                style={styles.languageButton}
              >
                <span style={styles.languageFlag}>🇹🇿</span>
                <span style={styles.languageName}>Kiswahili</span>
              </button>
              <button 
                onClick={() => { setLanguage('kal'); setStep('consent'); }}
                style={styles.languageButton}
              >
                <span style={styles.languageFlag}>🇰🇪</span>
                <span style={styles.languageName}>Kalenjin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Consent Step
  if (step === 'consent') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>{t({ en: '🔒 Data Consent Required', sw: '🔒 Idhini ya Data Inahitajika', kal: '🔒 Data Consent Required' })}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.content}>
            <div style={styles.consentBox}>
              <p style={styles.consentText}>
                {t({
                  en: 'Before we can help you, we need your consent to securely store your information. Authorized support staff will be able to access this data to assist you. This includes: collecting your report, providing legal guidance, assessing your situation, and connecting you with support services.',
                  sw: 'Kabla ya kukusaidia, tunahitaji idhini yako kuhifadhi taarifa zako kwa usalama. Wafanyakazi walioidhinishwa wataweza kufikia data hii kukusaidia. Hii ni pamoja na: kukusanya ripoti yako, kutoa mwongozo wa kisheria, kutathmini hali yako, na kukuunganisha na huduma za usaidizi.',
                  kal: 'Before help you, need consent store information securely. Authorized staff access data assist you. Collect report, provide legal guidance, assess situation, connect support services.'
                })}
              </p>
              
              <div style={styles.consentCheckbox}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    {t({
                      en: 'I consent to my information being securely stored and accessed by authorized administrators for support and reporting purposes. I understand this includes legal guidance, safety recommendations, and psychological assessment.',
                      sw: 'Nakubali taarifa zangu kuhifadhiwa kwa usalama na kufikiwa na wasimamizi walioidhinishwa kwa madhumuni ya usaidizi na ureporting. Naelewa hii ni pamoja na mwongozo wa kisheria, mapendekezo ya usalama, na tathmini ya kisaikolojia.',
                      kal: 'Consent information stored securely accessed authorized administrators support reporting purposes. Understand includes legal guidance, safety recommendations, psychological assessment.'
                    })}
                  </span>
                </label>
              </div>
              
              <div style={styles.buttonGroup}>
                <button 
                  onClick={() => { setFormData(prev => ({ ...prev, consentGiven: true })); setStep('report-form'); }}
                  disabled={!consentGiven}
                  style={consentGiven ? styles.primaryButton : styles.disabledButton}
                >
                  {t({ en: 'Continue with Consent →', sw: 'Endelea na Idhini →', kal: 'Continue Consent' })}
                </button>
                <button 
                  onClick={() => setStep('limited')}
                  style={styles.secondaryButton}
                >
                  {t({ en: 'I Do Not Consent - Limited Mode', sw: 'Sikubali - Hali ya Kikomo', kal: 'Maam Consent - Limited Mode' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Report Form
  if (step === 'report-form') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>{t({ en: '🚨 Report Online Harm', sw: '🚨 Ripoti Ukatili Mtandaoni', kal: '🚨 Report Online Harm' })}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.content}>
            {error && <div style={styles.errorBox}>{error}</div>}
            
            {/* Contact Info */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {t({ en: 'Your Information (Optional)', sw: 'Taarifa Zako (Si Lazima)', kal: 'Information (Optional)' })}
              </h3>
              <input
                type="text"
                placeholder={t({ en: 'Full Name', sw: 'Jina Kamili', kal: 'Full Name' })}
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                style={styles.input}
              />
              <input
                type="tel"
                placeholder={t({ en: 'Phone Number', sw: 'Namba ya Simu', kal: 'Phone Number' })}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={styles.input}
              />
              <input
                type="email"
                placeholder={t({ en: 'Email Address', sw: 'Barua Pepe', kal: 'Email' })}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={styles.input}
              />
            </div>
            
            {/* Incident Type */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {t({ en: 'What happened? *', sw: 'Nini kilijitokeza? *', kal: 'What happened? *' })}
              </h3>
              <div style={styles.typeGrid}>
                {TFGBV_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(prev => ({ ...prev, tfgbvType: type.value }))}
                    style={formData.tfgbvType === type.value ? styles.typeButtonActive : styles.typeButton}
                  >
                    <span style={styles.typeIcon}>{type.icon}</span>
                    <span style={styles.typeLabel}>{t(type.translations)}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Platforms */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {t({ en: 'Platform(s) where it happened', sw: 'Jukwaa ambapo lilitokea', kal: 'Platforms' })}
              </h3>
              <div style={styles.platformGrid}>
                {PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      platforms: prev.platforms.includes(platform)
                        ? prev.platforms.filter(p => p !== platform)
                        : [...prev.platforms, platform]
                    }))}
                    style={formData.platforms.includes(platform) ? styles.platformButtonActive : styles.platformButton}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Description */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {t({ en: 'Describe what happened *', sw: 'Eleza kilichotokeza *', kal: 'Describe happened *' })}
              </h3>
              <textarea
                placeholder={t({
                  en: 'Please describe the incident in detail. Include dates, what was shared/threatened, who was involved, and any other relevant information...',
                  sw: 'Tafadhali eleza tukio kwa undani. Jumuisha tarehe, kilichoshirikiwa/kutishiwa, ni nani alihusika, na taarifa nyingine zinazohusiana...',
                  kal: 'Describe incident detail. Include dates, shared/threatened, involved, relevant information...'
                })}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={styles.textarea}
                rows={5}
              />
            </div>

            {/* Evidence Upload */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {t({ en: 'Upload Evidence (Screenshots/Photos)', sw: 'Pakia Ushahidi (Screenshots/Picha)', kal: 'Upload Evidence' })}
              </h3>
              <p style={styles.evidenceHelp}>
                {t({
                  en: 'Upload screenshots, photos of threats, or any evidence. Maximum 5 files, 5MB each. Images will be kept confidential.',
                  sw: 'Pakia screenshots, picha za vitisho, au ushahidi wowote. Kiwango cha juu cha faili 5, MB 5 kila moja. Picha zitahifadhiwa kwa usiri.',
                  kal: 'Upload screenshots, photos threats, evidence. Maximum 5 files, 5MB each. Images kept confidential.'
                })}
              </p>
              
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length + formData.evidence.length > 5) {
                    setError(t({ en: 'Maximum 5 files allowed', sw: 'Faili 5 pekee zinaruhusiwa', kal: 'Maximum 5 files' }));
                    return;
                  }
                  
                  files.forEach(file => {
                    if (file.size > 5 * 1024 * 1024) {
                      setError(t({ en: `${file.name} is too large (max 5MB)`, sw: `${file.name} ni kubwa sana (max 5MB)`, kal: `${file.name} too large` }));
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      setFormData(prev => ({
                        ...prev,
                        evidence: [...prev.evidence, {
                          type: 'screenshot' as EvidenceType,
                          content: content.split(',')[1], // Remove data URL prefix
                          filename: file.name,
                          mimeType: file.type
                        }]
                      }));
                    };
                    reader.readAsDataURL(file);
                  });
                  setError(null);
                }}
                style={styles.fileInput}
              />
              
              {formData.evidence.length > 0 && (
                <div style={styles.evidenceList}>
                  {formData.evidence.map((ev, index) => (
                    <div key={index} style={styles.evidenceItem}>
                      <span>📎 {ev.filename}</span>
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          evidence: prev.evidence.filter((_, i) => i !== index)
                        }))}
                        style={styles.removeEvidenceButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => {
                  if (!formData.tfgbvType || formData.description.length < 10) {
                    setError(t({ en: 'Please select an incident type and provide details', sw: 'Tafadhali chagua aina ya tukio ueleze', kal: 'Select incident type ak provide details' }));
                    return;
                  }
                  setError(null);
                  setStep('legal-guidance');
                }}
                style={styles.primaryButton}
              >
                {t({ en: 'Continue →', sw: 'Endelea →', kal: 'Continue' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Legal Guidance
  if (step === 'legal-guidance' && formData.tfgbvType) {
    const guidance = LEGAL_GUIDANCE_BY_TYPE[formData.tfgbvType];
    const platforms = PLATFORM_REPORTING_GUIDES;
    
    return (
      <div style={styles.overlay}>
        <div style={styles.modalLarge}>
          <div style={styles.header}>
            <h2 style={styles.title}>⚖️ {t({ en: 'Legal Guidance & Your Rights', sw: 'Mwongozo wa Kisheria na Haki Zako', kal: 'Legal Guidance Rights' })}</h2>
            <button onClick={() => setStep('report-form')} style={styles.backButton}>←</button>
          </div>
          <div style={styles.contentScrollable}>
            {/* Harm Type Info */}
            <div style={styles.legalSection}>
              <h3 style={styles.legalTitle}>{t(guidance.title)}</h3>
              <div style={styles.legalContent}>
                {guidance.content[language].map((item, i) => (
                  <div key={i} style={styles.legalItem}>
                    <span style={styles.legalBullet}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Platform Reporting */}
            <div style={styles.legalSection}>
              <h3 style={styles.legalTitle}>
                {t({ en: 'How to Report to Platforms', sw: 'Jinsi ya Kuripoti kwa Majukwaa', kal: 'How Report Platforms' })}
              </h3>
              <div style={styles.platformsGrid}>
                {platforms.map(platform => (
                  <div key={platform.platform} style={styles.platformCard}>
                    <div style={styles.platformHeader}>
                      <span style={styles.platformIcon}>{platform.icon}</span>
                      <span style={styles.platformName}>{platform.platform}</span>
                    </div>
                    <ol style={styles.stepsList}>
                      {platform.steps[language].slice(0, 4).map((step, i) => (
                        <li key={i} style={styles.stepItem}>{step}</li>
                      ))}
                    </ol>
                    <a 
                      href={platform.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.helpLink}
                    >
                      {t({ en: 'Full Help Guide →', sw: 'Mwongozo Kamili →', kal: 'Full Help Guide' })}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Police Reporting */}
            <div style={styles.legalSection}>
              <h3 style={styles.legalTitle}>
                {t({ en: 'How to Report to Police', sw: 'Jinsi ya Kuripoti kwa Polisi', kal: 'How Report Police' })}
              </h3>
              <div style={styles.policeSteps}>
                <div style={styles.policeStep}>
                  <span style={styles.stepNumber}>1</span>
                  <span>{t({ 
                    en: 'Call 999 or go to nearest police station with all evidence', 
                    sw: 'Piga 999 au enda kituoni cha polisi cha karibu na ushahidi wote',
                    kal: 'Call 999 ak go police station evidence tugul'
                  })}</span>
                </div>
                <div style={styles.policeStep}>
                  <span style={styles.stepNumber}>2</span>
                  <span>{t({ 
                    en: 'Request to speak with the Gender Desk or OCS', 
                    sw: 'Omba kuzungumza na Kitengo cha Jinsia au OCS',
                    kal: 'Request speak Gender Desk ak OCS'
                  })}</span>
                </div>
                <div style={styles.policeStep}>
                  <span style={styles.stepNumber}>3</span>
                  <span>{t({ 
                    en: 'Provide screenshots, dates, and perpetrator information', 
                    sw: 'Toa screenshots, tarehe, na taarifa za mkorofi',
                    kal: 'Provide screenshots, dates, perpetrator information'
                  })}</span>
                </div>
                <div style={styles.policeStep}>
                  <span style={styles.stepNumber}>4</span>
                  <span>{t({ 
                    en: 'Request an OB number and follow up within 7 days', 
                    sw: 'Omba namba ya OB na ufuatilia ndani ya siku 7',
                    kal: 'Request OB number ak follow up days 7'
                  })}</span>
                </div>
              </div>
            </div>
            
            {/* Emergency Contacts */}
            <div style={styles.emergencySection}>
              <h3 style={styles.emergencyTitle}>🚨 {EMERGENCY_RESOURCES[language].title}</h3>
              <p style={styles.emergencySubtitle}>{EMERGENCY_RESOURCES[language].subtitle}</p>
              <div style={styles.emergencyGrid}>
                {EMERGENCY_RESOURCES[language].contacts.map((contact, i) => (
                  <div key={i} style={styles.emergencyCard}>
                    <span style={styles.emergencyName}>{contact.name}</span>
                    <span style={styles.emergencyNumber}>{contact.number}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => setStep('safety-tips')}
                style={styles.primaryButton}
              >
                {t({ en: 'Continue to Safety Tips →', sw: 'Endelea kwa Vidokezo vya Usalama →', kal: 'Continue Safety Tips' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safety Tips
  if (step === 'safety-tips') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modalLarge}>
          <div style={styles.header}>
            <h2 style={styles.title}>🛡️ {t({ en: 'Safety & Protection Guide', sw: 'Mwongozo wa Usalama', kal: 'Safety Protection Guide' })}</h2>
            <button onClick={() => setStep('legal-guidance')} style={styles.backButton}>←</button>
          </div>
          <div style={styles.contentScrollable}>
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} style={styles.safetySection}>
                <div style={styles.safetyHeader}>
                  <span style={styles.safetyIcon}>{tip.icon}</span>
                  <h3 style={styles.safetyTitle}>{t(tip.category)}</h3>
                </div>
                <div style={styles.safetyTips}>
                  {tip.tips[language].map((item, j) => (
                    <div key={j} style={styles.safetyTip}>
                      <span style={styles.safetyBullet}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => setStep('tfgbv-assessment')}
                style={styles.primaryButton}
              >
                {t({ en: 'Continue to Impact Assessment →', sw: 'Endelea kwa Tathmini ya Athari →', kal: 'Continue Impact Assessment' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TFGBV Assessment Questions
  if (step === 'tfgbv-assessment') {
    const question = TFGBV_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / TFGBV_QUESTIONS.length) * 100;
    
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>📋 {t({ en: 'Impact Assessment', sw: 'Tathmini ya Athari', kal: 'Impact Assessment' })}</h2>
            <button onClick={() => setStep('safety-tips')} style={styles.backButton}>←</button>
          </div>
          <div style={styles.content}>
            {/* Progress */}
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressText}>
              {t({ en: 'Question ', sw: 'Swali ', kal: 'Question ' })} {currentQuestion + 1} {t({ en: ' of ', sw: ' la ', kal: ' of ' })} {TFGBV_QUESTIONS.length}
            </p>
            
            {/* Question */}
            <div style={styles.questionSection}>
              <span style={styles.clusterBadge}>
                {t(TFGBV_CLUSTERS[question.cluster as keyof typeof TFGBV_CLUSTERS])}
              </span>
              <h3 style={styles.questionText}>{question.text[language]}</h3>
              
              <div style={styles.optionsGrid}>
                {TFGBV_ANSWER_OPTIONS[language].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, [question.id]: option.value }));
                      if (currentQuestion < TFGBV_QUESTIONS.length - 1) {
                        setCurrentQuestion(prev => prev + 1);
                      } else {
                        // Complete assessment
                        const result = analyzeTfgbvResponses({ ...answers, [question.id]: option.value });
                        setAnalysis(result);
                        setStep('submitting');
                        submitReport(result);
                      }
                    }}
                    style={answers[question.id] === option.value ? styles.optionButtonActive : styles.optionButton}
                  >
                    <span style={styles.optionLabel}>{option.label}</span>
                    <span style={styles.optionDesc}>{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Submitting
  if (step === 'submitting') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.contentCenter}>
            <div style={styles.spinner} />
            <p style={styles.submittingText}>
              {t({ en: 'Submitting your report...', sw: 'Inatuma ripoti yako...', kal: 'Submitting report...' })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Diagnosis Report
  if (step === 'diagnosis' && analysis) {
    const getRiskColor = (risk: string) => {
      switch(risk) {
        case 'low': return '#22C55E';
        case 'moderate': return '#F59E0B';
        case 'high': return '#EF4444';
        case 'critical': return '#DC2626';
        default: return '#6B7280';
      }
    };

    const summaryText = language === 'sw' ? analysis.summarySw : language === 'kal' ? analysis.summaryKal : analysis.summary;
    const recommendations = language === 'sw' ? analysis.recommendationsSw : language === 'kal' ? analysis.recommendationsKal : analysis.recommendations;

    return (
      <div style={styles.overlay}>
        <div style={styles.modalLarge}>
          <div style={styles.header}>
            <h2 style={styles.title}>📊 {t({ en: 'Your Diagnosis Report', sw: 'Ripoti Yako ya Utambuzi', kal: 'Diagnosis Report' })}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.contentScrollable}>
            {/* Case Reference */}
            <div style={styles.caseRefBox}>
              <p style={styles.caseRefLabel}>{t({ en: 'Your Case Reference:', sw: 'Kumbu Kumbu ya Kesi Yako:', kal: 'Case Reference:' })}</p>
              <p style={styles.caseRefNumber}>{caseReference}</p>
              <p style={styles.caseRefWarning}>⭐ {t({ en: 'Please save this number!', sw: 'Tafadhali hifadhi namba hii!', kal: 'Save number!' })}</p>
            </div>

            {/* PDF Report Download */}
            <TFGBVReportPDF
              clientId={clientId}
              caseId={caseId}
              caseReference={caseReference}
              tfgbvType={formData.tfgbvType!}
              description={formData.description}
              platforms={formData.platforms}
              analysis={analysis}
              language={language}
              fullName={formData.fullName}
              submittedAt={new Date().toISOString()}
            />
            
            {/* Overall Risk */}
            <div style={{ ...styles.riskCard, borderColor: getRiskColor(analysis.overallRisk) }}>
              <div style={styles.riskHeader}>
                <span style={styles.riskLabel}>{t({ en: 'Overall Risk Level:', sw: 'Kiwango cha Hatari:', kal: 'Risk Level:' })}</span>
                <span style={{ ...styles.riskBadge, background: getRiskColor(analysis.overallRisk) }}>
                  {analysis.overallRisk.toUpperCase()}
                </span>
              </div>
              <p style={styles.summaryText}>{summaryText}</p>
            </div>
            
            {/* Cluster Scores */}
            <div style={styles.clustersSection}>
              <h3 style={styles.sectionTitleSmall}>{t({ en: 'Detailed Analysis', sw: 'Uchambuzi wa Kina', kal: 'Detailed Analysis' })}</h3>
              <div style={styles.clustersGrid}>
                {Object.entries(analysis.clusterLevels).map(([cluster, level]) => (
                  <div key={cluster} style={styles.clusterCard}>
                    <span style={styles.clusterName}>
                      {t(TFGBV_CLUSTERS[cluster as keyof typeof TFGBV_CLUSTERS])}
                    </span>
                    <div style={styles.clusterBar}>
                      <div 
                        style={{ 
                          ...styles.clusterFill, 
                          width: `${analysis.rawScores[cluster]}%`,
                          background: getRiskColor(level)
                        }} 
                      />
                    </div>
                    <span style={{ ...styles.clusterLevel, color: getRiskColor(level) }}>
                      {level.toUpperCase()} ({analysis.rawScores[cluster]}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recommendations */}
            <div style={styles.recommendationsSection}>
              <h3 style={styles.sectionTitleSmall}>{t({ en: 'Personalized Recommendations', sw: 'Mapendekezo Binafsi', kal: 'Recommendations' })}</h3>
              <div style={styles.recommendationsList}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={styles.recommendationItem}>
                    <span style={styles.recommendationNumber}>{i + 1}</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legal Reminder */}
            <div style={styles.reminderBox}>
              <h4 style={styles.reminderTitle}>⚖️ {t({ en: 'Legal Options Available', sw: 'Chaguzi za Kisheria Zinazopatikana', kal: 'Legal Options' })}</h4>
              <p style={styles.reminderText}>
                {t({
                  en: 'Based on your report type, you have legal protections under the Computer Misuse and Cybercrimes Act 2018. Consider filing a police report and seeking legal aid.',
                  sw: 'Kulingana na aina ya ripoti yako, una ulinzi wa kisheria chini ya Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao 2018. Fikiria kuwasilisha ripoti ya polisi na kutafuta msaada wa kisheria.',
                  kal: 'Based report type, legal protections Computer Misuse ak Cybercrimes Act 2018. Consider file police report ak seek legal aid.'
                })}
              </p>
            </div>
            
            {/* Next Steps */}
            <div style={styles.nextStepsSection}>
              <h3 style={styles.sectionTitleSmall}>{t({ en: 'Next Steps', sw: 'Hatua Zijazo', kal: 'Next Steps' })}</h3>
              <div style={styles.nextStepsList}>
                <div style={styles.nextStep}>
                  <span style={styles.stepCheck}>1</span>
                  <span>{t({ en: 'Save your case reference number', sw: 'Hifadhi namba yako ya kumbu kumbu', kal: 'Save case reference' })}</span>
                </div>
                <div style={styles.nextStep}>
                  <span style={styles.stepCheck}>2</span>
                  <span>{t({ en: 'Document all evidence (screenshots, messages)', sw: 'Hifadhi ushahidi wote (screenshots, ujumbe)', kal: 'Document evidence' })}</span>
                </div>
                <div style={styles.nextStep}>
                  <span style={styles.stepCheck}>3</span>
                  <span>{t({ en: 'Consider reporting to police if not already done', sw: 'Fikiria kuripoti kwa polisi ikiwa bado', kal: 'Consider report police' })}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => setStep('contacts')}
                style={styles.primaryButton}
              >
                {t({ en: 'Get Support & Contacts →', sw: 'Pata Msaada na Mawasiliano →', kal: 'Get Support Contacts' })}
              </button>
              <button onClick={onClose} style={styles.secondaryButton}>
                {t({ en: 'Close', sw: 'Funga', kal: 'Close' })}
              </button>
            </div>
          </div>
        </div>
        <ChatWidget 
          userName={userName || formData.fullName || 'Guest'} 
          userPhone={userPhone || formData.phone || ''} 
        />
      </div>
    );
  }

  // Contacts / Support Resources
  if (step === 'contacts') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>🤝 {t({ en: 'Support Contacts & Resources', sw: 'Mawasiliano ya Msaada na Rasilimali', kal: 'Support Contacts Resources' })}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.content}>
            {/* CAT Kenya Foundation - Primary Contact */}
            <div style={{...styles.section, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px'}}>
              <h3 style={{...styles.sectionTitle, color: 'white', marginBottom: '12px'}}>
                🏛️ Centre Against Torture (CAT) Kenya Foundation
              </h3>
              <p style={{fontSize: '14px', marginBottom: '12px', opacity: 0.95}}>
                {t({ 
                  en: 'Your primary support center for trauma counseling, legal aid, and GBV support services.',
                  sw: 'Kituo chakuu cha msaada kwa ushauri wa trauma, msaada wa kisheria, na huduma za GBV.',
                  kal: 'Primary support center trauma counseling legal aid GBV support services.'
                })}
              </p>
              <div style={styles.contactGrid}>
                <div style={{...styles.contactCard, background: 'rgba(255,255,255,0.95)', color: '#333'}}>
                  <span style={styles.contactIcon}>📞</span>
                  <span style={styles.contactLabel}>Emergency Hotline</span>
                  <span style={styles.contactValue}>+254 722 123 456</span>
                </div>
                <div style={{...styles.contactCard, background: 'rgba(255,255,255,0.95)', color: '#333'}}>
                  <span style={styles.contactIcon}>📧</span>
                  <span style={styles.contactLabel}>Email</span>
                  <span style={styles.contactValue}>help@catkenya.org</span>
                </div>
                <div style={{...styles.contactCard, background: 'rgba(255,255,255,0.95)', color: '#333'}}>
                  <span style={styles.contactIcon}>💬</span>
                  <span style={styles.contactLabel}>Live Chat</span>
                  <span style={styles.contactValue}>Available 24/7</span>
                </div>
              </div>
            </div>

            {/* Police & Legal */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>👮 Police & Legal Support</h3>
              <div style={styles.contactGrid}>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>🚨</span>
                  <span style={styles.contactLabel}>Kenya Police Emergency</span>
                  <span style={styles.contactValue}>999 / 112</span>
                </div>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>🚔</span>
                  <span style={styles.contactLabel}>GBV Police Unit</span>
                  <span style={styles.contactValue}>+254 20 222 2222</span>
                </div>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>⚖️</span>
                  <span style={styles.contactLabel}>Legal Aid Society</span>
                  <span style={styles.contactValue}>+254 20 444 5555</span>
                </div>
              </div>
            </div>

            {/* Other Stakeholders */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏥 Health & Counseling Services</h3>
              <div style={styles.contactGrid}>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>🏥</span>
                  <span style={styles.contactLabel}>Nairobi Women's Hospital</span>
                  <span style={styles.contactValue}>0719 072 000</span>
                </div>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>💚</span>
                  <span style={styles.contactLabel}>Befrienders Kenya (Crisis)</span>
                  <span style={styles.contactValue}>+254 722 178 177</span>
                </div>
                <div style={styles.contactCard}>
                  <span style={styles.contactIcon}>📱</span>
                  <span style={styles.contactLabel}>Crisis Text Line</span>
                  <span style={styles.contactValue}>Text "HELP" to 741741</span>
                </div>
              </div>
            </div>

            {/* Online Safety Resources */}
            <div style={{...styles.section, background: '#f0f9ff', borderLeft: '4px solid #0ea5e9'}}>
              <h3 style={styles.sectionTitle}>🛡️ Online Safety Resources</h3>
              <ul style={styles.list}>
                <li>📸 <strong>StopNCII.org</strong> - Help removing intimate images shared without consent</li>
                <li>🔒 <strong>ReportHarmfulContent.org</strong> - Report harmful content on social media</li>
                <li>🌐 <strong>Cybercrime Reporting</strong> - Report to Kenya Computer Misuse and Cybercrimes Unit</li>
              </ul>
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={() => setStep('diagnosis')} style={styles.secondaryButton}>
                ← {t({ en: 'Back to Diagnosis', sw: 'Rudi kwa Uchunguzi', kal: 'Back Diagnosis' })}
              </button>
              <button onClick={onClose} style={styles.primaryButton}>
                {t({ en: 'Close', sw: 'Funga', kal: 'Close' })}
              </button>
            </div>
          </div>
        </div>
        <ChatWidget 
          userName={userName || formData.fullName || 'Guest'} 
          userPhone={userPhone || formData.phone || ''} 
        />
      </div>
    );
  }

  // Limited Mode
  if (step === 'limited') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>⚠️ {t({ en: 'Limited Mode', sw: 'Hali ya Kikomo', kal: 'Limited Mode' })}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          <div style={styles.content}>
            <p style={styles.limitedText}>
              {t({
                en: 'You have chosen not to consent to data storage. We respect your privacy. Here is immediate guidance:',
                sw: 'Umechagua kukataa kuhifadhi data. Tunheshimu faragha yako. Hapa kuna mwongozo wa papo hapo:',
                kal: 'Choose maam consent data storage. Respect privacy. Immediate guidance:'
              })}
            </p>
            
            <div style={styles.guidanceSection}>
              <h4>{t({ en: 'Immediate Steps:', sw: 'Hatua za Papo Hapo:', kal: 'Immediate Steps:' })}</h4>
              <ul style={styles.list}>
                <li>{t({ en: 'Document all evidence (screenshots, messages)', sw: 'Hifadhi ushahidi wote (screenshots, ujumbe)', kal: 'Document evidence' })}</li>
                <li>{t({ en: 'Do not delete anything from your device', sw: 'Usifute chochote kwenye kifaa chako', kal: 'Maam delete device' })}</li>
                <li>{t({ en: 'Contact a trusted friend or family member', sw: 'Wasiliana na rafiki au mwanafamilia wa kuaminiwa', kal: 'Contact friend ak family' })}</li>
                <li>{t({ en: 'Report to the platform where it happened', sw: 'Ripoti kwenye jukwaa lililotokea', kal: 'Report platform' })}</li>
              </ul>
            </div>
            
            <div style={styles.emergencySection}>
              <h4>🚨 {EMERGENCY_RESOURCES[language].title}</h4>
              <div style={styles.emergencyGrid}>
                {EMERGENCY_RESOURCES[language].contacts.slice(0, 3).map((contact, i) => (
                  <div key={i} style={styles.emergencyCard}>
                    <span style={styles.emergencyName}>{contact.name}</span>
                    <span style={styles.emergencyNumber}>{contact.number}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={onClose} style={styles.primaryButton}>
              {t({ en: 'Close', sw: 'Funga', kal: 'Close' })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;

  // Helper function to submit report
  async function submitReport(analysisResult: TfgbvAnalysisResult) {
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        consentGiven: true,
        tfgbvType: formData.tfgbvType,
        description: formData.description,
        platforms: formData.platforms,
        assessmentAnswers: answers,
        assessmentResult: analysisResult,
        evidence: formData.evidence.length > 0 ? formData.evidence : undefined
      };
      
      const response = await fetch('/api/online-harms/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }
      
      setCaseReference(result.caseReference);
      setClientId(result.clientId);
      setCaseId(result.caseId);
      setStep('diagnosis');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting report');
      setStep('report-form');
    }
  }
}

// Styles object (abbreviated for space)
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalLarge: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '95vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#1f2937',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
  },
  backButton: {
    background: '#f3f4f6',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  content: {
    padding: '24px',
  },
  contentScrollable: {
    padding: '24px',
    maxHeight: 'calc(95vh - 80px)',
    overflowY: 'auto',
  },
  contentCenter: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  // Language selection
  languageGrid: {
    display: 'grid',
    gap: '16px',
    padding: '20px',
  },
  languageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  languageFlag: {
    fontSize: '32px',
  },
  languageName: {
    fontSize: '18px',
    fontWeight: 500,
  },
  // Consent
  consentBox: {
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '20px',
  },
  consentText: {
    margin: '0 0 16px 0',
    color: '#92400e',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  consentCheckbox: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  disabledButton: {
    background: '#d1d5db',
    color: '#9ca3af',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'not-allowed',
  },
  secondaryButton: {
    background: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  // Form sections
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 12px 0',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  typeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left',
  },
  typeButtonActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    border: '2px solid #667eea',
    borderRadius: '10px',
    background: '#eef2ff',
    cursor: 'pointer',
    textAlign: 'left',
  },
  typeIcon: {
    fontSize: '20px',
  },
  typeLabel: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: 1.3,
  },
  platformGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  platformButton: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '20px',
    background: 'white',
    fontSize: '13px',
    cursor: 'pointer',
  },
  platformButtonActive: {
    padding: '8px 16px',
    border: '1px solid #667eea',
    borderRadius: '20px',
    background: '#667eea',
    color: 'white',
    fontSize: '13px',
    cursor: 'pointer',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  // Legal guidance
  legalSection: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  legalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937',
    margin: '0 0 16px 0',
  },
  legalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  legalItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: 1.5,
  },
  legalBullet: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  platformsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
  },
  platformCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e5e7eb',
  },
  platformHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  platformIcon: {
    fontSize: '20px',
  },
  platformName: {
    fontWeight: 600,
    color: '#374151',
  },
  stepsList: {
    margin: '0 0 12px 0',
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#6b7280',
  },
  stepItem: {
    marginBottom: '6px',
  },
  helpLink: {
    color: '#667eea',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: 500,
  },
  policeSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  policeStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#4b5563',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  emergencySection: {
    background: '#fef2f2',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  emergencyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#991b1b',
    margin: '0 0 8px 0',
  },
  emergencySubtitle: {
    fontSize: '14px',
    color: '#7f1d1d',
    marginBottom: '16px',
  },
  emergencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  emergencyCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  emergencyName: {
    fontSize: '13px',
    color: '#6b7280',
  },
  emergencyNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#dc2626',
  },
  // Safety tips
  safetySection: {
    background: '#f0fdf4',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  safetyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  safetyIcon: {
    fontSize: '24px',
  },
  safetyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#166534',
    margin: 0,
  },
  safetyTips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  safetyTip: {
    display: 'flex',
    gap: '8px',
    fontSize: '14px',
    color: '#166534',
  },
  safetyBullet: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  // Assessment
  progressBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s',
  },
  progressText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  questionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  clusterBadge: {
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#1f2937',
    margin: 0,
    lineHeight: 1.5,
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  optionButtonActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 16px',
    border: '2px solid #667eea',
    borderRadius: '10px',
    background: '#eef2ff',
    cursor: 'pointer',
    textAlign: 'left',
  },
  optionLabel: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#374151',
  },
  optionDesc: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '2px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  submittingText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  // Diagnosis
  caseRefBox: {
    background: '#dcfce7',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  caseRefLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#166534',
  },
  caseRefNumber: {
    margin: '0 0 12px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#15803d',
    letterSpacing: '2px',
  },
  caseRefWarning: {
    margin: 0,
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: 600,
  },
  riskCard: {
    borderLeft: '4px solid',
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  riskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  riskLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  riskBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#374151',
    margin: 0,
  },
  clustersSection: {
    marginBottom: '20px',
  },
  sectionTitleSmall: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 12px 0',
  },
  clustersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  clusterCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
  },
  clusterName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  },
  clusterBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  clusterFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  clusterLevel: {
    fontSize: '12px',
    fontWeight: 600,
  },
  recommendationsSection: {
    marginBottom: '20px',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recommendationItem: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.5,
  },
  recommendationNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  reminderBox: {
    background: '#ede9fe',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
  },
  reminderTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#5b21b6',
    margin: '0 0 8px 0',
  },
  reminderText: {
    fontSize: '14px',
    color: '#6d28d9',
    lineHeight: 1.5,
    margin: 0,
  },
  nextStepsSection: {
    marginBottom: '20px',
  },
  nextStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  nextStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#374151',
  },
  stepCheck: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#22c55e',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  // Limited mode
  limitedText: {
    fontSize: '15px',
    color: '#92400e',
    marginBottom: '20px',
    lineHeight: 1.6,
  },
  guidanceSection: {
    background: '#fef3c7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  list: {
    margin: '8px 0',
    paddingLeft: '20px',
    color: '#4b5563',
  },
  // Evidence upload
  evidenceHelp: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 12px 0',
    lineHeight: 1.5,
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '12px',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    background: '#f9fafb',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  evidenceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  evidenceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#eef2ff',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#374151',
  },
  removeEvidenceButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  // Contact cards for support resources
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  contactCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    gap: '8px',
  },
  contactIcon: {
    fontSize: '24px',
  },
  contactLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
};
