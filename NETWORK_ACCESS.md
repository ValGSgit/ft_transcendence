# 📱 Network Access Configuration

Your Transcendence project is now configured for network access!

## 🌐 Your Network Details
- **Local IP**: `10.0.2.15`
- **Network Interface**: `enp0s3`
- **Network Type**: VirtualBox NAT (10.0.2.x range)

## 🚀 Quick Start

### 1. Start the Application
```bash
make dev
```

Or start services individually:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 2. Access URLs

**From your development machine:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/api/health

**From other devices on the network:**
- Frontend: http://10.0.2.15:5173
- Backend: http://10.0.2.15:3000
- Health Check: http://10.0.2.15:3000/api/health

## 📲 Testing from Your Phone

### ⚠️ VirtualBox NAT Limitation

Your IP `10.0.2.15` indicates you're using **VirtualBox with NAT networking**. This means:
- ❌ Devices on your network **cannot directly access** this IP
- ✅ Only the host machine can access the VM

### 🔧 Solutions

#### Option 1: Use VirtualBox Bridged Adapter (Recommended)
This gives your VM a real IP on your network:

1. **Shutdown your VM**
2. **Open VirtualBox Manager**
3. **Select your VM → Settings → Network**
4. **Change "Attached to:" from NAT to "Bridged Adapter"**
5. **Select your network adapter** (WiFi or Ethernet)
6. **Start the VM**
7. **Get your new IP:**
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```
8. **Update configuration** with your new IP (likely `192.168.x.x`)

#### Option 2: VirtualBox Port Forwarding
Keep NAT but forward ports:

1. **VM Settings → Network → Advanced → Port Forwarding**
2. **Add these rules:**
   - Name: Frontend, Protocol: TCP, Host Port: 5173, Guest Port: 5173
   - Name: Backend, Protocol: TCP, Host Port: 3000, Guest Port: 3000

3. **Access from phone using your HOST machine's IP:**
   - Find host IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Use: `http://HOST_IP:5173`

#### Option 3: Use ngrok (Simplest for Testing)
```bash
# Install ngrok
sudo snap install ngrok

# Terminal 1 - Backend tunnel
ngrok http 3000

# Terminal 2 - Frontend tunnel  
ngrok http 5173

# Update frontend/.env.development.local with the ngrok backend URL
```

## 🔥 Firewall Configuration

If using Bridged Adapter or Port Forwarding, ensure ports are open:

```bash
# Check if firewall is active
sudo ufw status

# Allow ports
sudo ufw allow 3000/tcp
sudo ufw allow 5173/tcp

# Restart firewall
sudo ufw reload
```

## ✅ Verify Setup

### Test Backend
```bash
curl http://10.0.2.15:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Test Frontend
Open in browser: http://10.0.2.15:5173

## 🐛 Troubleshooting

### Can't connect from phone
- ✓ Check if using NAT (change to Bridged Adapter)
- ✓ Verify firewall rules
- ✓ Ensure both devices on same WiFi
- ✓ Test with `ping 10.0.2.15` from another device

### CORS errors
- ✓ Check backend console for CORS logs
- ✓ Verify frontend URL in CORS origins
- ✓ Clear browser cache

### Connection refused
- ✓ Ensure servers are running
- ✓ Check `netstat -tuln | grep -E '3000|5173'`
- ✓ Verify HOST is set to `0.0.0.0` in backend

## 📝 Files Modified

✅ `backend/src/index.js` - Listen on 0.0.0.0
✅ `backend/src/config/index.js` - CORS for 10.0.2.x network  
✅ `.env.production` - Updated OAuth callbacks
✅ `frontend/.env.development.local` - API URL configuration

## 🎯 Next Steps

1. **Choose a solution** (Bridged Adapter recommended)
2. **Restart your servers**
3. **Test from your phone**
4. **Have fun!** 🎮

---

Need help? Check the main README.md for more documentation.
