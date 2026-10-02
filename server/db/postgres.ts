import { Pool, PoolClient } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const pool: Pool | null = connectionString && connectionString !== 'YOUR_POSTGRESQL_CONNECTION_STRING'
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;

export async function getDatabaseStatus(): Promise<{ connected: boolean; message: string }> {
  if (!pool) {
    return {
      connected: false,
      message: 'DATABASE_URL not configured. Running with in-memory resilient fallback engine.'
    };
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return { connected: true, message: 'PostgreSQL database connected and operational.' };
  } catch (err: any) {
    return { connected: false, message: `PostgreSQL connection error: ${err.message}` };
  }
}

/**
 * Runs initial schema migrations on PostgreSQL if connected.
 * Creates all 16 required relational entities with constraints.
 */
export async function initializePostgresSchema(): Promise<void> {
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        permissions JSONB DEFAULT '[]'::jsonb
      );
    `);

    // 2. users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        bio TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. plans
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        monthly_price NUMERIC(10, 2) NOT NULL,
        yearly_price NUMERIC(10, 2) NOT NULL,
        credits_monthly INTEGER NOT NULL,
        max_duration_minutes INTEGER NOT NULL,
        has_watermark BOOLEAN DEFAULT FALSE,
        priority_processing BOOLEAN DEFAULT FALSE,
        features JSONB DEFAULT '[]'::jsonb
      );
    `);

    // 5. subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) REFERENCES plans(id),
        billing_cadence VARCHAR(20) DEFAULT 'monthly',
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        current_period_end TIMESTAMP WITH TIME ZONE
      );
    `);

    // 6. credit_balances
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_balances (
        user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        balance INTEGER NOT NULL DEFAULT 50,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7. credit_transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 8. projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        raw_prompt TEXT NOT NULL,
        creation_mode VARCHAR(50) DEFAULT 'text',
        aspect_ratio VARCHAR(20) DEFAULT '16:9',
        duration VARCHAR(20) DEFAULT '30s',
        style VARCHAR(50) DEFAULT 'cinematic',
        credit_cost INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'queued',
        progress_percentage INTEGER DEFAULT 0,
        current_step_message TEXT,
        final_video_url TEXT,
        thumbnail_url TEXT,
        has_watermark BOOLEAN DEFAULT FALSE,
        is_public_share BOOLEAN DEFAULT FALSE,
        share_id VARCHAR(100),
        creative_brief JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 9. videos
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        duration_seconds NUMERIC(10, 2) NOT NULL,
        resolution VARCHAR(50),
        format VARCHAR(20) DEFAULT 'mp4',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 10. scenes
    await client.query(`
      CREATE TABLE IF NOT EXISTS scenes (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
        chapter_id VARCHAR(100),
        scene_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        duration_seconds NUMERIC(10, 2) NOT NULL,
        visual_prompt TEXT NOT NULL,
        camera_movement TEXT,
        lighting TEXT,
        narration_text TEXT,
        subtitle_text TEXT,
        character_ids JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'queued',
        retry_count INTEGER DEFAULT 0,
        media_url TEXT,
        thumbnail_url TEXT,
        audio_url TEXT,
        error_message TEXT
      );
    `);

    // 11. scene_versions
    await client.query(`
      CREATE TABLE IF NOT EXISTS scene_versions (
        id VARCHAR(100) PRIMARY KEY,
        scene_id VARCHAR(100) REFERENCES scenes(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL DEFAULT 1,
        visual_prompt TEXT NOT NULL,
        media_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 12. generation_jobs
    await client.query(`
      CREATE TABLE IF NOT EXISTS generation_jobs (
        id VARCHAR(100) PRIMARY KEY,
        project_id VARCHAR(100) REFERENCES projects(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'queued',
        progress INTEGER DEFAULT 0,
        current_stage VARCHAR(50),
        total_scenes INTEGER DEFAULT 0,
        completed_scenes INTEGER DEFAULT 0,
        failed_scenes INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_time TIMESTAMP WITH TIME ZONE
      );
    `);

    // 13. payments (with UNIQUE constraint on txid to prevent duplicates)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) REFERENCES plans(id),
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(20) DEFAULT 'USDT',
        network VARCHAR(20) NOT NULL,
        destination_address VARCHAR(255) NOT NULL,
        txid VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL,
        verification_data TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        verified_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 14. templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        suggested_aspect_ratio VARCHAR(20),
        suggested_duration VARCHAR(20),
        suggested_style VARCHAR(50),
        prompt_placeholder TEXT,
        preview_thumbnail_url TEXT,
        tags JSONB DEFAULT '[]'::jsonb
      );
    `);

    // 15. notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 16. admin_logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        action VARCHAR(100) NOT NULL,
        actor VARCHAR(255) NOT NULL,
        details TEXT NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Database schema verified and synchronized.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Failed to initialize database schema:', err);
  } finally {
    client.release();
  }
}
