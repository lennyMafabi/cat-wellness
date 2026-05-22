import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { 
  OnlineHarmsClient, 
  OnlineHarmsCase, 
  OnlineHarmsEvidence, 
  CaseAdminNote, 
  AuditLog,
  ConsentRecord,
  ClientSummary,
  CaseDetail,
  TfgbvAssessmentResult
} from '@/types/onlineHarms';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLIENTS_PATH = path.join(DATA_DIR, 'onlineHarmsClients.json');
const CASES_PATH = path.join(DATA_DIR, 'onlineHarmsCases.json');
const EVIDENCE_PATH = path.join(DATA_DIR, 'onlineHarmsEvidence.json');
const ADMIN_NOTES_PATH = path.join(DATA_DIR, 'caseAdminNotes.json');
const AUDIT_LOG_PATH = path.join(DATA_DIR, 'auditLogs.json');
const CONSENT_PATH = path.join(DATA_DIR, 'consentRecords.json');

// Ensure all data files exist
function initOnlineHarmsDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const files = [CLIENTS_PATH, CASES_PATH, EVIDENCE_PATH, ADMIN_NOTES_PATH, AUDIT_LOG_PATH, CONSENT_PATH];
  files.forEach(file => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
    }
  });
}

// Generic read/write helpers
function readJson<T>(filePath: string): T[] {
  initOnlineHarmsDb();
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson<T>(filePath: string, data: T[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ========== CLIENT OPERATIONS ==========

export function createClient(
  fullName: string | undefined,
  phone: string | undefined,
  email: string | undefined,
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
): OnlineHarmsClient {
  const clientId = uuidv4();
  const now = new Date().toISOString();
  
  const client: OnlineHarmsClient = {
    clientId,
    fullName,
    phone,
    email,
    consentGiven,
    consentTimestamp: consentGiven ? now : undefined,
    createdAt: now,
    lastActivityAt: now
  };
  
  const clients = readJson<OnlineHarmsClient>(CLIENTS_PATH);
  clients.push(client);
  writeJson(CLIENTS_PATH, clients);
  
  // Record consent
  if (consentGiven) {
    recordConsent(clientId, 'data_storage', true, ipAddress, userAgent);
    recordConsent(clientId, 'admin_access', true, ipAddress, userAgent);
  }
  
  // Audit log
  logAudit('case_created', undefined, clientId, undefined, { fullName, consentGiven });
  
  return client;
}

export function getClientById(clientId: string): OnlineHarmsClient | undefined {
  return readJson<OnlineHarmsClient>(CLIENTS_PATH).find(c => c.clientId === clientId);
}

export function updateClientActivity(clientId: string): void {
  const clients = readJson<OnlineHarmsClient>(CLIENTS_PATH);
  const client = clients.find(c => c.clientId === clientId);
  if (client) {
    client.lastActivityAt = new Date().toISOString();
    writeJson(CLIENTS_PATH, clients);
  }
}

export function getAllClients(): OnlineHarmsClient[] {
  return readJson<OnlineHarmsClient>(CLIENTS_PATH);
}

export function deleteClient(clientId: string): boolean {
  // Delete client and all related data
  const clients = readJson<OnlineHarmsClient>(CLIENTS_PATH);
  const filteredClients = clients.filter(c => c.clientId !== clientId);
  if (filteredClients.length === clients.length) return false;
  writeJson(CLIENTS_PATH, filteredClients);
  
  // Delete all cases for this client
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  const clientCases = cases.filter(c => c.clientId === clientId);
  const filteredCases = cases.filter(c => c.clientId !== clientId);
  writeJson(CASES_PATH, filteredCases);
  
  // Delete all evidence for these cases
  const evidence = readJson<OnlineHarmsEvidence>(EVIDENCE_PATH);
  const caseIds = clientCases.map(c => c.caseId);
  const filteredEvidence = evidence.filter(e => !caseIds.includes(e.caseId) && e.clientId !== clientId);
  writeJson(EVIDENCE_PATH, filteredEvidence);
  
  // Delete admin notes
  const notes = readJson<CaseAdminNote>(ADMIN_NOTES_PATH);
  const filteredNotes = notes.filter(n => !caseIds.includes(n.caseId));
  writeJson(ADMIN_NOTES_PATH, filteredNotes);
  
  // Log deletion
  logAudit('data_deleted', undefined, clientId, undefined, { deletedCases: caseIds.length });
  
  return true;
}

// ========== CASE OPERATIONS ==========

export function createCase(
  clientId: string,
  riskLevel: OnlineHarmsCase['riskLevel'],
  tfgbvType: OnlineHarmsCase['tfgbvType'],
  description: string,
  platforms?: string[],
  assignedTo?: string,
  assessmentAnswers?: Record<string, number>,
  assessmentResult?: TfgbvAssessmentResult
): OnlineHarmsCase {
  const caseId = uuidv4();
  const now = new Date().toISOString();
  const client = getClientById(clientId);
  
  const newCase: OnlineHarmsCase = {
    caseId,
    clientId,
    riskLevel,
    tfgbvType,
    description,
    platforms,
    status: 'open',
    consentGiven: client?.consentGiven ?? false,
    createdAt: now,
    updatedAt: now,
    assignedTo,
    assessmentAnswers,
    assessmentResult
  };
  
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  cases.push(newCase);
  writeJson(CASES_PATH, cases);
  
  // Update client activity
  updateClientActivity(clientId);
  
  // Audit log
  logAudit('case_created', caseId, clientId, assignedTo, { tfgbvType, riskLevel });
  
  return newCase;
}

export function getCaseById(caseId: string): OnlineHarmsCase | undefined {
  return readJson<OnlineHarmsCase>(CASES_PATH).find(c => c.caseId === caseId);
}

export function getCasesByClient(clientId: string): OnlineHarmsCase[] {
  return readJson<OnlineHarmsCase>(CASES_PATH).filter(c => c.clientId === clientId);
}

export function getAllCases(): OnlineHarmsCase[] {
  return readJson<OnlineHarmsCase>(CASES_PATH);
}

export function updateCaseStatus(
  caseId: string, 
  status: OnlineHarmsCase['status'],
  assignedTo?: string
): OnlineHarmsCase | undefined {
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  const caseIndex = cases.findIndex(c => c.caseId === caseId);
  if (caseIndex === -1) return undefined;
  
  cases[caseIndex].status = status;
  cases[caseIndex].updatedAt = new Date().toISOString();
  if (assignedTo) {
    cases[caseIndex].assignedTo = assignedTo;
  }
  
  writeJson(CASES_PATH, cases);
  
  // Audit log
  logAudit('case_updated', caseId, cases[caseIndex].clientId, assignedTo, { status });
  
  return cases[caseIndex];
}

export function linkWellnessAssessment(caseId: string, assessmentId: string): void {
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  const caseIndex = cases.findIndex(c => c.caseId === caseId);
  if (caseIndex === -1) return;
  
  cases[caseIndex].wellnessReferral = {
    referred: true,
    assessmentId,
    referredAt: new Date().toISOString()
  };
  cases[caseIndex].updatedAt = new Date().toISOString();
  writeJson(CASES_PATH, cases);
  
  // Audit log
  logAudit('wellness_referral', caseId, cases[caseIndex].clientId, undefined, { assessmentId });
}

// ========== EVIDENCE OPERATIONS ==========

export function addEvidence(
  caseId: string,
  clientId: string,
  type: OnlineHarmsEvidence['type'],
  content: string,
  filename: string | undefined,
  mimeType: string | undefined,
  size: number | undefined,
  tags: string[],
  description?: string
): OnlineHarmsEvidence {
  const evidenceId = uuidv4();
  const evidence: OnlineHarmsEvidence = {
    evidenceId,
    caseId,
    clientId,
    type,
    content,
    filename,
    mimeType,
    size,
    tags,
    description,
    uploadedAt: new Date().toISOString()
  };
  
  const allEvidence = readJson<OnlineHarmsEvidence>(EVIDENCE_PATH);
  allEvidence.push(evidence);
  writeJson(EVIDENCE_PATH, allEvidence);
  
  // Update case timestamp
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  const caseIndex = cases.findIndex(c => c.caseId === caseId);
  if (caseIndex !== -1) {
    cases[caseIndex].updatedAt = new Date().toISOString();
    writeJson(CASES_PATH, cases);
  }
  
  // Audit log
  logAudit('evidence_added', caseId, clientId, undefined, { evidenceType: type, evidenceId });
  
  return evidence;
}

export function getEvidenceByCase(caseId: string): OnlineHarmsEvidence[] {
  return readJson<OnlineHarmsEvidence>(EVIDENCE_PATH).filter(e => e.caseId === caseId);
}

export function getEvidenceByClient(clientId: string): OnlineHarmsEvidence[] {
  return readJson<OnlineHarmsEvidence>(EVIDENCE_PATH).filter(e => e.clientId === clientId);
}

// ========== ADMIN NOTES ==========

export function addAdminNote(
  caseId: string,
  adminUsername: string,
  note: string
): CaseAdminNote {
  const noteId = uuidv4();
  const adminNote: CaseAdminNote = {
    noteId,
    caseId,
    adminUsername,
    note,
    createdAt: new Date().toISOString()
  };
  
  const notes = readJson<CaseAdminNote>(ADMIN_NOTES_PATH);
  notes.push(adminNote);
  writeJson(ADMIN_NOTES_PATH, notes);
  
  return adminNote;
}

export function getAdminNotesByCase(caseId: string): CaseAdminNote[] {
  return readJson<CaseAdminNote>(ADMIN_NOTES_PATH).filter(n => n.caseId === caseId);
}

// ========== AUDIT LOG ==========

export function logAudit(
  action: AuditLog['action'],
  caseId?: string,
  clientId?: string,
  adminUsername?: string,
  details: Record<string, unknown> = {},
  ipAddress?: string
): void {
  const log: AuditLog = {
    logId: uuidv4(),
    action,
    caseId,
    clientId,
    adminUsername,
    details,
    timestamp: new Date().toISOString(),
    ipAddress
  };
  
  const logs = readJson<AuditLog>(AUDIT_LOG_PATH);
  logs.push(log);
  writeJson(AUDIT_LOG_PATH, logs);
}

export function getAuditLogs(
  clientId?: string,
  caseId?: string,
  limit: number = 100
): AuditLog[] {
  let logs = readJson<AuditLog>(AUDIT_LOG_PATH);
  
  if (clientId) {
    logs = logs.filter(l => l.clientId === clientId);
  }
  if (caseId) {
    logs = logs.filter(l => l.caseId === caseId);
  }
  
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ========== CONSENT RECORDS ==========

export function recordConsent(
  clientId: string,
  type: ConsentRecord['type'],
  given: boolean,
  ipAddress?: string,
  userAgent?: string
): ConsentRecord {
  const consent: ConsentRecord = {
    consentId: uuidv4(),
    clientId,
    type,
    given,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent
  };
  
  const consents = readJson<ConsentRecord>(CONSENT_PATH);
  consents.push(consent);
  writeJson(CONSENT_PATH, consents);
  
  return consent;
}

export function getConsentByClient(clientId: string): ConsentRecord[] {
  return readJson<ConsentRecord>(CONSENT_PATH).filter(c => c.clientId === clientId);
}

// ========== AGGREGATE FUNCTIONS ==========

export function getClientSummaries(): ClientSummary[] {
  const clients = readJson<OnlineHarmsClient>(CLIENTS_PATH);
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  
  return clients.map(client => {
    const clientCases = cases.filter(c => c.clientId === client.clientId);
    const hasOpenCases = clientCases.some(c => c.status === 'open' || c.status === 'in_progress');
    
    return {
      clientId: client.clientId,
      fullName: client.fullName,
      contact: client.phone || client.email,
      caseCount: clientCases.length,
      latestActivity: client.lastActivityAt,
      hasOpenCases,
      consentGiven: client.consentGiven
    };
  }).sort((a, b) => new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime());
}

export function getCaseDetail(caseId: string, adminUsername: string, ipAddress?: string): CaseDetail | undefined {
  const caseData = getCaseById(caseId);
  if (!caseData) return undefined;
  
  // Log view access
  logAudit('case_viewed', caseId, caseData.clientId, adminUsername, {}, ipAddress);
  
  const client = getClientById(caseData.clientId);
  const evidence = getEvidenceByCase(caseId);
  const adminNotes = getAdminNotesByCase(caseId);
  const auditLogs = getAuditLogs(caseData.clientId, caseId, 50);
  
  return {
    ...caseData,
    clientFullName: client?.fullName,
    clientPhone: client?.phone,
    clientEmail: client?.email,
    evidence,
    adminNotes,
    auditLogs
  };
}

export function getDashboardStats(): {
  totalClients: number;
  totalCases: number;
  openCases: number;
  criticalCases: number;
  recentCases: OnlineHarmsCase[];
} {
  const clients = readJson<OnlineHarmsClient>(CLIENTS_PATH);
  const cases = readJson<OnlineHarmsCase>(CASES_PATH);
  
  const openCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress');
  const criticalCases = cases.filter(c => c.riskLevel === 'critical' && (c.status === 'open' || c.status === 'in_progress'));
  
  const recentCases = cases
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return {
    totalClients: clients.length,
    totalCases: cases.length,
    openCases: openCases.length,
    criticalCases: criticalCases.length,
    recentCases
  };
}
