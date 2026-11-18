-- ====================================================================
-- AI CONTENT MANAGEMENT SYSTEM (AI CMS) - DATABASE SCHEMA (PostgreSQL)
-- Database: aicms
-- ====================================================================

-- 1. AGENTS
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    agent_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    kpi JSONB DEFAULT '{}',
    responsibilities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONTENTS MASTER
CREATE TABLE IF NOT EXISTS contents (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(150),
    platform VARCHAR(50) NOT NULL, -- TikTok, Instagram, YouTube, Blog
    pillar VARCHAR(100) NOT NULL,   -- AI Tools, Coding & Tech, AI News, etc.
    target_audience VARCHAR(150),
    owner_agent VARCHAR(50) DEFAULT 'Bu Ratna',
    status VARCHAR(50) NOT NULL DEFAULT 'IDE', 
    -- Status Enum: IDE, RESEARCHED, SCRIPT_READY, IN_PRODUCTION, QC_REVIEW, REVISION, APPROVAL, SCHEDULED, PUBLISHED, ANALYZED
    creation_date DATE DEFAULT CURRENT_DATE,
    deadline TIMESTAMP WITH TIME ZONE,
    publication_date TIMESTAMP WITH TIME ZONE,
    qc_score NUMERIC(5,2) DEFAULT NULL,
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REVISED, REJECTED
    publication_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AGENT TASKS (Queue & Activity Log)
CREATE TABLE IF NOT EXISTS agent_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    agent_key VARCHAR(50) NOT NULL,
    content_id VARCHAR(50) REFERENCES contents(content_id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    input_payload JSONB DEFAULT '{}',
    output_payload JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, RUNNING, WAITING, COMPLETED, FAILED, CANCELLED
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. CONTENT IDEAS (Raka & Bu Ratna)
CREATE TABLE IF NOT EXISTS content_ideas (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) UNIQUE REFERENCES contents(content_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    pillar VARCHAR(100) NOT NULL,
    trend_source VARCHAR(150),
    opportunity_score NUMERIC(5,2) DEFAULT 0,
    viral_potential NUMERIC(5,2) DEFAULT 0,
    audience_relevance NUMERIC(5,2) DEFAULT 0,
    trend_momentum NUMERIC(5,2) DEFAULT 0,
    share_save_potential NUMERIC(5,2) DEFAULT 0,
    brand_relevance NUMERIC(5,2) DEFAULT 0,
    seo_potential NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'APPROVED', -- PROPOSED, APPROVED, REJECTED, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CONTENT SCRIPTS (Sekar)
CREATE TABLE IF NOT EXISTS content_scripts (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) UNIQUE REFERENCES contents(content_id) ON DELETE CASCADE,
    hook TEXT NOT NULL,
    curiosity_gap TEXT,
    main_content TEXT NOT NULL,
    payoff TEXT NOT NULL,
    cta TEXT NOT NULL,
    full_script TEXT NOT NULL,
    alt_hooks JSONB DEFAULT '[]',
    caption TEXT,
    hashtags TEXT[],
    visual_directions TEXT,
    estimated_duration_sec INT DEFAULT 45,
    word_count INT DEFAULT 100,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONTENT STORYBOARDS (Lita)
CREATE TABLE IF NOT EXISTS content_storyboards (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) REFERENCES contents(content_id) ON DELETE CASCADE,
    scene_idx INT NOT NULL,
    act VARCHAR(50) NOT NULL,
    scene_title VARCHAR(150) NOT NULL,
    start_ms INT NOT NULL,
    end_ms INT NOT NULL,
    visual_prompt TEXT NOT NULL,
    on_screen_text TEXT,
    image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MEDIA ASSETS (Bayu)
CREATE TABLE IF NOT EXISTS media_assets (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- video_clip, background, audio, sfx, cover
    file_path TEXT NOT NULL,
    file_size BIGINT,
    resolution VARCHAR(50),
    duration_sec NUMERIC(6,2),
    source VARCHAR(150),
    license_status VARCHAR(50) DEFAULT 'ROYALTY_FREE',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CONTENT QUALITY CONTROL (Doni)
CREATE TABLE IF NOT EXISTS content_qc (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) UNIQUE REFERENCES contents(content_id) ON DELETE CASCADE,
    inspector_agent VARCHAR(50) DEFAULT 'Doni',
    hook_score NUMERIC(5,2) NOT NULL,        -- 20%
    story_score NUMERIC(5,2) NOT NULL,       -- 15%
    fact_score NUMERIC(5,2) NOT NULL,        -- 20%
    retention_score NUMERIC(5,2) NOT NULL,   -- 15%
    visual_score NUMERIC(5,2) NOT NULL,      -- 10%
    edu_score NUMERIC(5,2) NOT NULL,         -- 10%
    cta_score NUMERIC(5,2) NOT NULL,         -- 10%
    total_cqs NUMERIC(5,2) NOT NULL,         -- Total Content Quality Score
    status VARCHAR(50) NOT NULL,             -- PASS (>=90), REVISE (75-89), REJECT (<75)
    fact_check_report TEXT,
    revision_notes TEXT,
    copyright_compliant BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CONTENT APPROVALS (Bu Ratna)
CREATE TABLE IF NOT EXISTS content_approvals (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) UNIQUE REFERENCES contents(content_id) ON DELETE CASCADE,
    approver_agent VARCHAR(50) DEFAULT 'Bu Ratna',
    decision VARCHAR(50) NOT NULL, -- APPROVED, REVISED, REJECTED
    editorial_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. EDITORIAL CALENDAR & PUBLISHING (Rina)
CREATE TABLE IF NOT EXISTS editorial_calendar (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) REFERENCES contents(content_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, DISPATCHED, PUBLISHED, FAILED
    retry_count INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    post_url TEXT,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. COMMUNITY INTERACTIONS (Fajar)
CREATE TABLE IF NOT EXISTS community_interactions (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    comment_text TEXT NOT NULL,
    sentiment VARCHAR(50) DEFAULT 'NEUTRAL', -- POSITIVE, NEUTRAL, CRITIQUE, QUESTION
    category VARCHAR(50) DEFAULT 'GENERAL',  -- QUESTION, FEEDBACK, OPPORTUNITY, SPAM
    draft_reply TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',    -- PENDING, APPROVED, SENT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. AFFILIATE & SPONSORSHIPS (Sari) - NO FINANCIAL DATA EXPOSED
CREATE TABLE IF NOT EXISTS affiliate_campaigns (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(150) NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    utm_link TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    clicks INT DEFAULT 0,
    leads INT DEFAULT 0,
    ctr NUMERIC(5,2) DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0,
    deliverables_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, PENDING_REVIEW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. ANALYTICS & METRICS (Dina)
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) REFERENCES contents(content_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    views INT DEFAULT 0,
    reach INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    saves INT DEFAULT 0,
    retention_rate NUMERIC(5,2) DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value_data JSONB NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
