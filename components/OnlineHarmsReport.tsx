'use client';

import { useState, useCallback } from 'react';
import { TfgbvType, RiskLevel, OnlineHarmsReportForm } from '@/types/onlineHarms';

interface OnlineHarmsReportProps {
  onClose: () => void;
  onSuccess: (clientId: string, caseId: string) => void;
  language?: 'en' | 'sw';
}

const TFGBV_TYPES: { value: TfgbvType; label: string; labelSw: string; icon: string }[] = [
  { value: 'sextortion', label: 'Sextortion (Threatening to share private images)', labelSw: 'Ukatili wa kijinsia mtandaoni', icon: '📸' },
  { value: 'cyberstalking', label: 'Cyberstalking (Persistent online harassment)', labelSw: 'Kufuatilia mtandaoni', icon: '👁️' },
  { value: 'non-consensual_sharing', label: 'Non-consensual Image Sharing', labelSw: 'Kusambaza picha bila idhini', icon: '📤' },
  { value: 'deepfake', label: 'Deepfake/ manipulated images or videos', labelSw: 'Picha au video zilizohaririwa', icon: '🎭' },
  { value: 'harassment', label: 'Online Harassment & Bullying', labelSw: 'Ukatili na udhalimu mtandaoni', icon: '💬' },
  { value: 'misinformation', label: 'Misinformation/Defamation', labelSw: 'Uongo/Ushambulizi wa kimaumbile', icon: '📢' },
  { value: 'identity_theft', label: 'Identity Theft/Impersonation', labelSw: 'Wizi wa utambulisho', icon: '🎭' },
  { value: 'other', label: 'Other Online Harm', labelSw: 'Ukatili mwingine mtandaoni', icon: '⚠️' },
];

const PLATFORMS = ['Facebook', 'WhatsApp', 'Instagram', 'Twitter/X', 'TikTok', 'Telegram', 'Email', 'Other'];

