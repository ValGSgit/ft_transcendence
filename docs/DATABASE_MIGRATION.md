# 🐘 PostgreSQL Migration Guide

This guide will help you migrate your Transcendence project from SQLite to PostgreSQL for production deployments.

## 📋 Table of Contents

- [Why PostgreSQL?](#why-postgresql)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development vs Production](#development-vs-production)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## 🤔 Why PostgreSQL?

PostgreSQL is recommended for production because:

- ✅ **Better concurrency** - Handles multiple simultaneous connections
- ✅ **ACID compliance** - Ensures data integrity
- ✅ **Advanced features** - JSONB, full-text search, GIS support
- ✅ **Scalability** - Better performance with large datasets
- ✅ **Production-ready** - Battle-tested in enterprise environments
- ✅ **Zero-downtime backups** - Unlike SQLite file locks

SQLite is still used for development for simplicity and zero configuration.

## 🏗️ Architecture

### Database Selection Logic

The application automatically selects the database based on the environment:

```javascript
// Development (default)
DB_TYPE=sqlite or not set → Uses SQLite (./data/transcendence.db)

// Production
NODE_ENV=production or DB_TYPE=postgres → Uses PostgreSQL
```

### File Structure

```
backend/
├── src/config/
│   ├── database.js       # Universal database interface
│   └── database.pg.js    # PostgreSQL implementation
└── data/
    └── transcendence.db  # SQLite database (dev only)

scripts/
├── backup-db.sh          # Backup PostgreSQL database
├── restore-db.sh         # Restore from backup
└── test-db.sh            # Test database connection
```

## 🚀 Quick Start

### Option 1: Production Build (Recommended)

1. **Set environment variables:**

```bash
# Copy and edit the production environment file
cp .env.production .env

# CRITICAL: Update these values!
# - DB_PASSWORD: Strong password for PostgreSQL
# - JWT_SECRET: Random 64+ character string
# - CORS_ORIGINS: Your actual domain
```

2. **Build and start:**

```bash
# Build production images
make prod-build

# Start all services (PostgreSQL + Backend + Frontend)
make prod-up
```

3. **Verify setup:**

```bash
# Test database connection
./scripts/test-db.sh

# Check logs
make prod-logs
```

### Option 2: Development with PostgreSQL

To test PostgreSQL locally without Docker:

1. **Install PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@16
brew services start postgresql@16
```

2. **Create database:**

```bash
sudo -u postgres psql
CREATE DATABASE transcendence;
CREATE USER transcendence WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transcendence TO transcendence;
\q
```

3. **Configure backend:**

```bash
cd backend
cp .env.example .env

# Edit .env and set:
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transcendence
DB_USER=transcendence
DB_PASSWORD=your_password
```

4. **Install dependencies and run:**

```bash
npm install
npm run dev
```

## 🔄 Development vs Production

| Feature | Development (SQLite) | Production (PostgreSQL) |
|---------|---------------------|------------------------|
| **Setup** | Zero config | Docker Compose |
| **File** | `data/transcendence.db` | Container volume |
| **Concurrency** | Limited | Excellent |
| **Backups** | File copy | pg_dump scripts |
| **Performance** | 1-5 users | 100+ users |
| **Scalability** | Single machine | Horizontal scaling |

### Switching Between Databases

```bash
# Use SQLite (development)
export DB_TYPE=sqlite
npm run dev

# Use PostgreSQL (testing production setup)
export DB_TYPE=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=transcendence
export DB_USER=transcendence
export DB_PASSWORD=your_password
npm run dev
```

## 🗄️ Database Management

### Backup Database

```bash
# Create backup (stored in ./backups/)
./scripts/backup-db.sh

# Output: ./backups/transcendence_YYYYMMDD_HHMMSS.sql.gz
```

Backups are automatically:
- Compressed with gzip
- Timestamped
- Rotated (keeps last 10)

### Restore Database

```bash
# List available backups
./scripts/restore-db.sh

# Restore from specific backup
./scripts/restore-db.sh ./backups/transcendence_20240101_120000.sql.gz
```

⚠️ **Warning:** Restore will replace all current data!

### Manual Database Operations

```bash
# Connect to PostgreSQL container
docker exec -it transcendence_postgres_prod psql -U transcendence -d transcendence

# Common queries:
\dt                          # List tables
\d users                     # Describe users table
SELECT COUNT(*) FROM users;  # Count users
\q                           # Quit
```

### Database Migrations

The application automatically creates tables on startup. For manual migrations:

```bash
# Access PostgreSQL
docker exec -it transcendence_postgres_prod psql -U transcendence -d transcendence

# Run SQL commands
ALTER TABLE users ADD COLUMN new_field TEXT;
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check PostgreSQL logs
docker logs transcendence_postgres_prod

# Common issues:
# 1. Port already in use
sudo lsof -i :5432
# Kill process or change port in docker-compose.prod.yml

# 2. Permission issues
docker volume rm transcendence_postgres_data
make prod-up
```

### Connection timeout

```bash
# Test connection
./scripts/test-db.sh

# Check if container is running
docker ps | grep postgres

# Restart services
make prod-restart
```

### Data not persisting

```bash
# Check volume
docker volume inspect transcendence_postgres_data

# If volume is missing, recreate:
make prod-down
docker volume create transcendence_postgres_data
make prod-up
```

### Backend can't connect to database

```bash
# Check environment variables
docker exec transcendence_backend_prod env | grep DB

# Verify network
docker network inspect transcendence_network

# Check if postgres is healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🔒 Security Best Practices

### 1. Change Default Credentials

```bash
# Generate strong password
openssl rand -base64 32

# Update in .env.production:
DB_PASSWORD=<generated_password>
JWT_SECRET=<another_generated_secret>
```

### 2. Limit Database Access

```bash
# In production, PostgreSQL should NOT be exposed to the internet
# Only the backend container should access it

# docker-compose.prod.yml postgres service should NOT have:
# ports:
#   - "5432:5432"  # ❌ Don't expose to host
```

### 3. Regular Backups

```bash
# Set up automated backups with cron
crontab -e

# Add daily backup at 3 AM:
0 3 * * * cd /path/to/transcendence && ./scripts/backup-db.sh
```

### 4. Enable SSL/TLS (Production)

For production deployments, enable SSL:

```yaml
# docker-compose.prod.yml
postgres:
  environment:
    POSTGRES_SSL_MODE: require
```

And update backend connection:

```env
DB_SSL=true
```

## 📊 Monitoring

### Check Database Health

```bash
# Quick test
./scripts/test-db.sh

# Detailed metrics
docker exec transcendence_postgres_prod psql -U transcendence -d transcendence -c "
SELECT 
    datname,
    numbackends as connections,
    xact_commit as transactions,
    xact_rollback as rollbacks,
    blks_read,
    blks_hit,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database 
WHERE datname = 'transcendence';
"
```

### Monitor Performance

```bash
# Active connections
docker exec transcendence_postgres_prod psql -U transcendence -d transcendence -c "
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'transcendence';
"

# Slow queries (queries taking > 1 second)
docker exec transcendence_postgres_prod psql -U transcendence -d transcendence -c "
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '1 second';
"
```

## 🔄 Migrating Existing Data

If you have existing SQLite data to migrate:

### 1. Export from SQLite

```bash
# Dump SQLite data
sqlite3 backend/data/transcendence.db .dump > sqlite_dump.sql
```

### 2. Convert to PostgreSQL format

```bash
# Install conversion tool
npm install -g sqlite-to-postgres

# Convert
sqlite-to-postgres sqlite_dump.sql postgres_dump.sql
```

### 3. Import to PostgreSQL

```bash
docker exec -i transcendence_postgres_prod psql -U transcendence -d transcendence < postgres_dump.sql
```

**Note:** Schema differences may require manual adjustments.

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Node.js pg Driver](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-basics.html)

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `make prod-logs`
2. Test connection: `./scripts/test-db.sh`
3. Review environment variables in `.env.production`
4. Check Docker containers: `docker ps -a`
5. Verify network: `docker network inspect transcendence_network`

---

**Pro Tip:** Always test database changes in development before applying to production!
