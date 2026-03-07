# IntelliShip Backend API

**AI-Powered Smart Logistics Monitoring System**

Production-grade Node.js + Express + MongoDB backend for receiving and processing IoT events from ESP32 hardware devices.

---

## 🚀 Features

- ✅ **RESTful API** with proper status codes and error handling
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **MongoDB Atlas** integration with Mongoose ODM
- ✅ **IoT Event Processing** from ESP32 devices
- ✅ **Database Indexing** for high-performance queries
- ✅ **Input Validation** with enum constraints
- ✅ **Pagination Support** for large datasets
- ✅ **CORS Security** with origin whitelisting
- ✅ **Health Check Endpoint** for monitoring
- ✅ **Graceful Shutdown** handling
- ✅ **Production Ready** for Render/AWS/Heroku deployment

---

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

---

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd smart-logistics-backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/intelliship?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_random_key_here
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.com,http://localhost:5173
```

**⚠️ IMPORTANT:** Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Start the Server

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

Server will start at: `http://localhost:5000`

Health Check: `http://localhost:5000/health`

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint           | Auth      | Description                 |
| ------ | ------------------ | --------- | --------------------------- |
| POST   | `/api/auth/signup` | Public    | Register new seller account |
| POST   | `/api/auth/signin` | Public    | Login with email/password   |
| GET    | `/api/auth/verify` | Protected | Verify JWT token            |

### Shipments

| Method | Endpoint             | Auth      | Description                 |
| ------ | -------------------- | --------- | --------------------------- |
| POST   | `/api/shipments`     | Protected | Create new shipment         |
| GET    | `/api/shipments`     | Protected | Get all seller's shipments  |
| GET    | `/api/shipments/:id` | Public    | Get shipment by shipment_id |

### Events (IoT)

| Method | Endpoint                   | Auth   | Description                             |
| ------ | -------------------------- | ------ | --------------------------------------- |
| POST   | `/api/events`              | Public | ESP32 sends vibration event             |
| GET    | `/api/events/:shipment_id` | Public | Get all events for shipment (paginated) |

### System

| Method | Endpoint  | Auth   | Description                  |
| ------ | --------- | ------ | ---------------------------- |
| GET    | `/health` | Public | Health check & system status |

---

## 🔌 ESP32 Integration

### Event Format

ESP32 devices send events via HTTP POST to `/api/events`:

```json
{
  "shipment_id": "SHIP001",
  "event_type": "Severe",
  "risingEdges": 8,
  "avgHigh": 120.4
}
```

**Event Types:**

- `Safe` - Normal vibration levels
- `Moderate` - Elevated vibration
- `Severe` - Critical vibration detected

### Validation Rules

- All fields are **required**
- `event_type` must be one of: `Safe`, `Moderate`, `Severe`
- `risingEdges` and `avgHigh` must be non-negative numbers
- `shipment_id` must exist in database

### Auto-Status Update

When an event is received, the shipment status is automatically updated:

- `Severe` event → Shipment status = `Severe`
- `Moderate` event → Shipment status = `Moderate` (if currently `Safe`)

---

## 🔐 Security Features

✅ **JWT Authentication** - 30-day token expiration  
✅ **Password Hashing** - bcrypt with 12 rounds  
✅ **CORS Whitelisting** - Configurable allowed origins  
✅ **Request Size Limits** - 1MB max payload  
✅ **Input Validation** - Mongoose schema validation  
✅ **Environment Variables** - No hardcoded secrets  
✅ **Enum Constraints** - Type-safe event types

---

## ⚡ Performance Optimizations

### Database Indexes

**Event Collection:**

```javascript
{ shipment_id: 1, timestamp: -1 } // Fast event queries
```

**Shipment Collection:**

```javascript
{ shipment_id: 1 }               // Fast shipment lookup
{ seller_id: 1, created_at: -1 } // Fast seller queries
```

### Pagination

Event listing supports pagination to handle large datasets:

```
GET /api/events/SHIP001?page=1&limit=50
```

Response includes metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalEvents": 230,
    "eventsPerPage": 50,
    "hasMore": true
  }
}
```

---

## 🚀 Deployment (Render)

### Step 1: Configure Environment Variables

In Render dashboard, add:

- `MONGO_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `NODE_ENV` - Set to `production`
- `ALLOWED_ORIGINS` - Your frontend domain

### Step 2: Build Configuration

**Build Command:**

```bash
npm install
```

**Start Command:**

```bash
npm start
```

### Step 3: Health Check

Configure platform health check:

- Path: `/health`
- Expected response: `200 OK`

---

## 📊 Database Schema

### Shipment Model

```javascript
{
  shipment_id: String (unique, required),
  product_name: String (required),
  fragility_level: Enum ['Low', 'Medium', 'High'],
  seller_id: ObjectId (ref: User),
  seller_name: String,
  seller_email: String,
  customer_name: String,
  customer_email: String,
  customer_phone: String,
  status: Enum ['Safe', 'Moderate', 'Severe', 'Delivered', 'In Transit'],
  tracking_link: String,
  created_at: Date
}
```

### Event Model

```javascript
{
  shipment_id: String (required, indexed),
  event_type: Enum ['Safe', 'Moderate', 'Severe'] (required),
  risingEdges: Number (required, min: 0),
  avgHigh: Number (required, min: 0),
  timestamp: Date (indexed)
}
```

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  company: String,
  phone: String,
  role: Enum ['seller', 'admin'],
  created_at: Date,
  verified: Boolean
}
```

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Create Event (ESP32 Simulation)

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "shipment_id": "SHIP001",
    "event_type": "Severe",
    "risingEdges": 8,
    "avgHigh": 120.4
  }'
```

### Get Events with Pagination

```bash
curl http://localhost:5000/api/events/SHIP001?page=1&limit=20
```

---

## 📈 Production Monitoring

### Health Check Response

```json
{
  "status": "ok",
  "uptime": 3600.5,
  "timestamp": "2026-03-08T10:30:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

Monitor these metrics:

- Server uptime
- Database connection status
- Response times
- Error rates

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `MONGO_URI environment variable is not defined`

**Solution:** Ensure `.env` file exists with valid `MONGO_URI`

### JWT Token Invalid

**Error:** `JWT_SECRET environment variable is not defined`

**Solution:** Set `JWT_SECRET` in environment variables

### CORS Error

**Error:** `Not allowed by CORS`

**Solution:** Add your frontend domain to `ALLOWED_ORIGINS` in `.env`

### Event Validation Error

**Error:** `Event type must be Safe, Moderate, or Severe`

**Solution:** ESP32 must send valid `event_type` enum value

---

## 📜 License

ISC

---

## 👥 Contributors

IntelliShip Development Team

---

## 🔗 Related Projects

- **Frontend Dashboard:** `../frontend/`
- **ESP32 Firmware:** `../arduino_code.ino`
- **ML Model:** `../train_model.py`

---

**🎯 Production Status: ✅ READY**

Last Updated: March 8, 2026
