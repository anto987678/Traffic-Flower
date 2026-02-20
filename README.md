# Traffic Flower - Smart City Traffic Management

A full-stack web app for monitoring traffic, tracking public transport delays, and detecting traffic violations in real-time. Built as a database project to handle a lot of data efficiently.

**Live**: dbprj.vercel.app

---

## What Does It Do?

- Monitor traffic at different intersections in real-time
- See where buses and trams are delayed
- Detect people and vehicles running red lights
- View analytics and create reports
- Interactive map showing all intersections
- User accounts with secure login

---

## The Stack

**Frontend:**
- React with Vite (fast build)
- Tailwind CSS for styling
- React Router for navigation
- Chart.js for charts
- React Leaflet for the map

**Backend:**
- Node.js + Express for the API
- Supabase for the database and auth
- PostgreSQL under the hood

**Hosting:**
- Supabase hosts the database
- Railway runs the backend
- Vercel runs the frontend

---

## How to Set It Up

### What You Need
- Node.js 18 or higher
- npm (comes with Node)
- A Supabase account (free tier works)

### Get Everything Running

**1. Clone and install**
```bash
git clone https://github.com/Ale-cutie/traffic-Flow-ER.git
cd traffic-Flow-ER
```

**2. Set up environment variables**

Create a `.env` file in the root with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=any_random_secret_key
```

**3. Start the backend**
```bash
cd server
npm install
npm start
```
It runs at `http://localhost:5001`

**4. Start the frontend** (in a new terminal)
```bash
cd client
npm install
npm run dev
```
It runs at `http://localhost:3000`

That's it! Go to `http://localhost:3000` and you're good to go.

---

## How It Works

### Main Pages

**Login/Sign Up** - Create an account with email and password

**Dashboard** - Quick overview with:
- Current traffic stats
- Number of violations
- Active delays
- Latest alerts

**City Map** - Interactive map showing:
- All intersections with color-coded traffic
- Click on any intersection for details
- Real-time status updates

**Intersection Details** - For each intersection, you can see:
- **Charts** - Traffic volume over time, current light status
- **Schedules** - When buses and trams are coming
- **History** - Data from previous days, recorded violations

**Analytics** - See trends like:
- Which hours are busiest
- Comparison between different days/weeks

**Reports** - Check:
- Which buses/trams are delayed the most
- All red light violations in the last 7 days
- Where congestion happens

**Alerts** - Live notifications for:
- Traffic violations (people/vehicles crossing on red)
- Public transport delays (>5 minutes)

**Settings** - Manage your account

---

## The Database

We use PostgreSQL with these main tables:

**Traffic Data:**
- Intersections and traffic lights (semaphors)
- Car, bus, tram, trolleybus crossings
- Pedestrian crossings
- Traffic light state changes

**Public Transport:**
- Bus, tram, trolleybus info
- Bus stations, tram stations, etc.
- When vehicles stop and how long

**Security:**
- Every table has Row Level Security (RLS)
- Users can only see their own data
- No SQL injection possible (parameterized queries)

---

## API Endpoints

These are the main endpoints the frontend uses:

**Auth:**
- `POST /api/auth/login` - Log in
- `POST /api/signup` - Create account

**Data:**
- `GET /api/intersections` - All intersections
- `GET /api/intersections/:id` - Details for one intersection
- `GET /api/intersections/:id/stats/volume` - Traffic stats
- `GET /api/intersections/:id/schedule` - Bus/tram schedule

**Reports:**
- `GET /api/reports/violations` - Red light violations
- `GET /api/reports/congestion` - Delayed transport

All endpoints (except login/signup) need a JWT token in the header.

---

## Environment Variables Explained

You need these to connect everything:

`SUPABASE_URL` - The URL to your Supabase project
`SUPABASE_ANON_KEY` - Public key for frontend access
`SUPABASE_SERVICE_ROLE_KEY` - Secret key for backend access (don't share!)
`JWT_SECRET` - Random string for signing login tokens

---

## Test Data

The app comes with sample data:
- 7 intersections with real coordinates
- 28 traffic lights
- 35 cars, 30 buses, 29 trams, 28 trolleybuses
- Traffic crossing data
- Bus/tram delays
- Red light violations

---

## Security

- Passwords are hashed and stored securely
- Every database query checks who's accessing it
- API tokens expire and can't be reused
- No secret keys in the code
- Environment variables keep secrets safe

---

## Common Problems

**Can't connect to database?**
- Check if Supabase is up
- Verify your `.env` has the right keys
- Make sure the database migrations ran

**Frontend won't load?**
- Check if the backend is running
- Look in browser console for errors
- Make sure `VITE_API_URL` is correct

**Getting "port already in use"?**
- Change the PORT in `server/.env`
- Or kill the process using that port

---

## Project Structure

```
traffic-Flow-ER/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # All the pages (Dashboard, Alerts, etc)
│   │   ├── components/ # Reusable UI pieces
│   │   └── utils/      # Helper functions
│   └── package.json
│
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth checking
│   │   └── services/   # Business logic
│   └── package.json
│
├── supabase/            # Database
│   └── migrations/      # SQL scripts that set up the database
│
└── README.md            # This file
```

---

## What We Learned

This project taught us:
- How to structure a full-stack app
- Database design with relationships and security
- User authentication and authorization
- Real-time data handling
- Building responsive UI
- API design
- Deployment on different platforms

---

**Made as a Database course project from FILS UPB**

If something's broken or you have questions, open an issue on GitHub!
