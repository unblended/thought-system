/**
 * Updater Module
 * 
 * Self-update functionality via git pull.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class Updater {
  constructor(options = {}) {
    this.installDir = options.installDir || this._getInstallDir();
    this.repoUrl = options.repoUrl || 'https://github.com/unblended/thought-system.git';
  }

  _getInstallDir() {
    return path.join(process.env.HOME, '.thought-system');
  }

  /**
   * Check if updates are available
   */
  async checkForUpdates() {
    try {
      const currentCommit = execSync('git rev-parse HEAD', { 
        cwd: this.installDir 
      }).toString().trim();

      execSync('git fetch origin main', { 
        cwd: this.installDir,
        stdio: 'pipe'
      });

      const latestCommit = execSync('git rev-parse origin/main', { 
        cwd: this.installDir 
      }).toString().trim();

      return {
        hasUpdate: currentCommit !== latestCommit,
        current: currentCommit.substring(0, 7),
        latest: latestCommit.substring(0, 7)
      };
    } catch (error) {
      console.error('Failed to check for updates:', error.message);
      return { hasUpdate: false, error: error.message };
    }
  }

  /**
   * Perform update
   */
  async update() {
    console.log('Starting update...');

    try {
      console.log('Pulling latest changes...');
      execSync('git pull origin main', { 
        cwd: this.installDir, 
        stdio: 'inherit' 
      });

      console.log('Installing dependencies...');
      execSync('npm install', { 
        cwd: this.installDir, 
        stdio: 'inherit' 
      });

      console.log('Running migrations...');
      const { Database } = require('./database');
      const db = new Database();
      await db.migrate();

      console.log('✅ Update complete');
      console.log('Note: Restart the service manually to apply changes');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Update failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Install cron jobs (when ready)
   */
  async installCronJobs() {
    const cronScript = path.join(this.installDir, 'scripts', 'setup-cron.sh');
    
    if (!fs.existsSync(cronScript)) {
      throw new Error('Cron setup script not found');
    }

    console.log('Installing cron jobs...');
    execSync(`bash ${cronScript}`, { stdio: 'inherit' });
    console.log('✅ Cron jobs installed');
  }
}

module.exports = { Updater };
