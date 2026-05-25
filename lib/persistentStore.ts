import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const isProduction = process.env.NODE_ENV === 'production';

// In-memory store that auto-syncs to files
class PersistentStore {
  private data: Record<string, any[]> = {
    'accounts': [],
    'accountCredentials': [],
    'adminMirrorRecords': [],
    'sessions': [],
    'retainedChats': []
  };
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromDisk();
    // Auto-sync to disk every 30 seconds in development
    if (!isProduction) {
      this.syncInterval = setInterval(() => this.syncToDisk(), 30000);
    }
  }

  private loadFromDisk() {
    if (!isProduction) {
      const files = ['accounts.json', 'accountCredentials.json', 'adminMirrorRecords.json', 'sessions.json', 'retainedChats.json'];
      
      for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const key = file.replace('.json', '');
            this.data[key] = JSON.parse(content);
          }
        } catch (err) {
          console.error(`Failed to load ${file}:`, err);
        }
      }
    }
  }

  private syncToDisk() {
    if (isProduction) return;
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    for (const key in this.data) {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      try {
        fs.writeFileSync(filePath, JSON.stringify(this.data[key], null, 2));
      } catch (err) {
        console.error(`Failed to sync ${key}.json:`, err);
      }
    }
  }

  read(table: string): any[] {
    return this.data[table] || [];
  }

  write(table: string, data: any[]): void {
    this.data[table] = data;
    // Immediate sync in development
    if (!isProduction) {
      this.syncToDisk();
    }
  }

  destroy() {
    if (this.syncInterval) clearInterval(this.syncInterval);
  }
}

// Global instance
const store = new PersistentStore();

export { store };
