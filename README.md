# Thought System

A dedicated thought management system that integrates with OpenClaw. Self-installing, self-updating background service with CLI and API.

## Features

- **Self-managing**: Auto-installs, auto-updates via git
- **CLI Interface**: Command-line tool for interaction
- **API Server**: HTTP endpoints for OpenClaw webhooks
- **Database**: SQLite with migration system
- **Cron Jobs**: Periodic tasks (disabled by default initially)
- **OpenClaw Integration**: Bidirectional communication

## Quick Start

### Installation

```bash
curl -fsSL https://raw.githubusercontent.com/unblended/thought-system/main/scripts/install.sh | bash
```

Or manually:

```bash
git clone https://github.com/unblended/thought-system.git ~/.thought-system
cd ~/.thought-system
npm install
npm run migrate
npm start
```

### CLI Usage

```bash
# Start the API server
thought-system start

# Ingest a thought
thought-system ingest "My new idea" --tags idea,work

# Run migrations
thought-system migrate

# Check for updates
thought-system update

# Install cron jobs (when ready)
thought-system install-cron
```

### API Endpoints

- `POST /webhooks/ingest` - Ingest thoughts from OpenClaw
- `POST /ingest` - Manual thought ingestion
- `POST /admin/update` - Trigger self-update
- `GET /health` - Health check

## Configuration

Set environment variables in `~/.thought-system/.env`:

```bash
OPENCLAW_URL=http://localhost:8080
OPENCLAW_TOKEN=your_token
THOUGHT_SYSTEM_PORT=3456
```

## Architecture

```
OpenClaw (Jude) ←→ Thought System API ←→ SQLite DB
                       ↓
                  Cron Jobs (optional)
                       ↓
                  OpenClaw Webhooks
```

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start dev server
npm run dev

# Run tests
npm test
```

## License

MIT
