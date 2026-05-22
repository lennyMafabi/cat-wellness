export interface ChatMessage {
  id: string;
  assessmentId?: string;
  userName: string;
  userPhone?: string;
  message: string;
  sender: 'user' | 'staff';
  staffName?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatSession {
  id: string;
  userName: string;
  userPhone?: string;
  assessmentId?: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastTimestamp: string;
  status: 'active' | 'closed';
}
