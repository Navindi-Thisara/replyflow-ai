# 🚀 ReplyFlow AI

### AI-Powered Customer Conversation Management Platform

ReplyFlow AI is a full-stack web application that helps businesses manage customer conversations, generate AI-assisted replies, and identify potential leads from customer interactions.

The platform combines conversation management, generative AI, lead tracking, analytics, authentication, and secure user-specific data into a single application.

🔗 **Live Demo:** https://replyflow-ai-bzfl.vercel.app/

---

## 📌 Overview

Managing customer conversations can become difficult when messages, follow-ups, and potential leads are spread across different channels.

**ReplyFlow AI** provides a centralized workspace where businesses can:

- Manage customer conversations
- Generate AI-assisted customer replies
- Continue conversations with persistent message history
- Identify and manage potential leads
- Monitor conversation and lead activity
- Secure customer data through authenticated user accounts

The project was built to demonstrate how generative AI can be integrated into a practical full-stack application rather than being used only as a standalone chatbot.

---

## ✨ Features

### 🤖 AI Reply Generation

Generate customer replies using the Google Gemini API.

Users can customize:

- Response tone
- Response length
- AI-generated message content

Supported tones include:

- Professional
- Friendly
- Empathetic
- Concise

---

### 💬 Conversation Management

Manage customer conversations from a centralized interface.

Features include:

- Create new conversations
- View conversation history
- Send customer messages
- Send human or AI-assisted replies
- Maintain persistent message history
- Continue follow-up messages within the correct conversation thread

---

### 🔥 Lead Management

Identify potential customers and manage them as leads.

The lead management workflow allows users to:

- Create leads from conversations
- Associate leads with conversations
- Track lead status
- View lead activity

---

### 📊 Analytics Dashboard

The analytics section provides an overview of application activity, including:

- Conversation activity
- Lead activity
- Customer interactions
- Conversation status

---

### 🔐 Authentication & Data Security

User authentication is handled through **Supabase Authentication**.

The application uses **Row Level Security (RLS)** to ensure that authenticated users can access only their own application data.

Protected data includes:

- Conversations
- Messages
- Leads

---

### 🌙 Responsive UI

The application includes:

- Responsive desktop and mobile layouts
- Dark mode
- Light mode
- Reusable UI components
- Responsive navigation
- Clean SaaS-style interface

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**
- **next-themes**

### Backend & Database

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**
- **Row Level Security (RLS)**

### AI

- **Google Gemini API**

### Deployment

- **Vercel**

### Development Tools

- Git
- GitHub
- npm
- Visual Studio Code

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    │ React + TypeScript  │
                    │    Tailwind CSS     │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
     ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
     │   Supabase   │  │ Next.js API   │  │    Gemini    │
     │ Auth + DB    │  │    Routes     │  │     API      │
     └──────┬───────┘  └───────┬───────┘  └──────────────┘
            │                  │
            ▼                  ▼
     ┌──────────────┐  ┌───────────────┐
     │ PostgreSQL   │  │ AI Reply      │
     │ + RLS        │  │ Generation    │
     └──────────────┘  └───────────────┘

     replyflow-ai/
│
├── app/
│   ├── api/
│   │   └── generate-reply/
│   │       └── route.ts
│   │
│   ├── analytics/
│   │   └── page.tsx
│   │
│   ├── conversations/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── leads/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   ├── settings/
│   │   └── page.tsx
│   │
│   ├── page.tsx
│   └── ...
│
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── DashboardSidebar.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/
│
├── lib/
│   └── supabase/
│       └── client.ts
│
├── public/
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

🗄️ Database

ReplyFlow AI uses PostgreSQL through Supabase.

Main Tables
conversations

Stores customer conversation information.

id
user_id
customer_name
last_message
status
created_at
updated_at
messages

Stores individual messages within conversations.

id
conversation_id
user_id
sender_type
content
created_at
leads

Stores potential customer leads.

id
user_id
conversation_id
status
created_at
Message Types
CUSTOMER
AI
HUMAN
Conversation Status
HOT
WARM
NEW
🔐 Security

Security is an important part of the application.

Authentication

Supabase Authentication is used for:

User registration
User login
User logout
Session management
Row Level Security

