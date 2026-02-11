# 🗄️ Database Setup Guide

Quick reference for database configuration in Transcendence.

## 🎯 Quick Start

### Development (SQLite - Default)

```bash
# No configuration needed!
npm install
npm run dev
```

SQLite database is automatically created at `backend/data/transcendence.db`

### Production (PostgreSQL)

```bash
# Build and start with Docker Compose
make prod-build
make prod-up

# Test database connection
make db-test
```

## 📊 Database Comparison

| Feature | SQLite (Dev) | PostgreSQL (Prod) |
|---------|--------------|-------------------|
| **Setup** | ✅ Zero config | 🔧 Docker Compose |
| **Performance** | Good (1-5 users) | Excellent (100+ users) |
| **Concurrency** | Limited | High |
| **Backups** | File copy | `make db-backup-postgres` |
| **Scale** | Single server | Can scale horizontally |

## 🔧 Configuration

### Environment Variables

**Development (.env or backend/.env):**
```env
# SQLite (default, no config needed)
NODE_ENV=development

# Or test PostgreSQL locally:
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transcendence
DB_USER=transcendence
DB_PASSWORD=your_password
```

**Production (.env.production):**
```env
NODE_ENV=production
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=transcendence
DB_USER=transcendence
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
```

## 🛠️ Common Tasks

### Development (SQLite)

```bash
# Backup
make db-backup

# Reset (deletes all data)
make db-reset

# Access database
sqlite3 backend/data/transcendence.db
```

### Production (PostgreSQL)

```bash
# Backup
make db-backup-postgres

# Restore
make db-restore-postgres

# Test connection
make db-test

# Access database shell
make db-shell

# View logs
make db-logs
```

## 📚 More Information

- **Detailed Migration Guide:** See [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md)
- **Production Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Backend Documentation:** See [backend/README.md](backend/README.md)

## 🆘 Troubleshooting

### "Database not found"
```bash
# For SQLite: restart backend (auto-creates database)
npm run dev

# For PostgreSQL: check container is running
docker ps | grep postgres
make db-test
```

### "Connection refused"
```bash
# Check PostgreSQL container
docker logs transcendence_postgres_prod

# Restart services
make prod-restart
```

### "Permission denied"
```bash
# For Docker commands
sudo usermod -aG docker $USER
newgrp docker
```

## 🔐 Security Notes

1. **Change default passwords** in production
2. **Don't expose PostgreSQL port** to internet
3. **Enable SSL** for production PostgreSQL connections
4. **Regular backups** - automate with cron
5. **Limit database user permissions** in production

---

**Need help?** Check the full [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) guide.
