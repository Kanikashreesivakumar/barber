# 🚨 FIX: 404 Error on /api/services

## Problem
```
GET http://localhost:5000/api/services 404 (Not Found)
POST http://localhost:5000/api/bookings 400 (Bad Request)
```

## Root Cause
Backend server is either:
1. Not running
2. Missing dependencies
3. Missing .env configuration
4. Routes not properly loaded

## 🔧 Quick Fix (3 Steps)

### Step 1: Check Backend Setup
```powershell
cd d:\barber\backend
node diagnose.js
```

This will tell you what's missing.

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

Wait for installation to complete (~30 seconds).

### Step 3: Start Backend with Auto-Seed
```powershell
node start.js
```

If database is empty, type `y` when prompted to seed data.

**Expected Output:**
```
✅ MongoDB connected successfully
📊 Database Status:
   - Services: 6
   - Barbers: 4
✅ Database has data, ready to go!
🚀 Starting server...
Server running on port 5000
```

## 🧪 Test the Fix

### Test 1: Services Endpoint
Open browser or use curl:
```
http://localhost:5000/api/services
```

Should return JSON array of services:
```json
[
  {
    "_id": "...",
    "name": "Haircut",
    "description": "Professional haircut with styling",
    "duration_minutes": 30,
    "price": 25
  },
  ...
]
```

### Test 2: Frontend
1. Open frontend (http://localhost:5173)
2. Go to BookingPage
3. You should see services in Step 2 ✅

## 🐛 Still Not Working?

### Error: Cannot connect to MongoDB
```
Solution: Start MongoDB service
- Windows: net start MongoDB
- Or install MongoDB Community Server
- Or use MongoDB Atlas (cloud)
```

### Error: Port 5000 already in use
```
Solution: Change port in .env file
PORT=5001

Then update frontend BookingPage:
Change http://localhost:5000 to http://localhost:5001
```

### Error: ENOENT .env file
```
Solution: Create .env file manually
cd d:\barber\backend
Copy-Item .env.example .env
```

## 📋 Complete Startup Checklist

- [ ] MongoDB is running (`mongod --version`)
- [ ] Backend dependencies installed (`npm install`)
- [ ] .env file exists with MONGO_URI
- [ ] Database is seeded (run `node start.js` and say `y`)
- [ ] Server starts without errors
- [ ] Can access http://localhost:5000/api/services in browser
- [ ] Frontend can load services ✅

## 🎯 One-Command Fix

If you want everything in one go:

```powershell
cd d:\barber\backend
npm install
node start.js
# Type 'y' when asked to seed
```

That's it! Your backend should now work. 🎉
