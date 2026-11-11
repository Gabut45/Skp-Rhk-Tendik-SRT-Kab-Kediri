import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  VOCABULARY_BANK,
  searchVocabularyBank,
  synthesizeFallbackDeskripsi,
  detectRhkCategory,
  detectTimeContext,
  getVocabularyBreakdown,
} from '../lib/vocabulary-database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistence file location in project
const STORAGE_DIR = path.resolve(__dirname, '../../data');
const STORAGE_FILE = path.resolve(STORAGE_DIR, 'learned_vocabulary.json');

export interface ServerLearnedItem {
  id: string;
  kataKunci: string;
  deskripsi: string;
  rhk: string;
  source: 'gemini' | 'cpanel' | 'manual';
  createdAt: string;
}

// In-memory cache for ultra-fast lookup
let inMemoryVocabulary: ServerLearnedItem[] = [];

// Initialize & load saved vocabulary from file on server start
function initStorage() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      inMemoryVocabulary = JSON.parse(content);
    } else {
      inMemoryVocabulary = [];
      fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Vocabulary Service] Could not initialize storage file, using in-memory only:', err);
    inMemoryVocabulary = [];
  }
}

initStorage();

const MAX_LEARNED_CAPACITY = 400000;
let _saveDebounceTimer: NodeJS.Timeout | null = null;

function saveToDisk() {
  if (_saveDebounceTimer) return;
  _saveDebounceTimer = setTimeout(() => {
    _saveDebounceTimer = null;
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(inMemoryVocabulary), 'utf-8');
    } catch (err) {
      console.warn('[Vocabulary Service] Failed to write learned vocabulary to disk:', err);
    }
  }, 500);
}

/**
 * Save newly generated AI description into server vocabulary bank
 * Automatically records every Gemini AI generation up to 50,000 entries.
 */
export function saveLearnedVocabularyServer(
  kataKunci: string,
  deskripsi: string,
  rhk: string,
  source: 'gemini' | 'cpanel' | 'manual' = 'gemini'
): ServerLearnedItem {
  const cleanKeyword = kataKunci.trim();
  const cleanDeskripsi = deskripsi.trim();
  const cleanRhk = rhk.trim() || detectRhkCategory(cleanKeyword);

  // Check if identical description already exists
  const existing = inMemoryVocabulary.find(
    item =>
      item.kataKunci.toLowerCase() === cleanKeyword.toLowerCase() &&
      item.deskripsi.toLowerCase() === cleanDeskripsi.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const newItem: ServerLearnedItem = {
    id: `voc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    kataKunci: cleanKeyword,
    deskripsi: cleanDeskripsi,
    rhk: cleanRhk,
    source,
    createdAt: new Date().toISOString(),
  };

  // Add to beginning of memory list
  inMemoryVocabulary.unshift(newItem);

  // Limit memory to 50,000 learned entries
  if (inMemoryVocabulary.length > MAX_LEARNED_CAPACITY) {
    inMemoryVocabulary = inMemoryVocabulary.slice(0, MAX_LEARNED_CAPACITY);
  }

  saveToDisk();
  return newItem;
}

/**
 * Look up matching description from Server's vocabulary:
 * Priority 1: Learned items from previous Gemini generations
 * Priority 2: Pre-seeded comprehensive realistic vocabulary bank
 * Priority 3: Polished contextual Indonesian civil-service synthesizer
 */
export function lookupServerVocabulary(rawKeyword: string): {
  deskripsi: string;
  rhk: string;
  matchedFrom: 'learned_database' | 'preseeded_bank' | 'synthesizer';
} {
  const clean = rawKeyword.toLowerCase().trim();
  const timeContext = detectTimeContext(clean);

  // 1. Search learned database
  if (inMemoryVocabulary.length > 0) {
    // Exact keyword matches
    const exactMatches = inMemoryVocabulary.filter(
      item => item.kataKunci.toLowerCase() === clean
    );
    if (exactMatches.length > 0) {
      const item = exactMatches[Math.floor(Math.random() * exactMatches.length)];
      return { deskripsi: item.deskripsi, rhk: item.rhk, matchedFrom: 'learned_database' };
    }

    // Partial keyword matches
    const partialMatches = inMemoryVocabulary.filter(item => {
      const itemKw = item.kataKunci.toLowerCase();
      return clean.includes(itemKw) || itemKw.includes(clean);
    });

    if (partialMatches.length > 0) {
      // Filter by time context if applicable
      const compatible = partialMatches.filter(item => {
        const itemTime = detectTimeContext(item.deskripsi);
        if (timeContext && itemTime && timeContext !== itemTime) return false;
        return true;
      });
      const pool = compatible.length > 0 ? compatible : partialMatches;
      const item = pool[Math.floor(Math.random() * pool.length)];
      return { deskripsi: item.deskripsi, rhk: item.rhk, matchedFrom: 'learned_database' };
    }
  }

  // 2. Search pre-seeded realistic vocabulary bank
  const bankMatch = searchVocabularyBank(clean);
  if (bankMatch) {
    return {
      deskripsi: bankMatch.deskripsi,
      rhk: bankMatch.rhk,
      matchedFrom: 'preseeded_bank',
    };
  }

  // 3. Synthesize flawless Indonesian civil-service description
  const synthesized = synthesizeFallbackDeskripsi(rawKeyword);
  return {
    deskripsi: synthesized.deskripsi,
    rhk: synthesized.rhk,
    matchedFrom: 'synthesizer',
  };
}

/**
 * Get statistics and learned items
 */
export function getVocabularyStats() {
  const breakdown = getVocabularyBreakdown();
  return {
    totalLearned: inMemoryVocabulary.length,
    totalPreseededKeywords: breakdown.total,
    breakdownPerRhk: breakdown,
    recentLearned: inMemoryVocabulary.slice(0, 50),
  };
}
