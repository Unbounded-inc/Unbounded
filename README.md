# 🌐 Unbounded – A Social Platform for Authentic Connections

**Unbounded** is a full-stack web application designed to provide a safe and inclusive space for users to express themselves without fear of judgment. Users can interact through personalized feeds, participate in forum discussions, message privately, and explore local events through an interactive map.

> This README reflects our current progress and will be updated as we implement more features.

---

## ✅ Current Features (As of April 2025)

### 🔐 Authentication & User Profiles
- Auth0 integration for secure OAuth login (Google, GitHub, etc.).
- Anonymous account option for privacy-focused users.
- Profile creation and editing with real-time updates.
- Frontend validation and account data handling.

### 💬 Messaging System
- One-on-one direct messages.
- Group chat support with:
    - Real-time communication using WebSockets via Socket.io.
    - Message history and conversation search.
    - Group admin capabilities (add/remove members).
    - Mute and leave options.

### 🖼️ Feed & Media Posting
- Ability to post text, images, and video links.
- Uploaded media is securely stored and displayed with previews.
- File validation (size/type) on the frontend.


### 🌓 UI/UX & Theming
- Intuitive layout with a fixed navigation bar and sidebar for easy access.

---

## 🧑‍💻 Contributions

    Under Construction
---

## 🧰 Tech Stack

| Layer       | Tech Used                 |
|-------------|---------------------------|
| Frontend    | React, TypeScript         |
| Backend     | Node.js, Express          |
| Auth        | Auth0 (OAuth 2.0, JWT)    |
| Database    | PostgreSQL                |
| Real-Time   | Socket.io, WebSockets     |
| Deployment  | DigitalOcean App Platform |
| Maps        | Google Maps API           |
| Testing     | Jest                      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (locally or via DigitalOcean)
- `.env` file with the following environment variables:

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_CALLBACK_URL=http://localhost:3000/callback
SESSION_SECRET=your_session_secret
```

---

### 📦 Backend Setup

```bash
cd backend
npm install
npm run dev
```

> This runs the Express server with nodemon for development mode.

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> This starts the Vite development server (React + TypeScript) on [http://localhost:5173](http://localhost:5173).

---

### 🧪 Running Tests

```bash
# Inside frontend or backend directory (depending on test location)
npm run test
```

> Jest is configured for unit and integration testing. More tests will be added soon.

---

## 🌍 Deployment

We are currently using **DigitalOcean App Platform** and **Droplets** for hosting both frontend and backend, with automated deployments via GitHub Actions. Further details on deployment scripts and CI/CD pipeline will be added soon.

---

## 📌 Project Structure

```bash
├── backend
│   ├── src
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── sockets/
│   │   └── index.ts
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## 📅 Timeline Snapshot

| Feature                        | Status        |
|-------------------------------|---------------|
| Auth + Profile System         | ✅ Completed  |
| Community Feed                | ✅ Completed  |
| Forums                        | ⏳ Planned  |
| Messaging (1-1 + Group Chat)  | 🚧 In Progress |
| Map + Events Page             | ⏳ Planned  |
| Moderation Tools              | ⏳ Planned|
| Notifications                 | 🚧 In Progress|
| Friend System                 | ⏳ Planned    |
| Advanced Moderation & Gamification | ⏳ Planned    |

---

## 🧠 Future README Updates

This README will continue to evolve with:
- More detailed instructions for deployment and CI/CD.
- API documentation for both frontend and backend.
- Schema diagrams and feature walkthrough GIFs.

---

## 🙌 Credits

Team Members:
- **Roy Delgado** – Frontend/UI Lead
- **Isabel Stec** – Backend + Debugging
- **Calvin Hardowar** – Database + Backend
- **Manuel Reyes** – Fullstack + Real-Time Systems

---

## 📫 Questions?

Feel free to reach out via GitHub issues or contact the devs directly for help setting up the project locally!
