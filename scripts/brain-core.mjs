import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.ROUTER_API_URL || 'http://localhost:20128/v1';
const API_KEY = process.env.ROUTER_API_KEY || process.env.API_KEY || 'sk-3bddffff6829d29f-stg200-5e5fbe83';

// 1. Distribusi Merata Multi-Combo (Hanya model yang verified 200 OK & responsif)
// 2. Fallback pool dinamis jika salah satu model rate-limited / error
export const AGENT_MODELS = {
  riset:    { primary: 'combo03', backup: 'combo01', max_tokens: 2500 }, // Raka: Riset mendalam
  konten:   { primary: 'combo01', backup: 'combo03', max_tokens: 2000 }, // Sekar: Kreativitas naskah & hook
  desain:   { primary: 'combo05', backup: 'combo03', max_tokens: 1500 }, // Lita: Visual & layout prompt
  laporan:  { primary: 'combo03', backup: 'combo05', max_tokens: 1500 }, // Doni: QA checklist
  manajer:  { primary: 'combo03', backup: 'combo01', max_tokens: 2000 }, // Bu Ratna: Secretariat & manajer
  cs:       { primary: 'combo03', backup: 'combo01', max_tokens: 1000 }, // Fajar: Respon cepat
  kasir:    { primary: 'combo03', backup: 'combo01', max_tokens: 1200 }, // Dina: Finansial & numerik
  keuangan: { primary: 'combo03', backup: 'combo05', max_tokens: 1200 }, // Sari: Invoice & sponsor
  stok:     { primary: 'combo03', backup: 'combo01', max_tokens: 1000 }, // Bayu: Inventory
  pesanan:  { primary: 'combo03', backup: 'combo05', max_tokens: 1000 }, // Rina: Antrean publish
};

export async function askLLM(agentKey, systemPrompt, userMessage) {
  const conf = AGENT_MODELS[agentKey] || { primary: 'combo03', backup: 'combo01', max_tokens: 1500 };
  const rawList = [conf.primary, conf.backup, 'combo03', 'combo01', 'combo05'];
  const modelsToTry = rawList.filter((v, i, a) => a.indexOf(v) === i);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🤖 [${agentKey.toUpperCase()}] Memanggil model ${model} (Limit Token: ${conf.max_tokens})...`);

      const res = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: conf.max_tokens, // Guardrail token agar tidak boros
          stream: false,
        }),
        signal: AbortSignal.timeout(12000), // Timeout 12 detik agar tidak hang
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ [${model}] Limit/Error (${res.status}): ${errText.substring(0, 100)}... Beralih ke backup.`);
        lastError = new Error(`Status ${res.status}: ${errText}`);
        continue;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err) {
      console.warn(`⚠️ Gagal koneksi ke ${model}: ${err.message}. Mencoba model alternatif...`);
      lastError = err;
    }
  }

  throw lastError || new Error(`Seluruh pool model untuk agen ${agentKey} gagal.`);
}
