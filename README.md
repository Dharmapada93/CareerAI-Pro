# CareerAI Pro - AI Resume Builder & Mock Interview Platform

CareerAI Pro is a premium SaaS-style career preparation platform designed for freshers, students, and active job seekers. It empowers users to compile professional resumes, grade layout compatibility via an ATS Score Checker, practice live technical interview questions in an interactive AI mock room, draft custom cover letters, and host responsive developer portfolios.

---

## Tech Stack
* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Three.js (interactive particle background)
* **Database**: Local MongoDB Community Server & Mongoose ODM
* **Auth**: NextAuth.js (Credentials login)
* **Backend microservice**: Python FastAPI (Uvicorn)
* **AI engine**: Google Gemini API (with Mock mode fallback if no API key is specified)

---

## Installation & Setup

### 1. Database Setup (MongoDB Local)
Ensure you have the MongoDB Community Server installed and running locally.
* **Windows**: The MongoDB service usually starts automatically. If not, start it via Services App or run:
  ```powershell
  net start MongoDB
  ```
* **Connection String**: The project connects to `mongodb://127.0.0.1:27017/careerai_pro` as defined in `.env.local`.

---

### 2. AI Service Setup (FastAPI Backend)
Inside the `ai-service` directory, set up the Python environment and run the server:

1. **Open a terminal** and navigate to `/ai-service`:
   ```bash
   cd ai-service
   ```
2. **Create a Python Virtual Environment**:
   ```bash
   python -m venv .venv
   ```
3. **Activate the Virtual Environment**:
   * **Windows**:
     ```powershell
     .venv\Scripts\activate
     ```
   * **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```
4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   * *Optional*: Enter your `GEMINI_API_KEY` to enable production-grade Gemini responses. If empty, the backend runs in **Mock Mode** automatically, serving high-quality mock data for testing.
6. **Start the FastAPI Microservice**:
   ```bash
   python main.py
   ```
   The service will run on `http://127.0.0.1:8000`.

---

### 3. Next.js Frontend Setup
In the root directory of the project:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Verify Environment Variables**:
   Verify that `.env.local` contains the following:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/careerai_pro
   NEXTAUTH_SECRET=9a3c10e42d721bb55e08b15d2a912e75cb7966bb6b2e3e1cfcf0d4cb80084f7b
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
   ```
3. **Start the Next.js Dev Server**:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:3000`.

---

## Seeding the Database (Demo Data)

We have created an automated database seeding endpoint to populate accounts and sample resumes immediately:

1. Start both the **FastAPI microservice** and the **Next.js frontend**.
2. Open your browser and navigate to:
   [http://localhost:3000/api/seed](http://localhost:3000/api/seed)
3. You will receive a success response, and the database will be seeded with:
   * **Admin User**: `admin@careerai.pro`
   * **Password**: `password123`
   * Pre-populated resumes, ATS scan history, completed interview feedback reports, and portfolio sites.
4. Go to [http://localhost:3000/login](http://localhost:3000/login) and log in with the above credentials to explore the fully populated dashboard.

---

## Key Feature Manuals

### AI STAR Bullets Optimizer
When editing a resume under `/dashboard/resume/[id]`, type a simple accomplishment draft under the Experience section and click the **Sparkles** icon. Our microservice will translate the text into three high-impact STAR alternatives for you to select and drop in.

### Exporting Resumes to PDF
We utilize a clean `@media print` stylesheet. Click **Export PDF** in the resume builder to launch the print menu. All UI margins, navigation tabs, sidebars, and editing boxes will be hidden, outputting a standard single or multi-page A4 document structure.
