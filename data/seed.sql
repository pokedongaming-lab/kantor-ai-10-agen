-- ====================================================================
-- AI CONTENT MANAGEMENT SYSTEM (AI CMS) - INITIAL SEED DATA
-- ====================================================================

-- 1. SEED 10 AGENTS
INSERT INTO agents (agent_key, name, role, model, status, responsibilities, kpi) VALUES
('manajer', 'Bu Ratna', 'Chief Content Strategist & Editorial Director', 'combo_secretariat', 'ACTIVE', 
 ARRAY['Positioning personal brand', 'Content pillar & theme strategy', 'Cross-agent orchestration', 'Executive editorial final approval', 'Growth strategy review'],
 '{"approval_accuracy": "99%", "team_coordination": "High", "brand_alignment": "100%"}'::jsonb),

('riset', 'Raka', 'Trend Intelligence & SEO Research Specialist', 'combo01', 'ACTIVE',
 ARRAY['TikTok, IG, YouTube & Tech Trends radar', 'Long-tail keyword research', 'Content Opportunity Score (COS)', 'Source verification'],
 '{"research_accuracy": "95%", "trend_velocity": "<2h", "opp_score_precision": "92%"}'::jsonb),

('konten', 'Sekar', 'Content Strategist, Scriptwriter & Copywriter', 'combo01', 'ACTIVE',
 ARRAY['30-45s TikTok scriptwriting', 'Curiosity gap & storytelling', '3 alternative hooks generation', 'SEO caption & hashtags'],
 '{"script_approval_rate": "90%", "avg_retention_target": ">75%", "hook_impact": "High"}'::jsonb),

('desain', 'Lita', 'Visual Content & Creative Director', 'combo05', 'ACTIVE',
 ARRAY['Per-scene storyboard generation', 'Cover & thumbnail styling', 'Visual brief authoring', 'Mobile screen visual hierarchy'],
 '{"visual_consistency": "98%", "readability": "100%", "brief_completion": "96%"}'::jsonb),

('laporan', 'Doni', 'Editorial Quality Assurance & Fact Checker', 'combo_compliance', 'ACTIVE',
 ARRAY['Spelling, grammar & fact verification', 'Hook-to-payoff continuity audit', 'Content Quality Score (CQS) calculation', 'Copyright & platform policy compliance'],
 '{"fact_accuracy": "100%", "qc_turnaround": "<5m", "zero_copyright_infringement": "100%"}'::jsonb),

('stok', 'Bayu', 'Media Asset & Creative Library Manager', 'combo06', 'ACTIVE',
 ARRAY['B-roll footage, audio & SFX curation', 'Asset indexing & tagging', 'Copyright & license compliance', 'Storyboard asset retrieval'],
 '{"retrieval_speed": "<3s", "indexing_coverage": "99%", "royalty_free_compliance": "100%"}'::jsonb),

('pesanan', 'Rina', 'Content Scheduler & Publishing Operations', 'combo02', 'ACTIVE',
 ARRAY['Editorial calendar management', 'Historical best posting time dispatch', 'n8n webhook auto-publish', 'Publishing log & retry execution'],
 '{"publishing_success_rate": "99.5%", "schedule_accuracy": "100%", "error_recovery": "Automatic"}'::jsonb),

('cs', 'Fajar', 'Community Growth & Engagement Manager', 'combo02', 'ACTIVE',
 ARRAY['Comment categorization & sentiment analysis', 'Interactive response drafts', 'Community Q&A and polling ideas', 'Reputation crisis radar'],
 '{"avg_response_time": "<10m", "sentiment_coverage": "95%", "community_ideas_submitted": "15/wk"}'::jsonb),

('keuangan', 'Sari', 'Partnership, Sponsorship & Affiliate Analyst', 'combo_finance', 'ACTIVE',
 ARRAY['Affiliate UTM link tracking', 'CTR, conversion & lead analytics', 'Brand partner deliverable monitoring', 'Sponsorship campaign performance'],
 '{"tracking_accuracy": "100%", "campaign_delivery_rate": "100%", "lead_attribution": "Exact"}'::jsonb),

