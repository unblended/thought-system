/**
 * Webhook Handler
 * 
 * Processes incoming webhooks from OpenClaw and manages thought ingestion.
 */

const { Database } = require('../database');

class WebhookHandler {
  constructor() {
    this.db = new Database();
  }

  /**
   * Handle ingest webhook from OpenClaw
   */
  async handleIngest(data) {
    console.log('Received ingest webhook:', data);

    const { 
      content, 
      source = 'openclaw',
      tags = [],
      metadata = {}
    } = data;

    if (!content) {
      throw new Error('Content is required');
    }

    return this.ingestThought({
      content,
      source,
      tags: Array.isArray(tags) ? tags : [],
      metadata
    });
  }

  /**
   * Ingest a new thought into the database
   */
  async ingestThought({ content, source, tags = [], metadata = {} }) {
    const result = await this.db.run(
      `INSERT INTO thoughts (content, source, tags, metadata, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [
        content,
        source,
        JSON.stringify(tags),
        JSON.stringify(metadata)
      ]
    );

    console.log(`✓ Thought ingested (id: ${result.lastID})`);

    // TODO: Trigger any processing hooks
    // TODO: Send confirmation back to OpenClaw if needed

    return result;
  }

  /**
   * Get recent thoughts
   */
  async getRecentThoughts(limit = 10) {
    return this.db.query(
      `SELECT * FROM thoughts ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
  }

  /**
   * Search thoughts
   */
  async searchThoughts(query) {
    return this.db.query(
      `SELECT * FROM thoughts 
       WHERE content LIKE ? 
       ORDER BY created_at DESC`,
      [`%${query}%`]
    );
  }
}

module.exports = { WebhookHandler };
