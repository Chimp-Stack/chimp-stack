import { loadChimpConfig } from './config';

export function getEnv(key: string, fallback?: string): string {
  return process.env[key] || loadChimpConfig()[key] || fallback || '';
}
