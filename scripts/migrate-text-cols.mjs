import { query, pool } from './db.mjs';

async function migrate() {
  try {
    await query(`
      ALTER TABLE contents ALTER COLUMN title TYPE TEXT;
      ALTER TABLE contents ALTER COLUMN topic TYPE TEXT;
      ALTER TABLE contents ALTER COLUMN target_audience TYPE TEXT;
      ALTER TABLE content_ideas ALTER COLUMN title TYPE TEXT;
      ALTER TABLE content_ideas ALTER COLUMN trend_source TYPE TEXT;
      ALTER TABLE content_storyboards ALTER COLUMN scene_title TYPE TEXT;
      ALTER TABLE media_assets ALTER COLUMN source TYPE TEXT;
    `);
    console.log('✅ Migration complete: Columns expanded to TEXT');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
