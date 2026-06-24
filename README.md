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

## Getting Started

Follow the instructions below to run the backend and frontend services.

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
