# UNO Game

A multiplayer online UNO game built with React, Vite, Tailwind CSS, Express, and Socket.io.

## Project Structure

```text
├── backend/            # Express & Socket.io server
│   ├── package.json
│   └── server.cjs
└── frontend/           # React frontend
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Getting Started (Local Development)

Follow the instructions below to run the backend and frontend services locally.

---

### 1. Running the Backend Server

The backend handles matchmaking, game state synchronization, and room management via Socket.io.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The backend server runs on `http://localhost:3001` by default.

---

### 2. Running the Frontend Development Server

The frontend provides the interactive user interface and local rule processing engine.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend app will be available at `http://localhost:5173`.

---

## Deployment

### Deploy Backend on Render

1. **Sign in** to [Render](https://render.com) and go to your Dashboard.

2. **Create a new Web Service**:
   - Click **New +** → **Web Service**.
   - Connect your **GitHub repository** containing this project.

3. **Configure the service**:
   | Setting           | Value                |
   | ----------------- | -------------------- |
   | **Name**          | `uno-backend`        |
   | **Root Directory**| `backend`            |
   | **Runtime**       | `Node`               |
   | **Build Command** | `npm install`        |
   | **Start Command** | `npm start`          |

4. **Set Environment Variables** (optional):
   - `PORT` → Render sets this automatically; no need to add it manually.

5. **Click "Create Web Service"** and wait for the deployment to finish.

6. **Copy your Render URL** — it will look something like:
   ```
   https://uno-backend-xxxx.onrender.com
   ```
   You will need this URL for the frontend deployment.

---

### Deploy Frontend on Vercel

1. **Sign in** to [Vercel](https://vercel.com) and go to your Dashboard.

2. **Import your project**:
   - Click **Add New…** → **Project**.
   - Connect your **GitHub repository** containing this project.

3. **Configure the project**:
   | Setting                | Value            |
   | ---------------------- | ---------------- |
   | **Framework Preset**   | `Vite`           |
   | **Root Directory**     | `frontend`       |
   | **Build Command**      | `npm run build`  |
   | **Output Directory**   | `dist`           |

4. **Set Environment Variables**:
   - Click **Environment Variables** and add:

   | Key                | Value                                         |
   | ------------------ | --------------------------------------------- |
   | `VITE_BACKEND_URL` | `https://uno-backend-xxxx.onrender.com`        |

   > Replace with the actual Render URL you copied in the previous step.

5. **Click "Deploy"** and wait for the build to complete.

6. Your frontend will be live at the Vercel URL (e.g. `https://uno-game-xxxx.vercel.app`).

---

### Post-Deployment: Update CORS (if needed)

If you run into CORS errors, update the `cors` origin in `backend/server.cjs`:

```js
const io = new Server(server, {
  cors: {
    origin: 'https://uno-game-xxxx.vercel.app', // your Vercel URL
    methods: ['GET', 'POST']
  }
});
```

Then redeploy the backend on Render.
