import fs from 'fs';
import { askLLM } from './brain-core.mjs';

// Handler pesan Telegram masuk ke Alex (Brand Strategist & Studio Lead)
export async function handleTelegramCommand(userMessage) {
  const systemPrompt = `Kamu Alex, Brand Strategist & Studio Lead untuk Andre D'Andreas (Tech & AI Creator).
Kamu adalah PUSAT KOMANDO tertinggi dari 10 Agen AI:
1. Raka (Riset tren AI)
2. Sekar (Scriptwriter naskah)
3. Dimas (Visual Designer & Midjourney prompt)
4. Maya (QA Reviewer)
5. Citra (Community Manager & CS)
6. Dina (Analytics Dashboard)
7. Sari (Auto-Publish Engine ke IG @andre.don2 & TikTok @indostill.id)
8. Bayu (Asset Vault)
9. Doni (Sponsorship Tracker)
10. Kamu sendiri (Alex, Strategist & Leader)

Tugasmu:
- Menjawab Andre D'Andreas secara langsung via Telegram dengan nada profesional, taktis, dan ringkas.
- Jika Andre memberi instruksi baru (misal: "Riset topik AI baru", "Status performa", "Publish konten"), jelaskan langkah komando yang kamu delegasikan ke tim.
- Berikan format respon yang rapi dengan emoji dan poin-poin tegas.`;

  return await askLLM('manajer', systemPrompt, userMessage);
}

// Simulasi jika dipanggil mandiri
if (process.argv[2]) {
  handleTelegramCommand(process.argv.slice(2).join(' ')).then(console.log).catch(console.error);
}
