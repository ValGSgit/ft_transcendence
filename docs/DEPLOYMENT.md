# 🚀 Production Deployment Guide

Complete guide for deploying Transcendence to production with PostgreSQL.

## 📋 Pre-Deployment Checklist

### 1. ✅ System Requirements

- **Server:** Linux (Ubuntu 22.04 LTS recommended)
- **RAM:** Minimum 2GB, recommended 4GB+
- **Storage:** Minimum 20GB
- **Docker:** Version 24.0+
- **Docker Compose:** Version 2.20+
- **Ports:** 80 (HTTP), 443 (HTTPS), 3000 (Backend)

### 2. ✅ Security Checklist

- [ ] Generate strong JWT secret (64+ characters)
- [ ] Generate strong database password
- [ ] Configure firewall rules
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Review CORS origins
- [ ] Update OAuth callback URLs
- [ ] Enable rate limiting
- [ ] Configure secure headers

### 3. ✅ Domain Setup

- [ ] Domain registered and DNS configured
- [ ] A record pointing to server IP
- [ ] SSL certificate obtained

## 🔧 Step-by-Step Deployment

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/ft_transcendence.git
cd ft_transcendence

# Checkout production branch (if using separate branch)
git checkout production
```

### Step 3: Configure Environment

```bash
# Copy production environment file
cp .env.production .env

# Edit configuration
nano .env
```

**Critical variables to update:**

```.env
# Generate these with: openssl rand -hex 32
JWT_SECRET=YOUR_STRONG_SECRET_HERE
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# Your actual domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# OAuth callbacks (update with your domain)
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
```

### Step 4: Build Production Images

```bash
# Build backend and frontend images
make prod-build

# Verify images
docker images | grep transcendence
```

Expected output:
```
transcendence-backend    latest    ...    ...    ...
transcendence-frontend   latest    ...    ...    ...
```

### Step 5: Start Services

```bash
# Start all services
make prod-up

# Verify all containers are running
docker ps
```

Expected containers:
- `transcendence_postgres_prod` (PostgreSQL)
- `transcendence_backend_prod` (Node.js API)
- `transcendence_frontend_prod` (Nginx)

### Step 6: Verify Deployment

```bash
# Test database connection
./scripts/test-db.sh

# Check application health
curl http://localhost:3000/api/health
curl http://localhost/

# View logs
make prod-logs
```

### Step 7: Set Up Reverse Proxy (Optional but Recommended)

For SSL/HTTPS support, set up Nginx or Caddy as a reverse proxy.

#### Option A: Using Caddy (Easiest)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Create Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Add this configuration:

```caddyfile
yourdomain.com {
    reverse_proxy localhost:80
    encode gzip
}

api.yourdomain.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

```bash
# Reload Caddy
sudo systemctl reload caddy
```

#### Option B: Using Nginx

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/transcendence
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/transcendence /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Reload Nginx
sudo systemctl reload nginx
```

### Step 8: Set Up Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# If not using reverse proxy, allow backend directly
sudo ufw allow 3000/tcp

# Check status
sudo ufw status
```

## 🔄 Automated Backups

### Set Up Daily Backups

```bash
# Create backup script location
sudo mkdir -p /opt/transcendence-backups

# Copy backup script
sudo cp scripts/backup-db.sh /opt/transcendence-backups/

# Make executable
sudo chmod +x /opt/transcendence-backups/backup-db.sh

# Set up cron job
crontab -e
```

Add this line for daily backups at 3 AM:

```cron
0 3 * * * cd /path/to/ft_transcendence && ./scripts/backup-db.sh >> /var/log/transcendence-backup.log 2>&1
```

### Backup to Remote Storage (Recommended)

```bash
# Install AWS CLI or similar for remote backups
sudo apt install awscli

# Configure AWS
aws configure

# Create backup and upload script
nano /opt/transcendence-backups/backup-and-upload.sh
```

```bash
#!/bin/bash
cd /path/to/ft_transcendence
./scripts/backup-db.sh
aws s3 cp ./backups/ s3://your-bucket/transcendence-backups/ --recursive --exclude "*" --include "*.sql.gz"
```

## 📊 Monitoring

### Set Up Logging

```bash
# View live logs
docker logs -f transcendence_backend_prod
docker logs -f transcendence_postgres_prod
docker logs -f transcendence_frontend_prod

# Or use make command
make prod-logs
```

### Health Checks

```bash
# Create monitoring script
nano /opt/transcendence-backups/healthcheck.sh
```

```bash
#!/bin/bash
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Backend is down! Restarting..."
    cd /path/to/ft_transcendence
    make prod-restart
    # Send alert email
    echo "Transcendence backend restarted" | mail -s "Alert: Service Restart" admin@yourdomain.com
fi
```

```bash
# Make executable
chmod +x /opt/transcendence-backups/healthcheck.sh

# Add to crontab (check every 5 minutes)
crontab -e
```

```cron
*/5 * * * * /opt/transcendence-backups/healthcheck.sh
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin production

# Rebuild images
make prod-build

# Restart services (zero-downtime with rolling update)
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend

# Or use make command
make prod-restart
```

### Database Maintenance

```bash
# Optimize database (run monthly)
docker exec transcendence_postgres_prod psql -U transcendence -d transcendence -c "VACUUM ANALYZE;"

# Check database size
docker exec transcendence_postgres_prod psql -U transcendence -d transcendence -c "
SELECT pg_size_pretty(pg_database_size('transcendence')) as size;
"
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
make prod-logs

# Check container status
docker ps -a

# Check disk space
df -h

# Check memory
free -h

# Restart everything
make prod-down
make prod-up
```

### Database Connection Issues

```bash
# Test database
./scripts/test-db.sh

# Check PostgreSQL logs
docker logs transcendence_postgres_prod

# Restart database
docker restart transcendence_postgres_prod
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit container memory (edit docker-compose.prod.yml)
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
  postgres:
    deploy:
      resources:
        limits:
          memory: 1G
```

## 🔒 Security Hardening

### 1. Limit SSH Access

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Use key-based authentication only
PasswordAuthentication no

# Restart SSH
sudo systemctl restart ssh
```

### 2. Set Up Fail2Ban

```bash
# Install fail2ban
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📝 Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] HTTPS working correctly
- [ ] Database backups running
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] OAuth working
- [ ] WebSocket connections working
- [ ] Health checks passing
- [ ] Error emails configured
- [ ] Documentation updated

## 🆘 Rollback Procedure

If deployment fails:

```bash
# Stop new version
make prod-down

# Restore database from backup
./scripts/restore-db.sh ./backups/latest_backup.sql.gz

# Check out previous version
git checkout <previous-commit-hash>

# Rebuild and restart
make prod-build
make prod-up
```

## 📚 Additional Resources

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Production Checklist](https://www.postgresql.org/docs/current/production.html)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

**Need Help?** Check logs first: `make prod-logs`
