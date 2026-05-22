'use client';

import { useState, useEffect } from 'react';
import type { 
  Account, 
  UserRole, 
  Session, 
  FollowUpQuestion,
  EmotionalState 
} from '@/types/accountSystem';
import { 
  getQuestionsForRound, 
  getRoundName, 
  getRoundDescription,
  calculateRiskFromAnswers,
  determineEmotionalStateFromScore
} from '@/data/followUpQuestions';
import { followUpQuestions, calculateFollowUpResult, FollowUpResult } from '@/lib/followUpAssessment';
import UserDashboard from './UserDashboard';
import ExtendedAssessmentReport from './ExtendedAssessmentReport';

// ==================== TYPES ====================

interface AccountSystemProps {
  onAuthenticated: (account: Account, session: Session, isReturningUser: boolean) => void;
  onCancel: () => void;
}

type ViewState = 'welcome' | 'login' | 'create-account' | 'quick-checkin' | 'follow-up' | 'dashboard' | 'extended-follow-up';

interface FormData {
  username: string;
  alias: string;
  phone: string;
  email: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  consentGiven: boolean;
  preferredLanguage: string;
}

// ==================== COMPONENT ====================

export default function AccountSystem({ onAuthenticated, onCancel }: AccountSystemProps) {
  // State
  const [currentView, setCurrentView] = useState<ViewState>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  
  // Account data
  const [formData, setFormData] = useState<FormData>({
    username: '',
    alias: '',
    phone: '',
    email: '',
    role: 'survivor',
    password: '',
    confirmPassword: '',
    consentGiven: false,
    preferredLanguage: 'en'
  });
  
  // Session/Follow-up data
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  // Extended follow-up assessment state
  const [extendedQuestionIndex, setExtendedQuestionIndex] = useState(0);
  const [extendedAnswers, setExtendedAnswers] = useState<Record<string, number>>({});
  const [extendedResult, setExtendedResult] = useState<FollowUpResult | null>(null);
  const [showExtendedResults, setShowExtendedResults] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string | number | boolean>>({});
  const [lastRiskScore, setLastRiskScore] = useState<number | null>(null);
  const [showReturningBanner, setShowReturningBanner] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==================== HELPERS ====================
  
  const switchView = (view: ViewState) => {
    setCurrentView(view);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
  };

  // ==================== HANDLERS ====================

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.consentGiven) {
      setError('You must consent to data storage to create an account');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Only include optional fields if they have values
      const requestBody: any = {
        username: formData.username.trim(),
        role: formData.role,
        password: formData.password,
        consentGiven: formData.consentGiven === true,
        preferredLanguage: formData.preferredLanguage || 'en'
      };
      
      // Only add optional fields if they have content
      const alias = formData.alias?.trim();
      const phone = formData.phone?.trim();
      const email = formData.email?.trim();
      
      if (alias) requestBody.alias = alias;
      if (phone) requestBody.phone = phone;
      if (email) requestBody.email = email;

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        // First time user - set up account and go to dashboard
        setCurrentAccount(data.account);
        setCurrentSession(data.session);
        onAuthenticated(data.account, data.session, false);
        switchView('dashboard');
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentAccount(data.account);
        setCurrentSession(data.session);
        setCurrentRound(data.session.round);
        
        if (data.isReturningUser) {
          setShowReturningBanner(true);
          setLastRiskScore(data.lastSession?.riskScore || null);
        }

        // All users go to dashboard after login
        onAuthenticated(data.account, data.session, data.isReturningUser);
        switchView('dashboard');
      } else {
        setError(data.message || 'Invalid credentials. Please check your username and password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCheckIn = async (needsSupport: boolean) => {
    if (!currentAccount || !currentSession) return;

    setIsLoading(true);

    try {
      // Submit quick check-in as session completion
      const response = await fetch('/api/accounts/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          responses: [{
            questionId: 'quick_checkin',
            questionText: 'Quick check-in: How are you feeling?',
            answer: needsSupport ? 'Needs support' : 'Doing okay',
            timestamp: new Date().toISOString(),
            category: 'stability'
          }],
          riskScore: needsSupport ? 0.5 : 0.2,
          emotionalState: needsSupport ? 'distressed' : 'calm'
        })
      });

      const data = await response.json();

      if (data.success) {
        onAuthenticated(currentAccount, currentSession, true);
      } else {
        setError('Failed to complete check-in');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFollowUp = async () => {
    if (!currentAccount || !currentSession) return;

    // Validate all required questions answered
    const unansweredRequired = questions.filter(q => 
      q.required && !responses[q.questionId]
    );

    if (unansweredRequired.length > 0) {
      setError(`Please answer all required questions (${unansweredRequired.length} remaining)`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format responses
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
        const question = questions.find(q => q.questionId === questionId);
        return {
          questionId,
          questionText: question?.text.en || questionId,
          answer,
          timestamp: new Date().toISOString(),
          category: question?.category
        };
      });

      // Calculate risk
      const riskScore = calculateRiskFromAnswers(
        formattedResponses.map(r => ({ questionId: r.questionId, answer: r.answer }))
      );
      const emotionalState = determineEmotionalStateFromScore(riskScore);

      // Submit session
      const response = await fetch('/api/accounts/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          responses: formattedResponses,
          riskScore,
          emotionalState
        })
      });

      const data = await response.json();

      if (data.success) {
        // Mark first intake complete if this was round 1
        if (currentRound === 1 && !currentAccount.metadata?.firstIntakeComplete) {
          await fetch('/api/accounts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountId: currentAccount.accountId,
              updates: { metadata: { firstIntakeComplete: true } }
            })
          });
        }

        onAuthenticated(currentAccount, currentSession, !currentSession.isFirstSession);
      } else {
        setError(data.message || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string | number | boolean) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  // ==================== RENDER HELPERS ====================

  const renderWelcome = () => (
    <div style={styles.welcomeContainer}>
      <div style={styles.catLogo}>CAT</div>
      <h1 style={styles.welcomeTitle}>Centre Against Torture</h1>
      <p style={styles.welcomeSubtitle}>Mental Health & Digital Safety Platform</p>
      
      <div style={styles.welcomeDescription}>
        <p>Create an account to access personalized support and tracking.</p>
        <p>Your journey to wellness is monitored and supported over time.</p>
      </div>

      <div style={styles.buttonGroup}>
        <button 
          onClick={() => switchView('create-account')} 
          style={styles.primaryButton}
        >
          Create Account
        </button>
        <button 
          onClick={() => switchView('login')} 
          style={styles.secondaryButton}
        >
          I Already Have an Account
        </button>
      </div>

      <button onClick={onCancel} style={styles.cancelButton}>
        Continue Without Account
      </button>
    </div>
  );

  const renderLogin = () => (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>Welcome Back</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          style={styles.input}
          placeholder="Enter your username"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            style={{...styles.input, paddingRight: '40px'}}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              color: '#6b7280'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button 
          onClick={handleLogin} 
          style={styles.primaryButton}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button 
          onClick={() => switchView('welcome')} 
          style={styles.backButton}
        >
          Back
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Forgot your password?{' '}
          <span 
            style={{ color: '#667eea', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setShowForgotPassword(true)}
          >
            Click here to request a reset
          </span>
        </p>
      </div>
    </div>
  );

  const renderCreateAccount = () => (
    <div style={styles.formContainer}>
      <h2 style={styles.formTitle}>Create Your Account</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Username *</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          style={styles.input}
          placeholder="Choose a username"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Alias/Nickname (Optional)</label>
        <input
          type="text"
          value={formData.alias}
          onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
          style={styles.input}
          placeholder="How would you like to be called?"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Role *</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
          style={styles.select}
        >
          <option value="survivor">Survivor</option>
          <option value="practitioner">Practitioner</option>
          <option value="online_harms">Online Harms User</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Phone (Optional)</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          style={styles.input}
          placeholder="For emergency contact if needed"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Email (Optional)</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={styles.input}
          placeholder="For follow-up support"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            style={{...styles.input, paddingRight: '40px'}}
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              color: '#6b7280'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <small style={styles.hint}>Password must be at least 6 characters</small>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Confirm Password *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            style={{...styles.input, paddingRight: '40px'}}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              color: '#6b7280'
            }}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {formData.password && formData.confirmPassword && (
          <small style={{
            ...styles.hint,
            color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444',
            fontWeight: 500
          }}>
            {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </small>
        )}
      </div>

      <div style={styles.consentBox}>
        <label style={styles.consentLabel}>
          <input
            type="checkbox"
            checked={formData.consentGiven}
            onChange={(e) => setFormData(prev => ({ ...prev, consentGiven: e.target.checked }))}
            style={styles.checkbox}
          />
          I consent to the storage of my data for the purpose of providing 
          longitudinal monitoring and follow-up support. I understand my 
          information will be kept confidential and used only to improve 
          my care journey.
        </label>
      </div>

      <div style={styles.buttonGroup}>
        <button 
          onClick={handleCreateAccount} 
          style={styles.primaryButton}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
        <button 
          onClick={() => switchView('welcome')} 
          style={styles.backButton}
        >
          Back
        </button>
      </div>
    </div>
  );

  const renderQuickCheckIn = () => (
    <div style={styles.formContainer}>
      <div style={styles.returningBanner}>
        <h3>👋 Welcome Back!</h3>
        {lastRiskScore !== null && (
          <p>Your last risk score: <strong>{(lastRiskScore * 100).toFixed(0)}%</strong></p>
        )}
      </div>

      <h2 style={styles.formTitle}>Quick Check-In</h2>
      <p style={styles.checkinText}>
        We noticed it has been a while since your last visit. 
        How are you feeling today?
      </p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.buttonGroupVertical}>
        <button 
          onClick={() => handleQuickCheckIn(true)} 
          style={styles.supportButton}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'I Need Support'}
        </button>
        <button 
          onClick={() => handleQuickCheckIn(false)} 
          style={styles.okayButton}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : "I'm Doing Okay"}
        </button>
      </div>

      <button 
        onClick={() => {
          // Skip to full follow-up
          if (currentAccount) {
            const roundQuestions = getQuestionsForRound(currentRound, currentAccount.role);
            setQuestions(roundQuestions);
            switchView('follow-up');
          }
        }} 
        style={styles.skipLink}
      >
        Take full reassessment instead →
      </button>
    </div>
  );

  const renderFollowUp = () => {
    const roundName = getRoundName(currentRound);
    const roundDescription = getRoundDescription(currentRound);

    return (
      <div style={styles.formContainer}>
        <div style={styles.roundHeader}>
          <h2 style={styles.roundTitle}>Round {currentRound}: {roundName}</h2>
          <p style={styles.roundDescription}>{roundDescription}</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.questionsList}>
          {questions.map((question, index) => (
            <div key={question.questionId} style={styles.questionCard}>
              <div style={styles.questionNumber}>{index + 1}</div>
              <div style={styles.questionContent}>
                <label style={styles.questionText}>
                  {question.text.en}
                  {question.required && <span style={styles.required}>*</span>}
                </label>

                {question.type === 'text' && (
                  <textarea
                    value={(responses[question.questionId] as string) || ''}
                    onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
                    style={styles.textarea}
                    rows={3}
                    placeholder="Type your answer here..."
                  />
                )}

                {question.type === 'yes_no' && (
                  <div style={styles.yesNoGroup}>
                    <button
                      onClick={() => handleResponseChange(question.questionId, true)}
                      style={{
                        ...styles.yesNoButton,
                        ...(responses[question.questionId] === true ? styles.yesNoSelected : {})
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleResponseChange(question.questionId, false)}
                      style={{
                        ...styles.yesNoButton,
                        ...(responses[question.questionId] === false ? styles.yesNoSelected : {})
                      }}
                    >
                      No
                    </button>
                  </div>
                )}

                {question.type === 'single_choice' && question.options && (
                  <div style={styles.optionsList}>
                    {question.options.map((option) => (
                      <label key={option} style={styles.optionLabel}>
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option}
                          checked={responses[question.questionId] === option}
                          onChange={() => handleResponseChange(question.questionId, option)}
                          style={styles.radio}
                        />
                        <span style={styles.optionText}>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'scale' && (
                  <div style={styles.scaleContainer}>
                    <div style={styles.scaleLabels}>
                      <span>{question.scaleMin}</span>
                      <span>{question.scaleMax}</span>
                    </div>
                    <input
                      type="range"
                      min={question.scaleMin}
                      max={question.scaleMax}
                      value={(responses[question.questionId] as number) || question.scaleMin || 1}
                      onChange={(e) => handleResponseChange(question.questionId, parseInt(e.target.value))}
                      style={styles.scaleInput}
                    />
                    <div style={styles.scaleValue}>
                      Current: {responses[question.questionId] || question.scaleMin || 1}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.formActions}>
          <button 
            onClick={handleSubmitFollowUp} 
            style={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    );
  };

  // ==================== EXTENDED FOLLOW-UP ASSESSMENT (22 Questions) ====================

  const renderExtendedFollowUp = () => {
    const currentQuestion = followUpQuestions[extendedQuestionIndex];
    const progress = ((extendedQuestionIndex + 1) / followUpQuestions.length) * 100;

    // Show comprehensive results after all questions answered
    if (showExtendedResults && extendedResult && currentAccount) {
      return (
        <ExtendedAssessmentReport
          result={extendedResult}
          username={currentAccount.username}
          accountId={currentAccount.accountId}
          responses={extendedAnswers}
          onClose={() => {
            saveExtendedFollowUpSession();
            setShowExtendedResults(false);
            setExtendedQuestionIndex(0);
            setExtendedAnswers({});
            switchView('dashboard');
          }}
        />
      );
    }

    return (
      <div style={styles.formContainer}>
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progress}%`}} />
          <span style={styles.progressText}>Question {extendedQuestionIndex + 1} of {followUpQuestions.length}</span>
        </div>

        <div style={styles.roundHeader}>
          <span style={styles.categoryBadge}>{currentQuestion.category.toUpperCase()}</span>
          <h2 style={styles.roundTitle}>Extended Follow-Up Assessment</h2>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.questionCard}>
          <div style={styles.questionNumber}>{extendedQuestionIndex + 1}</div>
          <div style={styles.questionContent}>
            <label style={styles.questionText}>
              {currentQuestion.question}
              <span style={styles.swahiliText}>{currentQuestion.swahili}</span>
            </label>

            <div style={styles.optionsList}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setExtendedAnswers({...extendedAnswers, [currentQuestion.id]: option.value});
                  }}
                  style={{
                    ...styles.optionButton,
                    ...(extendedAnswers[currentQuestion.id] === option.value ? styles.optionSelected : {})
                  }}
                >
                  <span style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: extendedAnswers[currentQuestion.id] === option.value ? 'white' : '#1f2937'
                  }}>{option.label}</span>
                  <span style={{
                    fontSize: '13px',
                    color: extendedAnswers[currentQuestion.id] === option.value ? 'rgba(255,255,255,0.9)' : '#6b7280'
                  }}>{option.swahili}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.questionActions}>
          {extendedQuestionIndex > 0 && (
            <button
              onClick={() => setExtendedQuestionIndex(extendedQuestionIndex - 1)}
              style={styles.secondaryButton}
            >
              ← Previous
            </button>
          )}
          
          <button
            onClick={() => {
              if (!extendedAnswers[currentQuestion.id] && extendedAnswers[currentQuestion.id] !== 0) {
                setError('Please select an option');
                return;
              }
              setError('');
              
              if (extendedQuestionIndex < followUpQuestions.length - 1) {
                setExtendedQuestionIndex(extendedQuestionIndex + 1);
              } else {
                // Calculate results
                const result = calculateFollowUpResult(extendedAnswers, currentSession ? {
                  ptsdScore: currentSession.riskScore,
                  anxietyScore: currentSession.riskScore,
                  depressionScore: currentSession.riskScore
                } : undefined);
                setExtendedResult(result);
                setShowExtendedResults(true);
              }
            }}
            style={styles.primaryButton}
            disabled={extendedAnswers[currentQuestion.id] === undefined}
          >
            {extendedQuestionIndex < followUpQuestions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        </div>
      </div>
    );
  };

  const saveExtendedFollowUpSession = async () => {
    if (!currentAccount || !extendedResult) return;

    try {
      const sessionData = {
        accountId: currentAccount.accountId,
        module: 'extended-follow-up',
        round: 'comprehensive',
        responses: extendedAnswers,
        riskScore: Math.round((extendedResult.ptsdScore + extendedResult.anxietyScore + extendedResult.depressionScore) / 3),
        emotionalState: extendedResult.overallTrend === 'improving' ? 'Improving' : 
                        extendedResult.overallTrend === 'worsening' ? 'Struggling' : 'Stable',
        isFollowUp: true,
        followUpResult: extendedResult
      };

      await fetch('/api/accounts/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
    } catch (err) {
      console.error('Failed to save extended follow-up');
    }
  };

  // ==================== MAIN RENDER ====================

  return (
    <div style={styles.container}>
      {currentView === 'welcome' && renderWelcome()}
      {currentView === 'login' && renderLogin()}
      {currentView === 'create-account' && renderCreateAccount()}
      {currentView === 'quick-checkin' && renderQuickCheckIn()}
      {currentView === 'follow-up' && renderFollowUp()}
      {currentView === 'dashboard' && currentAccount && (
        <UserDashboard 
          accountId={currentAccount.accountId}
          username={currentAccount.username}
          onStartFollowUp={() => switchView('extended-follow-up')}
          onLogout={() => {
            setCurrentAccount(null);
            switchView('welcome');
          }}
        />
      )}
      {currentView === 'extended-follow-up' && renderExtendedFollowUp()}
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <div style={styles.forgotPasswordModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>🔑 Password Reset Request</h3>
              <button onClick={() => setShowForgotPassword(false)} style={styles.closeButton}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              {forgotPasswordStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Request Submitted!</h4>
                  <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                    {forgotPasswordMessage}
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStatus('idle');
                    }}
                    style={{ ...styles.primaryButton, marginTop: '16px' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                    Enter your username below. An admin will generate a temporary password for you. 
                    Please allow some time for the admin to process your request.
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={forgotPasswordUsername}
                      onChange={(e) => setForgotPasswordUsername(e.target.value)}
                      placeholder="Enter your username"
                      style={{ ...styles.input, width: '100%' }}
                    />
                  </div>
                  
                  {forgotPasswordStatus === 'error' && (
                    <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{forgotPasswordMessage}</p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={async () => {
                        if (!forgotPasswordUsername.trim()) {
                          setForgotPasswordStatus('error');
                          setForgotPasswordMessage('Please enter your username');
                          return;
                        }
                        
                        setForgotPasswordStatus('submitting');
                        try {
                          const res = await fetch('/api/accounts/forgot-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: forgotPasswordUsername })
                          });
                          const data = await res.json();
                          
                          if (data.success) {
                            setForgotPasswordStatus('success');
                            setForgotPasswordMessage(
                              `Your password reset request has been sent to the admin team. ` +
                              `An admin will generate a temporary password for "${forgotPasswordUsername}". ` +
                              `Please check back later or contact CAT Kenya at help@catkenya.org for assistance.`
                            );
                            setForgotPasswordUsername('');
                          } else {
                            setForgotPasswordStatus('error');
                            setForgotPasswordMessage(data.message || 'Failed to submit request. Please try again.');
                          }
                        } catch (err) {
                          setForgotPasswordStatus('error');
                          setForgotPasswordMessage('Network error. Please try again.');
                        }
                      }}
                      disabled={forgotPasswordStatus === 'submitting'}
                      style={{ ...styles.primaryButton, flex: 1 }}
                    >
                      {forgotPasswordStatus === 'submitting' ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      onClick={() => setShowForgotPassword(false)}
                      style={{ ...styles.secondaryButton, flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== STYLES ====================

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  welcomeContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  catLogo: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: 'white',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 auto 24px',
    border: '4px solid #f59e0b',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 32px 0',
  },
  welcomeDescription: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: '32px',
    padding: '0 20px',
  },
  formContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 24px 0',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px',
  },
  hint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  buttonGroupVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
  primaryButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    padding: '14px 24px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  backButton: {
    padding: '14px 24px',
    background: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cancelButton: {
    marginTop: '16px',
    padding: '12px',
    background: 'transparent',
    color: '#9ca3af',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  consentBox: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  consentLabel: {
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: 1.5,
    display: 'flex',
    gap: '12px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  returningBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center',
  },
  checkinText: {
    fontSize: '16px',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: '24px',
  },
  supportButton: {
    padding: '16px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  okayButton: {
    padding: '16px',
    background: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  skipLink: {
    marginTop: '20px',
    padding: '12px',
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'block',
    width: '100%',
  },
  roundHeader: {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  roundTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  roundDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '32px',
  },
  questionCard: {
    display: 'flex',
    gap: '16px',
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
  },
  questionNumber: {
    width: '32px',
    height: '32px',
    background: '#667eea',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '12px',
  },
  required: {
    color: '#dc2626',
    marginLeft: '4px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  yesNoGroup: {
    display: 'flex',
    gap: '12px',
  },
  yesNoButton: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  yesNoSelected: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid #e5e7eb',
  },
  optionButton: {
    width: '100%',
    padding: '16px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  optionSelected: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#667eea',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  optionSwahili: {
    fontSize: '13px',
    color: '#6b7280',
  },
  radio: {
    width: '20px',
    height: '20px',
  },
  optionText: {
    fontSize: '14px',
    color: '#374151',
  },
  scaleContainer: {
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  scaleInput: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: '#e5e7eb',
    outline: 'none',
    cursor: 'pointer',
  },
  scaleValue: {
    textAlign: 'center',
    marginTop: '12px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#667eea',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  
  // Modal styles for forgot password
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
  forgotPasswordModal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
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
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  modalBody: {
    padding: '24px'
  },
  
  // Extended Follow-up Styles
  trendCard: {
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  trendTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700
  },
  trendDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#4b5563'
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  scoreCard: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '2px solid #e5e7eb'
  },
  scoreLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: 700
  },
  severityBadge: {
    display: 'inline-block',
    padding: '8px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
    marginBottom: '24px'
  },
  recommendationsSection: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  recommendationsTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#1f2937'
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4b5563'
  },
  recommendationItem: {
    marginBottom: '8px',
    fontSize: '14px',
    lineHeight: 1.6
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#e0e7ff',
    color: '#4338ca',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    marginBottom: '12px'
  },
  progressBar: {
    background: '#e5e7eb',
    borderRadius: '10px',
    height: '8px',
    marginBottom: '24px',
    position: 'relative' as const
  },
  progressFill: {
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    height: '100%',
    transition: 'width 0.3s ease'
  },
  progressText: {
    position: 'absolute' as const,
    right: 0,
    top: '-20px',
    fontSize: '12px',
    color: '#6b7280'
  },
  resultsActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px'
  }
};

// Helper functions for extended follow-up
function getScoreColor(score: number): string {
  if (score <= 33) return '#22c55e'; // green
  if (score <= 66) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minimal': return '#22c55e';
    case 'mild': return '#3b82f6';
    case 'moderate': return '#eab308';
    case 'severe': return '#ef4444';
    default: return '#6b7280';
  }
}