PostgreSQL Row Level Security policies restrict database access based on the authenticated user's ID.

For example:

Authenticated User
        │
        ▼
    auth.uid()
        │
        ▼
   user_id match
        │
        ▼
Access own data only

This prevents one authenticated user from accessing another user's conversations, messages, or leads.

🤖 AI Integration

ReplyFlow AI uses the Google Gemini API to generate customer responses.

The application sends the customer message together with the selected preferences to the backend API.

Customer Message
       │
       ▼
Next.js API Route
       │
       ▼
Google Gemini API
       │
       ▼
Generated Reply
       │
       ▼
Conversation Composer
       │
       ▼
Customer Conversation
AI API Endpoint
POST /api/generate-reply

Example request:

{
  "message": "Can you tell me more about your pricing?",
  "tone": "Professional",
  "length": "Medium"
}

Example response:

{
  "reply": "I'd be happy to provide more information about our pricing..."
}
⚙️ Getting Started
1. Clone the repository
git clone https://github.com/Navindi-Thisara/replyflow-ai.git
2. Navigate to the project
cd replyflow-ai
3. Install dependencies
npm install
4. Configure environment variables

Create a .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

Never commit .env.local or expose API keys publicly.

5. Start the development server
npm run dev

Open:

http://localhost:3000
🔑 Supabase Setup

Create a Supabase project and configure the required database tables.

The application requires:

Supabase Authentication
PostgreSQL database
Row Level Security policies

After creating the database tables, configure the corresponding environment variables in .env.local.

🚀 Deployment

ReplyFlow AI is deployed using Vercel.

Production environment variables should be configured in the Vercel project settings:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY
🧪 Testing the Application

A typical application workflow is:

Register
   ↓
Login
   ↓
Dashboard
   ↓
Create Conversation
   ↓
Enter Customer Message
   ↓
Generate AI Reply
   ↓
Review / Edit Reply
   ↓
Send Reply
   ↓
Continue Conversation
   ↓
Create Lead
   ↓
View Analytics
📸 Screenshots
Landing Page

Add screenshot here

Dashboard

Add screenshot here

Conversations

Add screenshot here

AI Reply Generation

Add screenshot here

Lead Management

Add screenshot here

Analytics

Add screenshot here

🎯 Project Goals

The main goals of ReplyFlow AI were to:

Build a complete full-stack web application
Integrate generative AI into a practical workflow
Implement secure user authentication
Protect user-specific database records
Create persistent customer conversations
Develop lead management functionality
Build a responsive SaaS interface
Deploy a production-ready application
📚 Key Learning Outcomes

Through this project, I gained practical experience with:

Full-stack application development
Next.js App Router
React and TypeScript
REST API integration
Generative AI integration
Supabase Authentication
PostgreSQL database design
Row Level Security
State management
Responsive UI development
Environment configuration
Production deployment with Vercel
🔮 Future Improvements

Possible future enhancements include:

Email and social media integrations
Real-time messaging
Conversation search and filtering
Advanced lead scoring
AI-powered conversation summaries
Custom business AI instructions
Team collaboration
Role-based access control
More detailed analytics
Automated follow-up suggestions
👨‍💻 Author

Navindi Thisara

Software Engineering Student | Full-Stack Developer

🔗 GitHub: https://github.com/Navindi-Thisara
🔗 LinkedIn: https://www.linkedin.com/in/navindi-thisara/

📄 License

This project was developed as a personal full-stack project for learning and portfolio purposes.


### One important change I'd make before you publish it

Don't leave all the **“Add screenshot here”** sections empty. For a recruiter looking at GitHub, **4–5 actual screenshots** will make the repository much stronger:

1. Landing page
2. Dashboard
3. Conversation + AI reply
4. Leads
5. Analytics

Also, keep the README focused on **what you actually implemented**. Don't add features such as email/social integrations, real-time messaging, or advanced lead scoring to the feature list unless you've actually built them. The **Future Improvements** section is the correct place for those.

If you want the strongest GitHub presentation, I can also give you a **:contentReference[oaicite:0]{index=0}**, specifically formatted for your `Navindi-Thisara/replyflow-ai` repository.