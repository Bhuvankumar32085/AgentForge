# 🤖 AgentForge - Autonomous AI Agent Workspace

> **Current Status:** 🚧 **Active Development Phase (Beta)**  
> **Estimated Full Completion:** ⏳ **Within 10 to 15 Days**  
> AgentForge is an advanced autonomous AI agent orchestration platform that empowers users to create, configure, and collaborate with intelligent AI agents equipped with live external tools and third-party integrations (Gmail, Google Calendar, Instagram, and Real-Time Web Search).

---

## 📌 Project Overview

AgentForge bridges the gap between conversational LLMs and reliable real-world action execution. Instead of merely answering questions, an AgentForge agent can:
- **Search the live web** for up-to-date facts, news, and documentation using Tavily Search API.
- **Draft and send emails** via Gmail API.
- **Schedule and inspect events** via Google Calendar.
- **Draft and publish social media content** via Instagram.
- **Enforce Human-in-the-Loop (HITL) Safety**: Side-effect and write actions (sending emails, publishing posts, scheduling meetings) are **never** executed blindly. The agent drafts an action plan, presents an interactive card to the user to review, edit, or cancel, and only executes through background workers after explicit user approval.

---

## 📊 Development Roadmap & Milestones

### ✅ Completed Milestones
- **Full-Stack Dual Backend Architecture**:
  - **Node.js Server (Port 8001)**: Express 5 + TypeScript managing users, JWT `httpOnly` authentication, Agent CRUD, Integration CRUD, rate limiting, and Redis caching.
  - **Python AI Engine (Port 8000)**: FastAPI + LangGraph stateful brain, Gemini Flash Lite tool-routing, RabbitMQ task queue, and isolated WebSocket rooms.
- **Modern Responsive UI (React 19 + Vite + Tailwind CSS v4)**:
  - High-performance, dark-mode cyberpunk aesthetic with smooth transitions.
  - Firebase Authentication (Google OAuth sign-in and sign-out).
  - Dashboard featuring complete Agent Management (Create, Edit, Delete, Search, Pagination, Active/Inactive toggle).
- **Rich Markdown & Structured Chat UI**:
  - `react-markdown` + `remark-gfm` integration.
  - Styled gradient headings (`###`), high-contrast glowing bold highlight badges (`**entity**`), custom purple bullet markers, and clean data tables.
  - Dark-mode Code Blocks with syntax labels and **1-Click Copy** buttons.
- **Human-in-the-Loop (HITL) Approval Flow**:
  - Interactive `ActionApprovalCard` embedded directly in chat messages.
  - Inline editing of action parameters (recipient, subject, date, caption).
  - Permanent task cancellation (`409` conflict guardrails preventing cancelled tasks from ever executing).
  - Atomic approval transition (`awaiting_approval` ➔ `queued` ➔ RabbitMQ ➔ Worker).
- **Live WebSocket Multi-Device Isolation**:
  - Real-time bidirectional WebSocket synchronization scoped strictly per `(userId, agentId)` room.
  - Simultaneous multi-device broadcast (desktop and mobile view live agent turns in real time without cross-chat collisions).
  - Live 4-stage progress bar (`25%` ➔ `50%` ➔ `75%` ➔ `100%`) pushed by the background RabbitMQ worker.
- **Live Integrations & Security**:
  - Live Tavily Web Search tool with automatic retrieval.
  - Full CRUD API & Mongoose model for third-party `Integration` (Google, Instagram) with credential encryption and `select: false`.
  - Multi-tier `.gitignore` and ReDoS regex sanitizers protecting sensitive keys.

---

### ⏳ Pending & Upcoming Milestones
- **Live 1-Click OAuth Authorization UI**: Connecting the frontend `Integrations.tsx` page to Google OAuth2 and Instagram Graph API authorization flows.
- **Live Third-Party API Execution**: Replacing Calendar and Instagram stubs with live OAuth API credentials (Gmail and Tavily are already live).
- **Agent Execution History & Analytics**: Dedicated page to inspect past task executions, duration, token usage, and status logs.
- **Voice & Audio Capabilities**: Speech-to-text input and audio playback in the chat interface.
- **Production Deployment Pipeline**: Docker Compose, Nginx reverse proxy, and cloud deployment on AWS / Render / Vercel.

