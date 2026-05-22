'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatSession {
  id: string;
  userName: string;
  userPhone?: string;
  assessmentId?: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  sender: 'user' | 'staff';
  staffName?: string;
  timestamp: string;
}

interface AdminChatProps {
  currentStaffName: string;
}

export default function AdminChat({ currentStaffName }: AdminChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for sessions and messages
  useEffect(() => {
    const fetchData = async () => {
      // Fetch sessions
      const sessionsRes = await fetch('/api/chat');
      const sessionsData = await sessionsRes.json();
      if (sessionsData.sessions) {
        setSessions(sessionsData.sessions.filter((s: ChatSession) => s.status === 'active'));
      }

      // Fetch messages for selected session
      if (selectedSession) {
        const messagesRes = await fetch(`/api/chat?sessionId=${selectedSession.id}`);
        const messagesData = await messagesRes.json();
        if (messagesData.messages) {
          setMessages(messagesData.messages);
          // Mark as read
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markRead', sessionId: selectedSession.id })
          });
        }
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedSession) return;

    const message = inputMessage.trim();
    setInputMessage('');

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: selectedSession.id,
        message,
        sender: 'staff',
        staffName: currentStaffName
      })
    });

    // Refresh messages
    const res = await fetch(`/api/chat?sessionId=${selectedSession.id}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'closeSession',
        sessionId: selectedSession.id
      })
    });

    setSelectedSession(null);
    setMessages([]);
    
    // Refresh sessions
    const res = await fetch('/api/chat');
    const data = await res.json();
    if (data.sessions) {
      setSessions(data.sessions.filter((s: ChatSession) => s.status === 'active'));
    }
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
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const hasUnreadMessages = (sessionId: string) => {
    return messages.some(m => m.sessionId === sessionId && m.sender === 'user');
  };

  return (
    <div style={styles.container}>
      {/* Sessions List */}
      <div style={styles.sessionsPanel}>
        <h3 style={styles.panelTitle}>Active Chats ({sessions.length})</h3>
        <div style={styles.sessionsList}>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              style={{
                ...styles.sessionItem,
                ...(selectedSession?.id === session.id ? styles.sessionItemActive : {})
              }}
            >
              <div style={styles.sessionHeader}>
                <span style={styles.sessionName}>{session.userName}</span>
                {hasUnreadMessages(session.id) && (
                  <span style={styles.unreadBadge}>●</span>
                )}
              </div>
              <div style={styles.sessionMeta}>
                📞 {session.userPhone || 'No phone'} • {new Date(session.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p style={styles.emptyState}>No active chat sessions</p>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div style={styles.chatPanel}>
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div>
                <h4 style={styles.chatHeaderName}>{selectedSession.userName}</h4>
                <p style={styles.chatHeaderMeta}>
                  📞 {selectedSession.userPhone} | Started {new Date(selectedSession.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={handleCloseSession} style={styles.closeButton}>
                End Chat
              </button>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.message,
                    ...(msg.sender === 'staff' ? styles.messageStaff : styles.messageUser)
                  }}
                >
                  <p style={styles.messageText}>{msg.message}</p>
                  <span style={styles.messageTime}>
                    {msg.sender === 'staff' && (
                      <span style={styles.staffName}>{msg.staffName} • </span>
                    )}
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
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
          </>
        ) : (
          <div style={styles.noSessionSelected}>
            <p>Select a chat session from the left to start responding</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px',
    height: '500px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  sessionsPanel: {
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  panelTitle: {
    margin: 0,
    padding: '16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    borderBottom: '1px solid #e2e8f0'
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto' as const
  },
  sessionItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  sessionItemActive: {
    background: '#eff6ff'
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  sessionName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#1e293b'
  },
  unreadBadge: {
    color: '#DC2626',
    fontSize: '12px'
  },
  sessionMeta: {
    fontSize: '12px',
    color: '#64748b'
  },
  emptyState: {
    padding: '40px 16px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px'
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  chatHeaderName: {
    margin: 0,
    fontSize: '16px',
    color: '#1e293b'
  },
  chatHeaderMeta: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#64748b'
  },
  closeButton: {
    padding: '8px 16px',
    background: '#DC2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  noSessionSelected: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8'
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto' as const,
    background: '#f8fafc'
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  messageStaff: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginLeft: 'auto'
  },
  messageUser: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e2e8f0'
  },
  messageText: {
    margin: 0
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.8,
    marginTop: '4px',
    display: 'block'
  },
  staffName: {
    fontWeight: 600
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    background: 'white'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  sendButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};
