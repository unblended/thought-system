/**
 * Thought System - Main Entry Point
 * 
 * Starts the API server and initializes the system.
 */

const { APIServer } = require('./api');
const { Database } = require('./database');

async function main() {
  console.log('🧠 Thought System starting...');

  // Ensure database is migrated
  const db = new Database();
  await db.migrate();

  // Start API server
  const server = new APIServer();
  server.start();

  console.log('✅ Thought System ready');
}

main().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
