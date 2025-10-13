Postman collection for backend API

Run server:

```powershell
cd backend
npm install
npm run dev
```

Base URL (local): http://localhost:5000/api

Import the included `postman_collection_barber.json` into Postman and test the following collections:

- Barbers
  - GET /api/barbers
  - POST /api/barbers
- Bookings
  - GET /api/bookings
  - POST /api/bookings
- Queue
  - GET /api/queue/barber/:barberId
  - POST /api/queue
  - POST /api/queue/leave/:id
- Favorites
  - GET /api/favorites/:customerId
  - POST /api/favorites
  - DELETE /api/favorites/:id
- Notifications
  - GET /api/notifications/:customerId
  - POST /api/notifications/sent/:id

Notes:
- Ensure MongoDB is running and `MONGO_URI` is set in `.env` if not using default.
- Notifications are stored; sending (email/SMS) is out-of-scope. The `scheduledFor` field indicates when a reminder should be sent.