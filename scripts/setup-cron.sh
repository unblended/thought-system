#!/bin/bash
# Setup cron jobs for Thought System
# NOTE: Run this manually when ready to enable auto-updates

INSTALL_DIR="$HOME/.thought-system"
LOG_DIR="$HOME/.thought-system/logs"

# Create log directory
mkdir -p "$LOG_DIR"

# Create cron file
CRON_CONTENT="# Thought System Cron Jobs
# Hourly job
0 * * * * cd $INSTALL_DIR && npm run job:hourly >> $LOG_DIR/hourly.log 2>&1

# Daily job (9 AM)
0 9 * * * cd $INSTALL_DIR && npm run job:daily >> $LOG_DIR/daily.log 2>&1

# Check for updates (every 6 hours)
0 */6 * * * cd $INSTALL_DIR && npm run check:updates >> $LOG_DIR/updates.log 2>&1
"

echo "🕐 Setting up cron jobs..."
echo ""
echo "The following cron jobs will be installed:"
echo "$CRON_CONTENT"
echo ""

# Add to crontab
echo "$CRON_CONTENT" | crontab -

echo "✅ Cron jobs installed"
echo ""
echo "View with: crontab -l"
echo "Logs: $LOG_DIR/"
echo ""
echo "To remove: crontab -r"
