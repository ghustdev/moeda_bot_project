---
name: gcp-pm2-deployment
description: >-
  Provides procedures for deploying and maintaining 24/7 Node.js bot services on Google Cloud Compute Engine
  (e2-micro Always Free) using PM2 process manager.
---

# GCP Compute Engine & PM2 Deployment Skill

This skill guides the provisioning, configuration, and monitoring of Node.js services running continuously on GCP Compute Engine's Always Free tier.

## Architecture

- **Host**: Google Cloud Compute Engine VM (`e2-micro`, 1 GB RAM, 2 vCPUs shared-core).
- **Regions (Always Free)**: `us-central1` (Iowa), `us-east1` (South Carolina), or `us-west1` (Oregon).
- **OS**: Ubuntu 22.04 LTS.
- **Process Manager**: PM2 with memory boundaries and auto-restart policies.

## PM2 Configuration (`ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [
    {
      name: "moeda-bot",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      restart_delay: 4000,
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
```

## Deployment Commands Reference

```bash
# 1. Start application with ecosystem config
pm2 start ecosystem.config.cjs

# 2. Save current process list
pm2 save

# 3. Enable automatic restart on system reboot
pm2 startup

# 4. Monitor logs & memory
pm2 logs moeda-bot
pm2 monit
```