('kasir', 'Dina', 'Audience Intelligence & Performance Analyst', 'combo_finance', 'ACTIVE',
 ARRAY['Views, reach & engagement analytics', 'Watch time & retention analysis', 'Top 10 vs Bottom 10 content ranking', 'Weekly & Monthly growth reports'],
 '{"data_accuracy": "99.9%", "report_punctuality": "100%", "recommendation_yield": "+25% growth"}'::jsonb)
ON CONFLICT (agent_key) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    model = EXCLUDED.model,
    responsibilities = EXCLUDED.responsibilities,
    kpi = EXCLUDED.kpi;

-- 2. SEED SYSTEM SETTINGS
INSERT INTO system_settings (key_name, value_data, category) VALUES
('content_pillars', '[
    {"name": "AI Tools", "target_pct": 25, "purpose": "AWARENESS"},
    {"name": "Technology Updates", "target_pct": 20, "purpose": "AUTHORITY"},
    {"name": "Coding & Programming", "target_pct": 20, "purpose": "EDUCATION"},
    {"name": "AI Automation", "target_pct": 15, "purpose": "CONVERSION"},
    {"name": "Digital Business", "target_pct": 10, "purpose": "ENGAGEMENT"},
    {"name": "Tech Experiments", "target_pct": 10, "purpose": "COMMUNITY"}
]'::jsonb, 'STRATEGY'),

('ai_providers', '{
    "active_provider": "9router",
    "endpoint": "http://localhost:20128/v1",
    "models": ["combo01", "combo02", "combo05", "combo06", "combo09", "combo_secretariat", "combo_compliance", "combo_finance"]
}'::jsonb, 'INTEGRATIONS'),

('publishing_endpoints', '{
    "n8n_webhook": "http://localhost:5678/webhook/auto-publish-andre",
    "telegram_bot": "@agentratna_bot",
    "tiktok_handle": "@indostill.id",
    "instagram_handle": "@andre.don2"
}'::jsonb, 'INTEGRATIONS')
ON CONFLICT (key_name) DO UPDATE SET value_data = EXCLUDED.value_data;

-- 3. SEED INITIAL CONTENT MASTER (CNT-2026-001: DEEPSEEK-R1)
INSERT INTO contents (
    content_id, title, topic, platform, pillar, target_audience, owner_agent, 
    status, qc_score, approval_status, publication_url
) VALUES (
    'CNT-2026-001',
    'DeepSeek-R1: AI Murah Yang Menantang OpenAI',
    'Open-Source AI Reasoning Model',
    'TikTok',
    'AI Tools',
    'Developer, Software Engineer & Tech Enthusiast',
    'Bu Ratna',
    'PUBLISHED',
    94.50,
    'APPROVED',
    'http://localhost:5173/video_deepseek.mp4'
) ON CONFLICT (content_id) DO NOTHING;