> **Timeline:** All pending items are scheduled for completion within the next **10 to 15 days**.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Redux Toolkit, React Router v7, Sonner (Toasts), React-Markdown, Remark-GFM, Radix UI |
| **Node.js Server** | Node.js 22, Express 5, TypeScript, Mongoose (MongoDB ODM), ioredis (Redis client), jsonwebtoken, cookie-parser, Firebase Admin SDK |
| **AI Engine Backend** | Python 3.11, FastAPI, LangGraph, LangChain Core, Google Generative AI (`gemini-flash-lite-latest`), Tavily Web Search API, aio-pika (RabbitMQ), Uvicorn |
| **Databases & Messaging** | MongoDB Atlas (NoSQL DB), Redis Cloud (Caching & Rate Limiting), RabbitMQ (Message Broker & Task Queue) |
| **Auth & Security** | Firebase Auth (Client), JWT with `httpOnly` secure cookies, Multi-Tenant Isolation, Redis sliding-window Rate Limiter, Regex Sanitizers |

---

## 🧠 Current Agent Capabilities & Workflow

1. **Conversational Memory with Sliding-Window Context**:
   Maintains the last 10 messages of conversation history in MongoDB and feeds them to Gemini Flash Lite for context-aware responses.
2. **Strict Tool Permission Enforcement**:
   Every agent has a defined set of enabled tools (e.g. `["Web Search"]` or `["Gmail", "Google Calendar"]`). If a user requests an action requiring an unassigned tool, the agent immediately halts and instructs the user to enable it in the dashboard.
3. **Safe Read-Only Tool Execution**:
   For safe tools (such as `web_search`), LangGraph routes to the tool node automatically, queries Tavily, and returns formatted facts within seconds.
4. **Human-in-the-Loop Side-Effect Safety**:
   For actions that create external side effects (sending emails, scheduling meetings, posting to Instagram), the agent prepares a detailed JSON draft and pauses. It waits for the human user to review and click **Approve**, **Edit**, or **End Task**.
5. **Background Worker & Progress Sync**:
   Once approved, RabbitMQ queues the execution job. The background worker (`chat_worker.py`) picks it up, delivers milestone progress (`25%` ➔ `50%` ➔ `75%` ➔ `100%`), and notifies the frontend live over WebSocket.

---

## 🚀 Future Vision & Long-Term Goals

1. **Autonomous Multi-Agent Swarms**:
   Enabling multiple specialized agents to collaborate seamlessly (e.g., a **Researcher Agent** searches the web, hands findings to a **Copywriter Agent**, who passes the draft to an **Email Agent** for delivery).
2. **Custom Knowledge Base RAG (Retrieval-Augmented Generation)**:
   Document and PDF upload with vector embeddings (Pinecone / Qdrant) so agents have domain-specific memory.
3. **Agent Marketplace**:
   A community hub where creators can publish, share, and clone pre-configured agents (e.g., "Customer Support Agent", "SEO Content Creator", "Daily Briefing Executive").
4. **Automated Cron Scheduling**:
   Allowing agents to run periodic scheduled jobs automatically (e.g., "Every weekday at 8 AM, search top AI news and email me a summary").

---

## 💻 Getting Started (Local Development Setup)

### Prerequisites
- Node.js >= 20.x
- Python >= 3.11
- Active MongoDB Atlas cluster, Redis instance, and RabbitMQ broker

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 2. Node.js Backend Setup
```bash
cd backend/node-server
npm install
npm run dev
# Running on http://localhost:8001
```

### 3. AI-Engine Backend Setup
```bash
cd backend/ai-engine
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m src.main
# Running on http://localhost:8000
```

---

## 📄 License
This project is proprietary and currently under active private development for **AgentForge**.
