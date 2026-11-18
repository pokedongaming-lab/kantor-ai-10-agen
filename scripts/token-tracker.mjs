import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'token-usage.json');

// Kuota default harian studio (100k token gratis/standar)
const DEFAULT_DAILY_BUDGET = 100000;

// Nama dan peran 10 agen resmi
export const AGENT_INFO = {
  kasir:    { name: 'Dina', lantai: 1, role: 'Analisis Metrik & Views' },
  pesanan:  { name: 'Rina', lantai: 1, role: 'Jadwal & Auto-Publisher' },
  cs:       { name: 'Fajar', lantai: 1, role: 'Community & DM Interaksi' },
  stok:     { name: 'Bayu', lantai: 1, role: 'Bank Aset Media' },
  keuangan: { name: 'Sari', lantai: 1, role: 'Affiliate & Sponsor Tracker' },
  riset:    { name: 'Raka', lantai: 2, role: 'AI Trend Intelligence' },
  konten:   { name: 'Sekar', lantai: 2, role: 'Scriptwriter Anti-Slop' },
  desain:   { name: 'Lita', lantai: 2, role: 'Visual & Thumbnail Designer' },
  laporan:  { name: 'Doni', lantai: 2, role: 'QA & Fact Checker' },
  manajer:  { name: 'Bu Ratna', lantai: 2, role: 'Chief Strategist & GM' },
};

function initDataStructure() {
  const by_agent = {};
  for (const k of Object.keys(AGENT_INFO)) {
    by_agent[k] = {
      calls: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      last_model: '-',
      last_active: null
    };
  }

  return {
    daily_budget: DEFAULT_DAILY_BUDGET,
    updated_at: new Date().toISOString(),
    summary: {
      total_tokens: 0,
      total_calls: 0,
      by_agent,
      by_model: {}
    },
    logs: []
  };
}

export function loadTokenData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = initDataStructure();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    
    // Pastikan seluruh 10 agen ada di data
    for (const k of Object.keys(AGENT_INFO)) {
      if (!data.summary.by_agent[k]) {
        data.summary.by_agent[k] = {
          calls: 0,
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          last_model: '-',
          last_active: null
        };
      }
    }
    return data;
  } catch (err) {
    console.warn('⚠️ Gagal membaca data token, inisialisasi ulang:', err.message);
    const initial = initDataStructure();
    return initial;
  }
}

export function saveTokenData(data) {
  try {
    data.updated_at = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Gagal menyimpan data token:', err.message);
  }
}

/**
 * Mencatat pemakaian token untuk agen tertentu
 */
export function recordTokenUsage(agentKey, model, usage, promptText = '', completionText = '') {
  const data = loadTokenData();

  // Hitung token aktual atau estimasi karakter / 4 jika usage kosong
  let promptTokens = usage?.prompt_tokens;
  let completionTokens = usage?.completion_tokens;
  let totalTokens = usage?.total_tokens;

  if (!promptTokens || promptTokens === 0) {
    promptTokens = Math.max(1, Math.round(promptText.length / 3.8));
  }
  if (!completionTokens || completionTokens === 0) {
    completionTokens = Math.max(1, Math.round(completionText.length / 3.8));
  }
  if (!totalTokens || totalTokens === 0) {
    totalTokens = promptTokens + completionTokens;
  }

  // Update summary agen
  if (!data.summary.by_agent[agentKey]) {
    data.summary.by_agent[agentKey] = {
      calls: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      last_model: model,
      last_active: null
    };
  }

  const ag = data.summary.by_agent[agentKey];
  ag.calls += 1;
  ag.prompt_tokens += promptTokens;
  ag.completion_tokens += completionTokens;
  ag.total_tokens += totalTokens;
  ag.last_model = model;
  ag.last_active = new Date().toISOString();

  // Update summary model
  if (!data.summary.by_model[model]) {
    data.summary.by_model[model] = 0;
  }
  data.summary.by_model[model] += totalTokens;

  // Update total kumulatif
  data.summary.total_tokens += totalTokens;
  data.summary.total_calls += 1;

  // Catat riwayat log transaksi (simpan 50 log terakhir)
  data.logs.unshift({
    id: `TOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    agent_key: agentKey,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens
  });

  if (data.logs.length > 50) {
    data.logs = data.logs.slice(0, 50);
  }

  saveTokenData(data);
  return { promptTokens, completionTokens, totalTokens };
}

/**
 * Mengambil ringkasan penggunaan token lengkap untuk API & UI
 */
export function getTokenMetrics() {
  const data = loadTokenData();
  const budget = data.daily_budget || DEFAULT_DAILY_BUDGET;
  const used = data.summary.total_tokens;
  const pct = Math.min(100, (used / budget) * 100);

  const agentRows = Object.entries(data.summary.by_agent).map(([key, item]) => {
    const info = AGENT_INFO[key] || { name: key, lantai: 1, role: 'Unknown' };
    const sharePct = used > 0 ? ((item.total_tokens / used) * 100).toFixed(1) : '0.0';
    return {
      agent_key: key,
      name: info.name,
      role: info.role,
      lantai: info.lantai,
      calls: item.calls,
      prompt_tokens: item.prompt_tokens,
      completion_tokens: item.completion_tokens,
      total_tokens: item.total_tokens,
      share_pct: `${sharePct}%`,
      last_model: item.last_model,
      last_active: item.last_active,
      status: pct >= 90 ? 'KRITIS' : pct >= 70 ? 'WASPADA' : 'AMAN'
    };
  });

  // Urutkan dari konsumen token terbanyak
  agentRows.sort((a, b) => b.total_tokens - a.total_tokens);

  return {
    daily_budget: budget,
    total_tokens_used: used,
    total_calls: data.summary.total_calls,
    budget_used_pct: Number(pct.toFixed(1)),
    budget_remaining: Math.max(0, budget - used),
    status: pct >= 90 ? 'CRITICAL' : pct >= 70 ? 'WARNING' : 'HEALTHY',
    by_agent: agentRows,
    by_model: data.summary.by_model,
    recent_logs: data.logs.slice(0, 10),
    updated_at: data.updated_at
  };
}
