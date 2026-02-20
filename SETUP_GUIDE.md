# Getting Started - Setup Guide

This guide walks you through setting up the project locally on your machine.

---

## What You Need to Install

Before starting, make sure you have:

1. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org)
   - npm comes automatically with Node.js
   - Check version: `node -v`

2. **A Supabase Account** (it's free)
   - Go to https://supabase.com
   - Sign up and create a new project
   - Copy your project URL and API keys (we'll use these later)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/Ale-cutie/traffic-Flow-ER.git
cd traffic-Flow-ER
```

---

## Step 2: Set Up Environment Variables

You need to tell the app how to connect to your database. Create a `.env` file in the root folder with these values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=any_random_string_you_want
```

**Where to find these values:**
- `SUPABASE_URL` - In Supabase dashboard under "Project Settings" > "API"
- `SUPABASE_ANON_KEY` - Same place, labeled "anon public"
- `SUPABASE_SERVICE_ROLE_KEY` - Same place, labeled "service_role secret" (don't share!)
- `JWT_SECRET` - Just make up something random for local testing

---

## Step 3: Set Up the Backend

Open a terminal and run:

```bash
cd server
npm install
```

This downloads all the dependencies.

Then start the server:

```bash
npm start
```

You should see: `Server running at http://localhost:5001`

**Keep this terminal running.** Don't close it or the backend will stop.

---

## Step 4: Set Up the Frontend

Open a **new terminal** (don't close the first one) and run:

```bash
cd client
npm install
npm run dev
```

You should see something like: `VITE v5.x.x  ready in xxx ms`

---

## Step 5: Test It Out

1. Open your browser to: **http://localhost:3000**
2. You should see the login page
3. Click "Sign Up" to create a test account
4. Use any email and password you want
5. You'll be redirected to the City Map page

If you see the map with intersections, everything works!

---

## If Something Goes Wrong

### Error: "Can't connect to database"
- Check your `.env` file - make sure the keys are correct
- Verify Supabase database is actually active
- Try copying the keys again from Supabase dashboard

### Error: "Port 5001 already in use"
- Another app is using that port
- Either close the other app or change the PORT in `server/.env` to something like `5002`

### Error: "npm: command not found"
- Node.js isn't installed properly
- Reinstall from https://nodejs.org

### Frontend shows blank page or errors
- Check the browser console for error messages (F12)
- Make sure the backend is still running in the other terminal
- Try refreshing the page (Ctrl+R or Cmd+R)

### Build fails during `npm install`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Common Commands

**Stop the backend or frontend:**
- Press `Ctrl+C` in the terminal

**Restart everything:**
- Stop both servers (Ctrl+C in each terminal)
- Start backend first: `cd server && npm start`
- Start frontend second: `cd client && npm run dev`

**Check if ports are running:**
```bash
# Check if 5001 is in use (backend)
lsof -i :5001

# Check if 3000 is in use (frontend)
lsof -i :3000
```

---

## Project Folders Explained

```
traffic-Flow-ER/
│
├── server/                    # Backend (Express API)
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/       # Auth stuff
│   │   ├── db.js            # Database connection
│   │   └── index.js         # Main server file
│   ├── package.json
│   └── .env                 # Your secrets (don't commit!)
│
├── client/                    # Frontend (React app)
│   ├── src/
│   │   ├── pages/           # Dashboard, Alerts, etc
│   │   ├── components/       # Buttons, cards, etc
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx          # Main app file
│   │   └── index.css        # Styling
│   ├── package.json
│   └── vite.config.js       # Vite configuration
│
├── supabase/
│   └── migrations/           # Database setup scripts
│
└── .env                      # Your environment variables
```

---

## What's Running Locally?

When you're developing:

- **Backend API**: http://localhost:5001
  - This is where all the data lives
  - It talks to Supabase to store/get data

- **Frontend**: http://localhost:3000
  - This is the website you see
  - It talks to the backend API

Both need to be running for the app to work. If you close one, the other can't work properly.

---

## Testing the API Directly

You can test if the backend is working by opening this in your browser:

```
http://localhost:5001/api/intersections
```

If it returns JSON data, the backend is working!

---

## Next Steps

- Read the main [README.md](README.md) to understand the full project
- Explore the frontend by clicking around the app
- Check out the code in `client/src/pages/` to see how pages work
- Look at `server/src/routes/` to see how API endpoints are made

---

## Quick Checklist

Before you start coding:
- [ ] Node.js installed and version 18+
- [ ] Supabase account created
- [ ] `.env` file with correct keys
- [ ] Backend running at `http://localhost:5001`
- [ ] Frontend running at `http://localhost:3000`
- [ ] Can log in and see the app

If all of these are checked, you're ready to go!

---

## Need Help?

- Check the errors in terminal - they usually tell you what's wrong
- Look in the browser console (F12 / Cmd+Option+I) for frontend errors
- Re-read the step that's failing
- Try restarting both servers
- Ask in the GitHub issues if something doesn't work

Good luck! 🚀
