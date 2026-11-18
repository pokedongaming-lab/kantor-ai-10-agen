// CLI Monitor Pemakaian Token 10 Agen AI — Andre D'Andreas
// Jalankan dengan: node scripts/token-monitor.mjs atau npm run tokens
import { getTokenMetrics } from './token-tracker.mjs';

function renderProgressBar(percentage, width = 30) {
  const p = Math.max(0, Math.min(100, percentage));
  const filled = Math.round((p / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${p.toFixed(1)}%`;
}

export function displayTokenMonitor() {
  const m = getTokenMetrics();

  console.log('\n' + '═'.repeat(78));
  console.log("🪙  MONITOR PEMAKAIAN TOKEN 10 AGEN AI — ANDRE D'ANDREAS (indostill.id)");
  console.log('═'.repeat(78));

  // 1. Status Kuota Harian
  console.log(`\n📌 KUOTA HARIAN STUDIO:`);
  console.log(`   Budget Kuota   : ${m.daily_budget.toLocaleString()} Token / Hari`);
  console.log(`   Terpakai       : ${m.total_tokens_used.toLocaleString()} Token (${m.total_calls} Panggilan AI)`);
  console.log(`   Sisa Kuota     : ${m.budget_remaining.toLocaleString()} Token`);
  console.log(`   Beban Studio   : ${renderProgressBar(m.budget_used_pct, 36)}`);
  
  const statusColor = m.status === 'HEALTHY' ? '🟢 SEHAT (Aman)' : m.status === 'WARNING' ? '🟡 WASPADA (>70%)' : '🔴 KRITIS (>90%)';
  console.log(`   Status Biaya   : ${statusColor}`);

  // 2. Tabel Breakdown 10 Agen
  console.log('\n' + '─'.repeat(78));
  console.log('👥 BREAKDOWN PEMAKAIAN TOKEN PER AGEN:');
  console.log('─'.repeat(78));
  console.log(
    'Lantai'.padEnd(8) +
    'Agen'.padEnd(10) +
    'Peran / Tugas'.padEnd(28) +
    'Calls'.padEnd(7) +
    'Prompt'.padEnd(9) +
    'Out'.padEnd(8) +
    'Total'.padEnd(10) +
    'Porsi'
  );
  console.log('─'.repeat(78));

  for (const ag of m.by_agent) {
    const floorLabel = ag.lantai === 2 ? 'Lt 2' : 'Lt 1';
    console.log(
      floorLabel.padEnd(8) +
      ag.name.padEnd(10) +
      ag.role.substring(0, 26).padEnd(28) +
      String(ag.calls).padEnd(7) +
      ag.prompt_tokens.toLocaleString().padEnd(9) +
      ag.completion_tokens.toLocaleString().padEnd(8) +
      ag.total_tokens.toLocaleString().padEnd(10) +
      ag.share_pct
    );
  }

  // 3. Distribusi Model 9Router
  console.log('\n' + '─'.repeat(78));
  console.log('🤖 DISTRIBUSI PENGGUNAAN MODEL (9ROUTER POOL):');
  console.log('─'.repeat(78));
  const models = Object.entries(m.by_model);
  if (models.length === 0) {
    console.log('   (Belum ada transaksi LLM yang dicatat hari ini)');
  } else {
    for (const [model, count] of models) {
      const share = m.total_tokens_used > 0 ? ((count / m.total_tokens_used) * 100).toFixed(1) : '0.0';
      console.log(`   • ${model.padEnd(15)}: ${count.toLocaleString().padStart(8)} token (${share}%)`);
    }
  }

  // 4. Log Transaksi Terakhir
  if (m.recent_logs.length > 0) {
    console.log('\n' + '─'.repeat(78));
    console.log('⏱️  5 TRANSAKSI TOKEN TERAKHIR:');
    console.log('─'.repeat(78));
    m.recent_logs.slice(0, 5).forEach((log, idx) => {
      const time = new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(`   [${time}] ${log.agent_key.toUpperCase()} via ${log.model} -> ${log.total_tokens} token (in: ${log.prompt_tokens}, out: ${log.completion_tokens})`);
    });
  }

  console.log('═'.repeat(78) + '\n');
}

if (process.argv[1]?.endsWith('token-monitor.mjs')) {
  displayTokenMonitor();
}
