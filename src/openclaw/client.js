/**
 * OpenClaw Client
 * 
 * Client for sending data back to OpenClaw/You.
 */

const fetch = require('node-fetch');

class OpenClawClient {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || process.env.OPENCLAW_URL || 'http://localhost:8080';
    this.token = options.token || process.env.OPENCLAW_TOKEN;
    this.defaultChannel = options.defaultChannel || 'telegram';
    this.defaultTarget = options.defaultTarget || '8388779580';
  }

  /**
   * Send a message back to you via OpenClaw
   */
  async sendMessage(message, options = {}) {
    if (!this.token) {
      console.warn('OPENCLAW_TOKEN not set, skipping message send');
      return { skipped: true };
    }

    const channel = options.channel || this.defaultChannel;
    const target = options.target || this.defaultTarget;

    try {
      const response = await fetch(`${this.gatewayUrl}/api/v1/message/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel,
          target,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Register a cron job with OpenClaw
   */
  async registerCronJob(jobConfig) {
    if (!this.token) {
      console.warn('OPENCLAW_TOKEN not set, cannot register cron job');
      return { skipped: true };
    }

    try {
      const response = await fetch(`${this.gatewayUrl}/api/v1/cron/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job: jobConfig })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to register cron job:', error);
      throw error;
    }
  }

  /**
   * Send thoughts digest to you
   */
  async sendDigest(thoughts) {
    if (thoughts.length === 0) return;

    const message = this._formatDigest(thoughts);
    return this.sendMessage(message);
  }

  _formatDigest(thoughts) {
    const lines = ['🧠 Thought System Digest\n'];
    
    thoughts.forEach((thought, i) => {
      const preview = thought.content.substring(0, 100);
      lines.push(`${i + 1}. ${preview}${thought.content.length > 100 ? '...' : ''}`);
    });

    return lines.join('\n');
  }
}

module.exports = { OpenClawClient };
