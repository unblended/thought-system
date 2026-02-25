/**
 * API Server
 * 
 * Express server for handling OpenClaw webhooks and API requests.
 */

const express = require('express');
const { WebhookHandler } = require('./openclaw/webhook-handler');

class APIServer {
  constructor(options = {}) {
    this.port = options.port || process.env.THOUGHT_SYSTEM_PORT || 3456;
    this.app = express();
    this.handler = new WebhookHandler();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        service: 'thought-system',
        timestamp: new Date().toISOString()
      });
    });

    // OpenClaw webhook endpoint - ingest thoughts
    this.app.post('/webhooks/ingest', async (req, res) => {
      try {
        await this.handler.handleIngest(req.body);
        res.json({ received: true, processed: true });
      } catch (error) {
        console.error('Webhook ingest error:', error);
        res.status(500).json({ received: true, error: error.message });
      }
    });

    // Manual thought ingestion
    this.app.post('/ingest', async (req, res) => {
      try {
        const { content, source = 'api', tags = [] } = req.body;
        
        if (!content) {
          return res.status(400).json({ error: 'Content is required' });
        }

        const result = await this.handler.ingestThought({
          content,
          source,
          tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
        });

        res.json({ success: true, thoughtId: result.lastID });
      } catch (error) {
        console.error('Ingest error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Update endpoint (called to trigger update)
    this.app.post('/admin/update', async (req, res) => {
      try {
        const { Updater } = require('./updater');
        const updater = new Updater();
        
        const check = await updater.checkForUpdates();
        if (!check.hasUpdate) {
          return res.json({ success: true, message: 'Already up to date' });
        }

        // Don't await - let update run in background
        updater.update().catch(console.error);
        
        res.json({ 
          success: true, 
          message: 'Update started',
          from: check.current,
          to: check.latest
        });
      } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get thoughts
    this.app.get('/thoughts', async (req, res) => {
      try {
        const { Database } = require('./database');
        const db = new Database();
        const thoughts = await db.query(
          'SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 100'
        );
        res.json({ thoughts });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🌐 Thought System API listening on port ${this.port}`);
      console.log(`   Health check: http://localhost:${this.port}/health`);
    });
  }
}

module.exports = { APIServer };
