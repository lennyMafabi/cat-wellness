'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  sender: 'user' | 'staff';
  staffName?: string;
  timestamp: string;
}

interface ChatWidgetProps {
  userName: string;
  userPhone?: string;
  assessmentId?: string;
}

export default function ChatWidget({ userName, userPhone, assessmentId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create chat session on first open
  useEffect(() => {
    if (isOpen && !sessionId && userName) {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSession',
          userName,
          userPhone,
          assessmentId
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setSessionId(data.session.id);
        }
      });
    }
  }, [isOpen, sessionId, userName, userPhone, assessmentId]);

  // Poll for new messages
  useEffect(() => {
    if (sessionId && isOpen) {
      const fetchMessages = () => {
        fetch(`/api/chat?sessionId=${sessionId}`)
          .then(res => res.json())
          .then(data => {
            if (data.messages) {
              const hasNewStaffMsg = data.messages.some(
                (m: ChatMessage) => m.sender === 'staff' && !messages.find(om => om.id === m.id)
              );
              if (hasNewStaffMsg && !isOpen) {
                setHasNewMessage(true);
              }
              setMessages(data.messages);
            }
          });
      };

      fetchMessages();
      intervalRef.current = setInterval(fetchMessages, 3000);
      
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [sessionId, isOpen, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId,
        message,
        sender: 'user'
      })
    });

    // Refresh messages
    const res = await fetch(`/api/chat?sessionId=${sessionId}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={styles.container}>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        style={{
          ...styles.chatButton,
          ...(hasNewMessage ? styles.chatButtonNew : {})
        }}
      >
        {isOpen ? '✕' : hasNewMessage ? '💬 ●' : '💬'}
        <span style={styles.chatButtonText}>
          {isOpen ? 'Close' : 'Chat with CAT Staff'}
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <span style={styles.headerIcon}>🤝</span>
              <div>
                <h4 style={styles.headerTitle}>CAT Kenya Support</h4>
                <p style={styles.headerSubtitle}>We typically reply within minutes</p>
              </div>
            </div>
            <span style={styles.statusIndicator}>● Online</span>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div style={styles.welcomeMessage}>
                <p>👋 Hello {userName}!</p>
                <p>How can we help you today? Feel free to ask any questions about your assessment or our services.</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  ...(msg.sender === 'user' ? styles.messageUser : styles.messageStaff)
                }}
              >
                <p style={styles.messageText}>{msg.message}</p>
                <span style={styles.messageTime}>
                  {msg.sender === 'staff' && msg.staffName && (
                    <span style={styles.staffName}>{msg.staffName} • </span>
                  )}
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div style={styles.typingIndicator}>
                <span>Staff is typing</span>
                <span style={styles.dots}>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={styles.input}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              style={{
                ...styles.sendButton,
                ...(!inputMessage.trim() ? styles.sendButtonDisabled : {})
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  chatButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease'
  },
  chatButtonNew: {
    background: '#22C55E',
    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
    animation: 'pulse 2s infinite'
  },
  chatButtonText: {
    fontSize: '14px'
  },
  chatWindow: {
    position: 'absolute',
    bottom: '70px',
    right: 0,
    width: '380px',
    height: '500px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    fontSize: '24px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600
  },
  headerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    opacity: 0.9
  },
  statusIndicator: {
    fontSize: '12px',
    color: '#22C55E',
    fontWeight: 600
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
    background: '#f8fafc'
  },
  welcomeMessage: {
    background: '#e0e7ff',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151'
  },
  message: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    marginBottom: '12px',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  messageUser: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginLeft: 'auto',
    borderBottomRightRadius: '4px'
  },
  messageStaff: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '4px'
  },
  messageText: {
    margin: 0
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
    display: 'block'
  },
  staffName: {
    fontWeight: 600,
    color: '#667eea'
  },
  typingIndicator: {
    fontSize: '13px',
    color: '#64748b',
    fontStyle: 'italic',
    padding: '8px 12px'
  },
  dots: {
    animation: 'dots 1.5s infinite'
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    background: 'white'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  sendButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};
