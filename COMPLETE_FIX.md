# 🚀 COMPLETE FIX - Booking Not Working

## Problem Summary
1. ❌ Backend server not running (404 errors)
2. ❌ Booking data format mismatch (400 errors)

## ✅ SOLUTION - 3 Easy Steps

### Step 1: Start Backend Server

**Option A - Double Click (Easiest):**
- Go to `d:\barber\backend`
- Double-click `start.bat`

**Option B - PowerShell:**
```powershell
cd d:\barber\backend
.\start.ps1
```

**Option C - Manual:**
```powershell
cd d:\barber\backend
node server.js
```

**✅ Expected Output:**
```
MongoDB connected
Server running on port 5000
```

### Step 2: Seed Database (One Time Only)

Open a **NEW** terminal/PowerShell window:

```powershell
cd d:\barber\backend
node setup.js
```

**✅ Expected Output:**
```
✅ Created service: Haircut
✅ Created service: Beard Trim
... (more services)
✅ Created barber: John Smith
✅ Created barber: Mike Johnson
... (more barbers)
```

### Step 3: Test Booking

1. Go to frontend (http://localhost:5173)
2. Navigate to BookingPage
3. **Step 1**: Select a barber (John, Mike, Carlos, or David)
4. **Step 2**: Select a service (Haircut, Beard Trim, etc.)
5. **Step 3**: Pick a date
6. **Step 4**: Select time and click "Confirm & Pay"

**✅ Success Indicators:**
- Browser console shows: `✅ Booking created: {...}`
- Notification appears: "Appointment booked successfully!"
- Redirects to payment page

## What Was Fixed

### Frontend Changes (BookingPage.tsx)
- ✅ Changed `barberId` → `barber` (matches backend schema)
- ✅ Changed `startTime` from string → Date ISO format
- ✅ Changed `endTime` from string → Date ISO format
- ✅ Added `customerName` from user profile
- ✅ Added `customerPhone` and `customerEmail`
- ✅ Better error logging with console messages

### Backend Schema (Booking Model)
Required fields:
- `customerName` (String) ✅
- `barber` (ObjectId) ✅
- `startTime` (Date) ✅

Optional fields:
- `customerPhone`, `customerEmail`, `endTime`, `status`, `service`, `servicePrice`

## Verify It's Working

### Check 1: Services Load
Open: http://localhost:5000/api/services
Should show JSON array of 6 services

### Check 2: Barbers Load
Open: http://localhost:5000/api/barbers
Should show JSON array of 4 barbers

### Check 3: Create Booking
Use BookingPage or test with curl:
```powershell
curl -X POST http://localhost:5000/api/bookings `
  -H "Content-Type: application/json" `
  -d '{\"customerName\":\"Test User\",\"barber\":\"YOUR_BARBER_ID\",\"startTime\":\"2025-10-20T10:00:00.000Z\"}'
```

### Check 4: View Bookings
Open: http://localhost:5000/api/bookings
Should show all bookings (empty array if none created yet)

## Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution:**
```powershell
# Check if MongoDB is running
Get-Process -Name mongod -ErrorAction SilentlyContinue

# If not running, start MongoDB service
net start MongoDB
```

### Error: "Port 5000 already in use"
**Solution:**
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill it
Stop-Process -Id <PROCESS_ID>

# Or change port in .env file
PORT=5001
```

### Error: "No barber found with ID"
**Solution:** The barber ID might be temporary (temp-1, temp-2). 
Run `node setup.js` to create real barbers with proper MongoDB ObjectIds.

### Error: "Missing required fields: customerName"
**Solution:** Already fixed in the code! Make sure you're using the updated BookingPage.tsx

## Database Structure

After successful setup, your MongoDB will have:

**Collections:**
- `services` (6 items)
- `barbers` (4 items)
- `bookings` (grows with each booking)
- `notifications` (grows with each booking)

**Example Booking Document:**
```json
{
  "_id": "6734a1b2c3d4e5f6g7h8i9j0",
  "customerName": "EmVi",
  "customerEmail": "musthafaemvi@gmail.com",
  "customerPhone": "",
  "barber": "6734a1b2c3d4e5f6g7h8i9j0",
  "startTime": "2025-10-20T10:00:00.000Z",
  "endTime": "2025-10-20T10:30:00.000Z",
  "status": "pending",
  "service": "Haircut",
  "servicePrice": 25,
  "serviceDuration": 30,
  "createdAt": "2025-10-19T15:30:00.000Z"
}
```

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `cd d:\barber\backend && node server.js` |
| Seed database | `cd d:\barber\backend && node setup.js` |
| Check services | `http://localhost:5000/api/services` |
| Check barbers | `http://localhost:5000/api/barbers` |
| Check bookings | `http://localhost:5000/api/bookings` |
| Start frontend | `cd d:\barber\frontend && npm run dev` |

## Success! 🎉

You should now be able to:
- ✅ View barbers in BookingPage
- ✅ View services in BookingPage
- ✅ Create bookings that save to MongoDB
- ✅ See bookings in database and BarberDashboard

---

**Need help?** Check the browser console (F12) for detailed error messages with ✅ and ❌ indicators.