-- 4. SEED SCRIPT FOR CNT-2026-001
INSERT INTO content_scripts (
    content_id, hook, curiosity_gap, main_content, payoff, cta, full_script, alt_hooks, caption, hashtags, estimated_duration_sec, word_count
) VALUES (
    'CNT-2026-001',
    'Bayangin punya AI yang bisa mikir kompleks seperti OpenAI o1, tapi bisa kamu jalankan sendiri di komputer!',
    'Kenalin, DeepSeek-R1! Model AI reasoning yang bikin industri teknologi melirik. Kemampuannya dalam matematika, coding, dan penalaran diklaim sebanding dengan OpenAI o1.',
    'Yang menarik, model ini punya bobot terbuka. Bahkan, kamu bisa menjalankannya secara lokal menggunakan Ollama. Tinggal buka terminal, ketik: ollama run deepseek-r1. Dan AI langsung berjalan di komputermu!',
    'Artinya? Kamu bisa mengurangi ketergantungan pada API berbayar dan, jika dikonfigurasi lokal, data yang kamu proses tidak perlu dikirim ke server AI eksternal.',
    'Developer, masih mau bakar uang buat API? Save video ini dan tag temanmu yang wajib nyobain!',
    'Bayangin punya AI yang bisa mikir kompleks seperti OpenAI o1, tapi bisa kamu jalankan sendiri di komputer! Kenalin, DeepSeek-R1! Model AI reasoning yang bikin industri teknologi melirik. Kemampuannya dalam matematika, coding, dan penalaran diklaim sebanding dengan OpenAI o1. Yang menarik, model ini punya bobot terbuka. Bahkan, kamu bisa menjalankannya secara lokal menggunakan Ollama. Tinggal buka terminal, ketik: ollama run deepseek-r1. Dan AI langsung berjalan di komputermu! Artinya? Kamu bisa mengurangi ketergantungan pada API berbayar dan, jika dikonfigurasi lokal, data yang kamu proses tidak perlu dikirim ke server AI eksternal. Developer, masih mau bakar uang buat API? Save video ini dan tag temanmu yang wajib nyobain!',
    '["Model AI reasoning ini bantai OpenAI o1 tapi gratis?!", "Developer stop bakar duit API! AI ini jalan lokal offline", "Cara jalanin DeepSeek-R1 di laptop spek pas-pasan"]'::jsonb,
    'DeepSeek-R1 resmi rilis dan bisa kamu jalankan 100% lokal di komputer tanpa bayar API sepeserpun! Simak caranya di video ini.',
    ARRAY['#DeepSeekR1', '#OpenAI', '#LocalAI', '#Ollama', '#Coding', '#indostill'],
    45,
    105
) ON CONFLICT (content_id) DO NOTHING;

-- 5. SEED QC SCORECARD FOR CNT-2026-001
INSERT INTO content_qc (
    content_id, inspector_agent, hook_score, story_score, fact_score, retention_score, visual_score, edu_score, cta_score, total_cqs, status, fact_check_report, revision_notes
) VALUES (
    'CNT-2026-001',
    'Doni',
    19.0, -- Hook (max 20)
    14.5, -- Story (max 15)
    20.0, -- Fact (max 20)
    14.0, -- Retention (max 15)
    9.5,  -- Visual (max 10)
    9.0,  -- Edu (max 10)
    8.5,  -- CTA (max 10)
    94.50,
    'PASS',
    'Akurasi klaim DeepSeek-R1 terverifikasi melalui technical paper resmi. Syntax ollama run deepseek-r1 valid. Lisensi MIT/Apache 2.0 open weights valid.',
    'Lolos seluruh kriteria editorial studio. Siap diajukan ke Bu Ratna untuk final approval.'
) ON CONFLICT (content_id) DO NOTHING;

-- 6. SEED APPROVAL FOR CNT-2026-001
INSERT INTO content_approvals (
    content_id, approver_agent, decision, editorial_notes
) VALUES (
    'CNT-2026-001',
    'Bu Ratna',
    'APPROVED',
    'Naskah sangat kuat, relevan dengan kebutuhan developer lokal yang terbebani biaya API. Disetujui rilis ke TikTok & Instagram Reels.'
) ON CONFLICT (content_id) DO NOTHING;

-- 7. SEED SECOND UPCOMING CONTENT (CNT-2026-002: BROWSER-USE)
INSERT INTO contents (
    content_id, title, topic, platform, pillar, target_audience, owner_agent, status, qc_score, approval_status
) VALUES (
    'CNT-2026-002',
    'Browser-Use: Agentic AI Pengambil Alih Web Otomatis',
    'Agentic AI Web Automation',
    'TikTok',
    'AI Automation',
    'Programmer & AI Automation Engineer',
    'Bu Ratna',
    'SCRIPT_READY',
    NULL,
    'PENDING'
) ON CONFLICT (content_id) DO NOTHING;

INSERT INTO content_ideas (
    content_id, title, pillar, trend_source, opportunity_score, viral_potential, audience_relevance, trend_momentum, share_save_potential, brand_relevance, seo_potential, status
) VALUES (
    'CNT-2026-002',
    'Browser-Use: Agentic AI Pengambil Alih Web Otomatis',
    'AI Automation',
    'GitHub Trending & Reddit r/LocalLLaMA',
    88.50,
    22.5,
    18.0,
    18.5,
    14.0,
    8.5,
    7.0,
    'APPROVED'
) ON CONFLICT (content_id) DO NOTHING;
