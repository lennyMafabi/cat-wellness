import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'assessments.json');
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'staff';
  createdAt: string;
}

interface Assessment {
  id: string;
  userInfo: {
    name: string;
    phone: string;
    altContact?: string;
    relationship?: string;
  };
  answers: Record<string, number>;
  result: {
    riskLevel: string;
    summary: string;
    clusterLevels: Record<string, string>;
    rawScores: Record<string, number>;
    topCluster?: string | null;
    recommendations: string[];
  };
  track: string;
  userType?: 'victim' | 'practitioner';
  createdAt: string;
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize default admin
export function initDb() {
  ensureDataDir();
  
  if (!fs.existsSync(USERS_PATH)) {
    const defaultAdmin: User = {
      id: uuidv4(),
      username: 'admin',
      password: 'admin123', // In production, use bcrypt
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_PATH, JSON.stringify([defaultAdmin], null, 2));
  }
  
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  }
}

// Users
export function getUsers(): User[] {
  initDb();
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
}

export function findUser(username: string): User | undefined {
  return getUsers().find(u => u.username === username);
}

export function createUser(username: string, password: string, role: 'admin' | 'staff' = 'staff'): User {
  initDb();
  const users = getUsers();
  const newUser: User = {
    id: uuidv4(),
    username,
    password, // In production, hash this
    role,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  return newUser;
}

// Assessments
export function getAssessments(): Assessment[] {
  initDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

export function saveAssessment(assessment: Omit<Assessment, 'id' | 'createdAt'>): Assessment {
  initDb();
  const assessments = getAssessments();
  const newAssessment: Assessment = {
    ...assessment,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  assessments.push(newAssessment);
  fs.writeFileSync(DB_PATH, JSON.stringify(assessments, null, 2));
  return newAssessment;
}

export function searchAssessments(query: string, dateFrom?: string, dateTo?: string): Assessment[] {
  let assessments = getAssessments();
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    assessments = assessments.filter(a => 
      a.userInfo.name.toLowerCase().includes(lowerQuery) ||
      a.userInfo.phone.includes(query)
    );
  }
  
  if (dateFrom) {
    assessments = assessments.filter(a => a.createdAt >= dateFrom);
  }
  
  if (dateTo) {
    assessments = assessments.filter(a => a.createdAt <= dateTo + 'T23:59:59');
  }
  
  return assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function deleteAssessment(id: string): boolean {
  initDb();
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  if (filtered.length === assessments.length) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2));
  return true;
}

// Chat functionality
const CHAT_PATH = path.join(process.cwd(), 'data', 'chat.json');

interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  sender: 'user' | 'staff';
  staffName?: string;
  timestamp: string;
  read: boolean;
}

interface ChatSession {
  id: string;
  userName: string;
  userPhone?: string;
  assessmentId?: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export function getChatSessions(): ChatSession[] {
  initDb();
  if (!fs.existsSync(CHAT_PATH)) {
    fs.writeFileSync(CHAT_PATH, JSON.stringify({ sessions: [], messages: [] }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  return data.sessions || [];
}

export function getChatMessages(sessionId?: string): ChatMessage[] {
  initDb();
  if (!fs.existsSync(CHAT_PATH)) {
    fs.writeFileSync(CHAT_PATH, JSON.stringify({ sessions: [], messages: [] }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  const messages = data.messages || [];
  if (sessionId) {
    return messages.filter((m: ChatMessage) => m.sessionId === sessionId);
  }
  return messages;
}

export function createChatSession(userName: string, userPhone?: string, assessmentId?: string): ChatSession {
  initDb();
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  const newSession: ChatSession = {
    id: uuidv4(),
    userName,
    userPhone,
    assessmentId,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.sessions = [...(data.sessions || []), newSession];
  fs.writeFileSync(CHAT_PATH, JSON.stringify(data, null, 2));
  return newSession;
}

export function addChatMessage(sessionId: string, message: string, sender: 'user' | 'staff', staffName?: string): ChatMessage {
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  const newMessage: ChatMessage = {
    id: uuidv4(),
    sessionId,
    message,
    sender,
    staffName,
    timestamp: new Date().toISOString(),
    read: sender === 'staff'
  };
  data.messages = [...(data.messages || []), newMessage];
  
  // Update session timestamp
  const session = data.sessions?.find((s: ChatSession) => s.id === sessionId);
  if (session) {
    session.updatedAt = new Date().toISOString();
  }
  
  fs.writeFileSync(CHAT_PATH, JSON.stringify(data, null, 2));
  return newMessage;
}

export function markMessagesAsRead(sessionId: string): void {
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  if (data.messages) {
    data.messages = data.messages.map((m: ChatMessage) => 
      m.sessionId === sessionId && m.sender === 'user' ? { ...m, read: true } : m
    );
    fs.writeFileSync(CHAT_PATH, JSON.stringify(data, null, 2));
  }
}

export function closeChatSession(sessionId: string): void {
  const data = JSON.parse(fs.readFileSync(CHAT_PATH, 'utf8'));
  const session = data.sessions?.find((s: ChatSession) => s.id === sessionId);
  if (session) {
    session.status = 'closed';
    fs.writeFileSync(CHAT_PATH, JSON.stringify(data, null, 2));
  }
}
