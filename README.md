# OmniPool 🚀

**AI-Driven Community Hardware & Skill Allocation Engine**

A full-stack MERN application that uses RAG (Retrieval-Augmented Generation) to match community-owned hardware and human skills against natural-language project descriptions.

## ✨ Features

- **AI Project Parsing** — Describe your project in plain English, get a structured Bill of Materials and required skills
- **Grounded AI Advisor (RAG)** — Get a personalized project strategy grounded in the *actually available* community hardware and mentors
- **Vector Search Matching** — MongoDB Atlas Vector Search finds the most relevant hardware and mentors in your community
- **Hardware Registry** — Share your idle Raspberry Pis, Arduinos, sensors, and tools
- **Skills Profile** — Declare your expertise and get matched as a mentor
- **Premium Dark UI** — Glassmorphism design with smooth animations

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand |
| Backend | Express.js, Node.js |
| Database | MongoDB with Mongoose |
| AI/ML | Google Gemini 1.5 Pro, text-embedding-004 |
| Search | MongoDB Atlas Vector Search |
| DevOps | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (optional — mock mode available)

### 1. Clone & configure
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
```

### 2. Start Backend
```bash
cd server
npm install
npm run dev
```

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

### 4. Docker (alternative)
```bash
docker-compose up --build
```

## 📁 Project Structure

```
OMNIPOOL/
├── client/                     # React + Vite + TypeScript frontend
│   └── src/
│       ├── api/                # Axios API client
│       ├── components/         # UI, layout, dashboard components
│       ├── pages/              # Route pages
│       └── store/              # Zustand state management
├── server/                     # Express.js backend
│   └── src/
│       ├── config/             # DB & Gemini initialization
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth & error handling
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express routes
│       ├── services/           # AI, embedding, vector search
│       └── utils/              # Mock data
├── docker-compose.yml
├── Dockerfile.client
└── Dockerfile.server
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/parse-project` | POST | AI-parse a project description |
| `/api/ai/match-resources` | POST | Match hardware & mentors |
| `/api/users` | GET/POST | List users / Register |
| `/api/users/:id` | GET/PUT | Get / Update profile |
| `/api/hardware` | GET/POST | List / Add hardware |
| `/api/hardware/:id` | GET/PUT/DELETE | Manage hardware item |
| `/api/projects` | GET/POST | List / Create project |
| `/api/projects/:id` | GET/PUT | Get / Update project |

## 🧪 Development Mode

Without a Gemini API key, the app runs in **mock mode** — AI endpoints return contextual mock responses based on keyword detection (robots, weather stations, drones, etc.). This allows full frontend development without API costs.

## 📝 Atlas Vector Search Setup

To enable semantic vector search, create an Atlas Vector Search index:

1. Go to MongoDB Atlas → Your Cluster → Search → Create Index
2. Use the JSON editor and create indexes on:
   - `HardwareItem` collection → `item_description_embedding` field
   - `User` collection → `skills_embedding` field
3. Set dimensions to `768` and similarity to `cosine`

---

Built with ❤️ for the maker community.
