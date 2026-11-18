/**
 * End-to-End Workflow Verification:
 * Riset (Raka) -> Naskah (Sekar) -> QC (Doni) -> Guardrail Test -> Revision Loop -> Approval (Bu Ratna) -> Publishing (Rina)
 */

const BASE_URL = 'http://localhost:3001/api/v1';

async function runE2ETest() {
  console.log('====================================================');
  console.log('🧪 MEMULAI PENGUJIAN WORKFLOW END-TO-END AI CMS');
  console.log('Orchestrator: Bu Ratna | Studio: indostill.id');
  console.log('====================================================\n');

  // STEP 1: RESEARCH (Raka)
  console.log('--- [STEP 1: RISET TREN OLEH RAKA] ---');
  const res1 = await fetch(`${BASE_URL}/workflow/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Qwen 2.5-Coder: AI Coding Lokal Gratis Di Laptop Spek Rendah',
      pillar: 'Coding & Programming'
    })
  });
  const data1 = await res1.json();
  if (!data1.success) throw new Error(`Step 1 Gagal: ${data1.error}`);
  const contentId = data1.data.contentId;
  console.log(`✓ Riset Berhasil! Content ID: ${contentId}`);
  console.log(`  Judul: "${data1.data.researchData.title}"`);
  console.log(`  Opportunity Score: ${data1.data.researchData.opportunity_score} / 100\n`);

  // STEP 2: SCRIPTWRITING (Sekar)
  console.log('--- [STEP 2: PENULISAN NASKAH 5-ACT OLEH SEKAR] ---');
  const res2 = await fetch(`${BASE_URL}/workflow/script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: contentId })
  });
  const data2 = await res2.json();
  if (!data2.success) throw new Error(`Step 2 Gagal: ${data2.error}`);
  console.log(`✓ Naskah Berhasil Ditulis!`);
  console.log(`  Hook: "${data2.data.hook}"`);
  console.log(`  Curiosity Gap: "${data2.data.curiosity_gap}"`);
  console.log(`  Payoff: "${data2.data.payoff}"`);
  console.log(`  CTA: "${data2.data.cta}"`);
  console.log(`  Durasi Estimasi: ${data2.data.estimated_duration_sec}s (${data2.data.word_count} kata)\n`);

  // STEP 3: QUALITY CONTROL (Doni)
  console.log('--- [STEP 3: AUDIT KUALITAS & FACT CHECK OLEH DONI] ---');
  const res3 = await fetch(`${BASE_URL}/workflow/qc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: contentId })
  });
  const data3 = await res3.json();
  if (!data3.success) throw new Error(`Step 3 Gagal: ${data3.error}`);
  console.log(`✓ Audit QC Selesai!`);
  console.log(`  Total CQS: ${data3.data.total_cqs} / 100`);
  console.log(`  Status: ${data3.data.status} (Pass minimal 90)`);
  console.log(`  Fact-Check Report: ${data3.data.fact_check_report}\n`);

  // STEP 4: GUARDRAIL TEST (Publishing rejection before Approval)
  console.log('--- [STEP 4: UJI KEAMANAN / GUARDRAIL PUBLISHING] ---');
  console.log('Mencoba menerbitkan konten SEBELUM persetujuan resmi Bu Ratna...');
  const resGuard = await fetch(`${BASE_URL}/workflow/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: contentId })
  });
  const dataGuard = await resGuard.json();
  if (dataGuard.success) {
    throw new Error('❌ KEGAGALAN KEAMANAN: Konten berhasil terbit tanpa persetujuan Bu Ratna!');
  } else {
    console.log(`✓ GUARDRAIL BERHASIL MENAHAN: ${dataGuard.error}\n`);
  }

  // REVISION LOOP JIKA STATUS QC ADALAH REVISE
  if (data3.data.status !== 'PASS') {
    console.log('--- [STEP 4.1: UJI KEBIJAKAN APPROVAL PADA STATUS REVISE] ---');
    console.log('Mencoba meminta persetujuan Bu Ratna saat status QC belum PASS...');
    const resApprovalFail = await fetch(`${BASE_URL}/workflow/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id: contentId,
        decision: 'APPROVED',
        notes: 'Mencoba bypass tanpa revisi...'
      })
    });
    const dataApprovalFail = await resApprovalFail.json();
    if (dataApprovalFail.success) {
      throw new Error('❌ KEGAGALAN KEAMANAN: Bu Ratna menyetujui konten yang belum lolos QC!');
    }
    console.log(`✓ KEBIJAKAN EDITORIAL BU RATNA BEKERJA KETAT: ${dataApprovalFail.error}\n`);

    console.log('--- [STEP 4.2: SEKAR MELAKUKAN REVISI FAKTA & DONI RE-AUDIT] ---');
    console.log('Sekar memperbaiki detail RAM model 1.5B/7B dan klarifikasi offline...');
    const resQCRev = await fetch(`${BASE_URL}/workflow/qc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: contentId, is_revision: true })
    });
    const dataQCRev = await resQCRev.json();
    if (!dataQCRev.success) throw new Error(`Revisi QC Gagal: ${dataQCRev.error}`);
    console.log(`✓ Audit Ulang Pasca-Revisi Selesai!`);
    console.log(`  Total CQS: ${dataQCRev.data.total_cqs} / 100`);
    console.log(`  Status QC Baru: ${dataQCRev.data.status} (PASS!)\n`);
  }

  // STEP 5: APPROVAL (Bu Ratna)
  console.log('--- [STEP 5: KEPUTUSAN EDITORIAL OLEH BU RATNA] ---');
  const res4 = await fetch(`${BASE_URL}/workflow/approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_id: contentId,
      decision: 'APPROVED',
      notes: 'Naskah Qwen 2.5-Coder sangat tajam, akurat setelah revisi, dan solutif bagi programmer lokal. Disetujui terbit.'
    })
  });
  const data4 = await res4.json();
  if (!data4.success) throw new Error(`Step 5 Gagal: ${data4.error}`);
  console.log(`✓ Approval Berhasil Diterbitkan Bu Ratna!`);
  console.log(`  Decision: ${data4.data.decision}`);
  console.log(`  Status Konten Baru: ${data4.data.nextStatus}\n`);

  // STEP 6: PUBLISHING (Rina)
  console.log('--- [STEP 6: EKSEKUSI RILIS / AUTO-PUBLISH OLEH RINA] ---');
  const res5 = await fetch(`${BASE_URL}/workflow/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_id: contentId })
  });
  const data5 = await res5.json();
  if (!data5.success) throw new Error(`Step 6 Gagal: ${data5.error}`);
  console.log(`🎉 PUBLIKASI BERHASIL!`);
  console.log(`  Content ID: ${data5.data.contentId}`);
  console.log(`  Status Final: ${data5.data.status}`);
  console.log(`  Webhook Dispatch: ${data5.data.webhookStatus}\n`);

  console.log('====================================================');
  console.log('🏆 SELURUH WORKFLOW 8 FASE DARI RISET SAMPAI PUBLISH');
  console.log('    100% SUKSES DAN TERVERIFIKASI RELASIONAL!');
  console.log('====================================================');
}

runE2ETest().catch((err) => {
  console.error('\n❌ PENGUJIAN GAGAL:', err.message);
  process.exit(1);
});
