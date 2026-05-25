import { supabase, isSupabaseEnabled } from './supabase';
import fs from 'fs';
import path from 'path';
import type { 
  Account, 
  AdminMirrorRecord, 
  AccountCredentials
} from '@/types/accountSystem';

const DATA_DIR = path.join(process.cwd(), 'data');
const isProduction = process.env.NODE_ENV === 'production';

// In-memory fallback cache
const memoryCache: Record<string, any> = {
  accounts: [],
  credentials: [],
  mirrors: [],
  sessions: [],
  chats: []
};

/**
 * Read data with Supabase as primary, file system as secondary, memory as fallback
 */
export async function readFromDb<T>(
  tableName: string,
  fallbackFileName: string
): Promise<T[]> {
  // Try Supabase first
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        console.error(`Supabase read error for ${tableName}:`, error);
      } else if (data) {
        // Convert snake_case to camelCase and cache
        const camelData = data.map(item => convertSnakeToCamel(item));
        memoryCache[tableName] = camelData;
        return camelData as T[];
      }
    } catch (error) {
      console.error(`Failed to read from Supabase ${tableName}:`, error);
    }
  }

  // Fallback to file system in development
  if (!isProduction) {
    try {
      const filePath = path.join(DATA_DIR, fallbackFileName);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        memoryCache[tableName] = data;
        return data as T[];
      }
    } catch (error) {
      console.error(`Failed to read from file ${fallbackFileName}:`, error);
    }
  }

  // Return memory cache as ultimate fallback
  return (memoryCache[tableName] || []) as T[];
}

/**
 * Write data with Supabase as primary, file system as secondary
 */
export async function writeToDb<T>(
  tableName: string,
  data: T[],
  fallbackFileName: string
): Promise<void> {
  // Update memory cache immediately
  memoryCache[tableName] = data;

  // Try Supabase first
  if (isSupabaseEnabled) {
    try {
      // Clear and insert for simplicity (in production, use upsert)
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', ''); // Delete all
      
      if (deleteError && deleteError.code !== 'PGRST116') { // Ignore "no rows matched" error
        console.error(`Supabase delete error for ${tableName}:`, deleteError);
      }

      const camelData = data.map(item => convertCamelToSnake(item));
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(camelData);
      
      if (insertError) {
        console.error(`Supabase write error for ${tableName}:`, insertError);
      } else {
        return; // Success, no need to write to file
      }
    } catch (error) {
      console.error(`Failed to write to Supabase ${tableName}:`, error);
    }
  }

  // Fallback to file system in development
  if (!isProduction) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const filePath = path.join(DATA_DIR, fallbackFileName);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to write to file ${fallbackFileName}:`, error);
    }
  }
}

/**
 * Convert snake_case object keys to camelCase
 */
function convertSnakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertSnakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = obj[key];
    return result;
  }, {} as any);
}

/**
 * Convert camelCase object keys to snake_case
 */
function convertCamelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertCamelToSnake);
  if (obj === null || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
    return result;
  }, {} as any);
}
