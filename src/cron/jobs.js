/**
 * Cron Jobs
 * 
 * Periodic tasks for the thought system.
 */

const { Database } = require('../database');
const { OpenClawClient } = require('../openclaw/client');

class CronJobs {
  constructor() {
    this.db = new Database();
    this.client = new OpenClawClient();
  }

  /**
   * Hourly job - process recent thoughts, send digest if needed
   */
  async hourly() {
    console.log('Running hourly job...');

    // Get thoughts from last hour
    const thoughts = await this.db.query(
      `SELECT * FROM thoughts 
       WHERE created_at > datetime('now', '-1 hour')
       ORDER BY created_at DESC`
    );

    if (thoughts.length > 0) {
      console.log(`Found ${thoughts.length} new thought(s)`);
      // Optional: Send digest
      // await this.client.sendDigest(thoughts);
    }

    console.log('Hourly job complete');
  }

  /**
   * Daily job - comprehensive processing
   */
  async daily() {
    console.log('Running daily job...');

    // Get thoughts from last 24 hours
    const thoughts = await this.db.query(
      `SELECT * FROM thoughts 
       WHERE created_at > datetime('now', '-1 day')
       ORDER BY created_at DESC`
    );

    if (thoughts.length > 0) {
      console.log(`Found ${thoughts.length} thought(s) today`);
      
      // Send daily digest
      try {
        await this.client.sendDigest(thoughts);
        console.log('Daily digest sent');
      } catch (error) {
        console.error('Failed to send digest:', error.message);
      }
    }

    console.log('Daily job complete');
  }

  /**
   * Check for updates
   */
  async checkUpdates() {
    const { Updater } = require('../updater');
    const updater = new Updater();

    const check = await updater.checkForUpdates();
    
    if (check.hasUpdate) {
      console.log(`Update available: ${check.current} → ${check.latest}`);
      // Note: Auto-update disabled by default - requires manual trigger
    } else {
      console.log('No updates available');
    }
  }
}

// CLI entry point for cron
if (require.main === module) {
  const jobName = process.argv[2];
  const jobs = new CronJobs();

  if (!jobName) {
    console.error('Usage: node jobs.js <hourly|daily|check-updates>');
    process.exit(1);
  }

  jobs[jobName]().catch(err => {
    console.error(`Job ${jobName} failed:`, err);
    process.exit(1);
  });
}

module.exports = { CronJobs };