export default function OnlineHarmsReport({ onClose, onSuccess, language = 'en' }: OnlineHarmsReportProps) {
  const t = (en: string, sw: string) => language === 'sw' ? sw : en;
  
  // Form state
  const [step, setStep] = useState<'consent' | 'form' | 'evidence' | 'submitting' | 'success' | 'limited'>('consent');
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<Partial<OnlineHarmsReportForm>>({
    fullName: '',
    phone: '',
    email: '',
    tfgbvType: undefined,
    description: '',
    platforms: [],
    evidence: [],
    consentGiven: false
  });
  const [files, setFiles] = useState<{ file: File; preview: string; tags: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [caseReference, setCaseReference] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [caseId, setCaseId] = useState<string>('');
  
  // Handle consent selection
  const handleConsent = (consent: boolean) => {
    setConsentGiven(consent);
    setFormData(prev => ({ ...prev, consentGiven: consent }));
    
    if (consent) {
      setStep('form');
    } else {
      setStep('limited');
    }
  };
  
  // Handle text input changes
  const handleChange = (field: keyof OnlineHarmsReportForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle platform selection
  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms?.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...(prev.platforms || []), platform]
    }));
  };
  
  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    selectedFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('File too large. Maximum 5MB.', 'Faili kubwa mno. Kiwango cha juu ni 5MB.'));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, { 
          file, 
          preview: reader.result as string,
          tags: []
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, [t]);
  
  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Toggle file tag
  const toggleFileTag = (fileIndex: number, tag: string) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== fileIndex) return f;
      return {
        ...f,
        tags: f.tags.includes(tag) 
          ? f.tags.filter(t => t !== tag)
          : [...f.tags, tag]
      };
    }));
  };
  
  // Submit report
  const submitReport = async () => {
    setStep('submitting');
    setError(null);
    
    try {
      // Prepare evidence data
      const evidenceData = files.map(f => ({
        type: f.file.type.startsWith('image/') ? 'screenshot' as const : 'text' as const,
        content: f.preview,
        filename: f.file.name,
        mimeType: f.file.type,
        tags: f.tags.length > 0 ? f.tags : ['evidence']
      }));
      
      const payload = {
        ...formData,
        consentGiven: true,
        evidence: evidenceData
      };
      
      const response = await fetch('/api/online-harms/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }
      
      if (result.mode === 'limited') {
        setStep('limited');
      } else {
        setCaseReference(result.caseReference);
        setClientId(result.clientId);
        setCaseId(result.caseId);
        setStep('success');
        onSuccess(result.clientId, result.caseId);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('form');
    }
  };
  
  // Render consent step
  if (step === 'consent') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>{t('Report Online Harm', 'Ripoti Ukatili Mtandaoni')}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.consentBox}>
              <h3 style={styles.consentTitle}>🔒 {t('Data Consent Required', 'Idhini ya Data Inahitajika')}</h3>
              <p style={styles.consentText}>
                {t(
                  'Before we can help you, we need your consent to securely store your information. Authorized support staff will be able to access this data to assist you.',
                  'Kabla ya kukusaidia, tunahitaji idhini yako kuhifadhi taarifa zako kwa usalama. Wafanyakazi walioidhinishwa wataweza kufikia data hii kukusaidia.'
                )}
              </p>
              
              <div style={styles.consentCheckbox}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={consentGiven === true}
                    onChange={() => handleConsent(true)}
                    style={styles.checkbox}
                  />
                  <span>
                    {t(
                      'I consent to my information being securely stored and accessed by authorized administrators for support and reporting purposes.',
                      'Nakubali taarifa zangu kuhifadhiwa kwa usalama na kufikiwa na wasimamizi walioidhinishwa kwa madhumuni ya usaidizi na ureporting.'
                    )}
                  </span>
                </label>
              </div>
              
              <div style={styles.buttonGroup}>
                <button 
                  onClick={() => handleConsent(true)}
                  disabled={consentGiven !== true}
                  style={consentGiven === true ? styles.primaryButton : styles.disabledButton}
                >
                  {t('Continue with Consent', 'Endelea na Idhini')}
                </button>
                
                <button 
                  onClick={() => handleConsent(false)}
                  style={styles.secondaryButton}
                >
                  {t('I Do Not Consent - Limited Mode', 'Sikubali - Hali ya Kikomo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render limited mode
  if (step === 'limited') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>⚠️ {t('Limited Mode', 'Hali ya Kikomo')}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          
          <div style={styles.content}>
            <p style={styles.limitedText}>
              {t(
                'You have chosen not to consent to data storage. We respect your privacy. Here is immediate guidance:',
                'Umechagua kukubali kuhifadhi data. Tunheshimu faragha yako. Hapa kuna mwongozo wa papo hapo:'
              )}
            </p>
            
            <div style={styles.guidanceSection}>
              <h4>{t('Immediate Steps:', 'Hatua za Papo Hapo:')}</h4>
              <ul style={styles.list}>
                <li>{t('Document all evidence (screenshots, messages)', 'Hifadhi ushahidi wote (screenshots, ujumbe)')}</li>
                <li>{t('Do not delete anything from your device', 'Usifute chochote kwenye kifaa chako')}</li>
                <li>{t('Contact a trusted friend or family member', 'Wasiliana na rafiki au mwanafamilia wa kuaminiwa')}</li>
                <li>{t('Report to the platform where it happened', 'Ripoti kwenye jukwaa lililotokea')}</li>
              </ul>
            </div>
            
            <div style={styles.guidanceSection}>
              <h4>{t('Support Resources:', 'Rasilimali za Usaidizi:')}</h4>
              <ul style={styles.list}>
                <li>{t('Local cybercrime reporting center', 'Kituo cha karibu cha kuripoti uhalifu wa mtandao')}</li>
                <li>{t('Platform Safety Centers', 'Vituo vya Usalama vya Jukwaa')}</li>
                <li>{t('Legal aid organizations', 'Mashirika ya msaada wa kisheria')}</li>
              </ul>
            </div>
            
            <button onClick={onClose} style={styles.primaryButton}>
              {t('Close', 'Funga')}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render success
  if (step === 'success') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>✅ {t('Report Submitted', 'Ripoti Imetumwa')}</h2>
            <button onClick={onClose} style={styles.closeButton}>✕</button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.successBox}>
              <p style={styles.referenceText}>
                {t('Your Case Reference:', 'Kumbu Kumbu ya Kesi Yako:')}
              </p>
              <p style={styles.referenceNumber}>{caseReference}</p>
              <p style={styles.saveWarning}>
                ⭐ {t('Please save this number!', 'Tafadhali hifadhi namba hii!')}
              </p>
            </div>
            
            <div style={styles.infoBox}>
              <h4>{t('What happens next?', 'Nini kitatokea baadaye?')}</h4>
              <ul style={styles.list}>
                <li>{t('A support specialist will review your case within 24-48 hours', 'Mtaalamu wa usaidizi atakagua kesi yako ndani ya saa 24-48')}</li>
                <li>{t('You will receive updates via phone/email if provided', 'Utapokea taarifa kupitia simu/barua pepe ikiwa umetoa')}</li>
                <li>{t('Your data is stored securely and only accessible to authorized staff', 'Data yako imehifadhiwa kwa usalama na inaweza kufikiwa na wafanyakazi walioidhinishwa tu')}</li>
              </ul>
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => onSuccess(clientId, caseId)}
                style={styles.primaryButton}
              >
                {t('Get Wellness Support →', 'Pata Usaidizi wa Wellness →')}
              </button>
              <button onClick={onClose} style={styles.secondaryButton}>
                {t('Close', 'Funga')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render form
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('Report Online Harm', 'Ripoti Ukatili Mtandaoni')}</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.content}>
          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}
          
          {/* Contact Info (Optional) */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('Your Information (Optional)', 'Taarifa Zako (Si Lazima)')}</h3>
            <p style={styles.helpText}>
              {t('You can remain anonymous, but providing contact info helps us reach you.', 'Unaweza kubaki baina, lakini kutoa taarifa za mawasiliano inatusaidia kukufikia.')}
            </p>
            
            <input
              type="text"
              placeholder={t('Full Name', 'Jina Kamili')}
              value={formData.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              style={styles.input}
            />
            
            <input
              type="tel"
              placeholder={t('Phone Number', 'Namba ya Simu')}
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              style={styles.input}
            />
            
            <input
              type="email"
              placeholder={t('Email Address', 'Barua Pepe')}
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              style={styles.input}
            />
          </div>
          
          {/* Incident Type */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('What happened?', 'Nini kilijitokeza?')} *</h3>
            
            <div style={styles.typeGrid}>
              {TFGBV_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleChange('tfgbvType', type.value)}
                  style={formData.tfgbvType === type.value ? styles.typeButtonActive : styles.typeButton}
                >
                  <span style={styles.typeIcon}>{type.icon}</span>
                  <span style={styles.typeLabel}>{language === 'sw' ? type.labelSw : type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Platforms */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('Platform(s) where it happened', 'Jukwaa ambapo lilitokea')}</h3>
            
            <div style={styles.platformGrid}>
              {PLATFORMS.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  style={formData.platforms?.includes(platform) ? styles.platformButtonActive : styles.platformButton}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('Describe what happened', 'Eleza kilichotokeza')} *</h3>
            <textarea
              placeholder={t(
                'Please describe the incident in as much detail as you are comfortable with...',
                'Tafadhali eleza tukio kwa undani kadiri uwezavyo...'
              )}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              style={styles.textarea}
              rows={5}
            />
          </div>
          
          {/* Evidence Upload */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('Evidence (Optional)', 'Ushahidi (Si Lazima)')}</h3>
            <p style={styles.helpText}>
              {t('Screenshots, messages, or any relevant files help us understand your case better.', 'Screenshots, ujumbe, au faili zozote zinazohusiana zinatusaidia kuelewa kesi yako vyema.')}
            </p>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={styles.fileInput}
              id="evidence-upload"
            />
            <label htmlFor="evidence-upload" style={styles.fileButton}>
              📎 {t('Attach Files', 'Ambatisha Faili')}
            </label>
            
            {files.length > 0 && (
              <div style={styles.fileList}>
                {files.map((f, i) => (
                  <div key={i} style={styles.fileItem}>
                    <img src={f.preview} alt="" style={styles.filePreview} />
                    <div style={styles.fileInfo}>
                      <p style={styles.fileName}>{f.file.name}</p>
                      <div style={styles.tagSelector}>
                        {['threat', 'evidence', 'harassment', 'other'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleFileTag(i, tag)}
                            style={f.tags.includes(tag) ? styles.tagActive : styles.tag}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} style={styles.removeButton}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div style={styles.buttonGroup}>
            <button 
              onClick={submitReport}
              disabled={!formData.tfgbvType || !formData.description || formData.description.length < 10 || step === 'submitting'}
              style={step === 'submitting' ? styles.submittingButton : styles.primaryButton}
            >
              {step === 'submitting' 
                ? t('Submitting...', 'Inatuma...') 
                : t('Submit Report', 'Tuma Ripoti')
              }
            </button>
            
            <button onClick={onClose} style={styles.secondaryButton}>
              {t('Cancel', 'Ghairi')}
            </button>
          </div>
          
          <p style={styles.privacyNote}>
            🔒 {t(
              'Your data is encrypted and stored securely. Only authorized support staff can access it.',
              'Data yako imefichwa na kuhifadhiwa kwa usalama. Wafanyakazi walioidhinishwa tu wanaweza kufikia.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
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
  content: {
    padding: '24px',
  },
  consentBox: {
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  consentTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    color: '#92400e',
  },
  consentText: {
    margin: '0 0 16px 0',
    color: '#78350f',
    lineHeight: 1.6,
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
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 12px 0',
  },
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '-8px 0 12px 0',
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
  fileInput: {
    display: 'none',
  },
  fileButton: {
    display: 'inline-block',
    padding: '12px 20px',
    background: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  fileList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  filePreview: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#374151',
  },
  tagSelector: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '4px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '11px',
    background: 'white',
    cursor: 'pointer',
  },
  tagActive: {
    padding: '4px 10px',
    border: '1px solid #667eea',
    borderRadius: '12px',
    fontSize: '11px',
    background: '#667eea',
    color: 'white',
    cursor: 'pointer',
  },
  removeButton: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  submittingButton: {
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'not-allowed',
  },
  privacyNote: {
    marginTop: '20px',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#166534',
    textAlign: 'center',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  successBox: {
    background: '#dcfce7',
    border: '2px solid #22c55e',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  referenceText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#166534',
  },
  referenceNumber: {
    margin: '0 0 12px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#15803d',
    letterSpacing: '2px',
  },
  saveWarning: {
    margin: 0,
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: 600,
  },
  infoBox: {
    background: '#eff6ff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  list: {
    margin: '8px 0',
    paddingLeft: '20px',
    color: '#4b5563',
  },
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
};
