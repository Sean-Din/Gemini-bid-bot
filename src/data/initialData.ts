import { FreelancerProfile, JobPosting, BotFilterConfig } from '../types';

export const DEFAULT_FREELANCER_PROFILE: FreelancerProfile = {
  name: "Alex Rivera",
  title: "Senior Full-Stack Engineer & AI Solutions Architect",
  bio: "Full-stack engineer with 7+ years of experience engineering high-throughput SaaS platforms, AI agent pipelines, React/Next.js interfaces, and scalable Node/Python microservices. Proven track record of delivering 40+ client projects on time with clean architecture and 99.9% uptime.",
  hourlyRate: 65,
  minFixedRate: 350,
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "FastAPI",
    "Tailwind CSS",
    "PostgreSQL",
    "Supabase",
    "Gemini / OpenAI API",
    "Docker",
    "AWS",
    "GraphQL",
    "Web Scraping",
    "REST APIs"
  ],
  portfolioProjects: [
    {
      id: "proj-1",
      title: "AI CRM & Lead Pipeline Automation",
      description: "Built automated lead enrichment and scoring engine using Next.js 14, Node.js, and LLM classification.",
      techStack: ["Next.js", "TypeScript", "Python", "Tailwind"],
      resultMetric: "Processed 50k+ leads/month, reduced manual review time by 78%",
      liveUrl: "https://demo-leadflow.app"
    },
    {
      id: "proj-2",
      title: "Real-Time E-Commerce Analytics Dashboard",
      description: "Architected high-speed analytics interface with WebSockets, Recharts, and Postgres database caching.",
      techStack: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
      resultMetric: "Sub-50ms query latency across 1.2M historical transaction records",
      liveUrl: "https://demo-shopmetrics.io"
    },
    {
      id: "proj-3",
      title: "Automated Web Scraper & Price Intelligence Bot",
      description: "Engineered distributed scraping cluster bypassing anti-bot protections with proxy rotation and automated reporting.",
      techStack: ["Python", "Playwright", "FastAPI", "Docker"],
      resultMetric: "99.8% extraction reliability across 40+ retailer storefronts",
      liveUrl: "https://demo-scrapebot.dev"
    }
  ],
  tone: "high_impact",
  yearsOfExperience: 7,
  availabilityHoursPerWeek: 40,
  customSignature: "Best regards,\nAlex Rivera | Senior Full-Stack & AI Engineer",
  uniqueSellingPoints: [
    "Daily async video/text progress updates with live staging URLs",
    "Zero-debt clean TypeScript architecture with comprehensive test coverage",
    "100% money-back satisfaction guarantee and 30-day post-launch bug warranty",
    "Immediate availability to jump on calls and kick off sprints today"
  ]
};

export const DEFAULT_BOT_CONFIG: BotFilterConfig = {
  autoBidEnabled: false,
  testMode: true, // Dry run enabled by default for safety
  minMatchScore: 70,
  minBudget: 150,
  maxBudget: 15000,
  paymentVerifiedOnly: true,
  minClientRating: 4.5,
  maxProposalsCount: 20,
  speedDelaySeconds: 15,
  bidAmountStrategy: 'underbid_5',
  autoAnswerScreeningQuestions: true,
  allowedPlatforms: ['Freelancer', 'Upwork', 'Fiverr Pro', 'Guru', 'Toptal'],
  categoryWhitelist: ['Web Development', 'AI & Machine Learning', 'Mobile Apps', 'Full Stack', 'Automation & Scraping', 'API Integration']
};

export const INITIAL_JOB_POSTINGS: JobPosting[] = [
  {
    id: "job-101",
    title: "Build Modern AI-Powered Dashboard with Next.js & Tailwind CSS",
    description: "We are an early-stage startup looking for a senior developer to build our customer-facing analytics dashboard. Must have deep experience in Next.js 14/15 App Router, Tailwind CSS, TypeScript, and integrating LLM API endpoints for automated report generation. We already have the Figma UI design ready. Need someone who writes clean, modular code and can deliver within 2 weeks.",
    platform: "Upwork",
    category: "Web Development",
    budgetType: "fixed",
    minBudget: 1200,
    maxBudget: 1800,
    clientCountry: "United States",
    clientRating: 4.95,
    clientReviewsCount: 38,
    clientPaymentVerified: true,
    clientTotalSpent: 42500,
    skillsRequired: ["Next.js", "React", "TypeScript", "Tailwind CSS", "REST APIs"],
    proposalsCount: 6,
    postedAt: "2 mins ago",
    postedTimestamp: Date.now() - 120000,
    urgency: "high",
    screeningQuestions: [
      "Can you share 1-2 live links of dashboards you have built with Next.js & Tailwind?",
      "How soon can you start and how many hours can you commit per week?"
    ]
  },
  {
    id: "job-102",
    title: "Python Web Scraping Bot with Proxy Rotation & CSV Export",
    description: "Need a robust Python script / scraper that continuously monitors 3 commercial real estate websites, extracts new listings with pricing, square footage, and geo coordinates, and saves the data into PostgreSQL and Google Sheets. Must handle Cloudflare protection and rotate residential proxies reliably.",
    platform: "Freelancer",
    category: "Automation & Scraping",
    budgetType: "fixed",
    minBudget: 400,
    maxBudget: 650,
    clientCountry: "United Kingdom",
    clientRating: 4.8,
    clientReviewsCount: 19,
    clientPaymentVerified: true,
    clientTotalSpent: 9200,
    skillsRequired: ["Python", "Web Scraping", "FastAPI", "PostgreSQL", "Docker"],
    proposalsCount: 11,
    postedAt: "5 mins ago",
    postedTimestamp: Date.now() - 300000,
    urgency: "normal",
    screeningQuestions: [
      "What library do you recommend for bypassing Cloudflare anti-scraping (e.g. Playwright, undetected-chromedriver)?",
      "Have you built scrapers with automated cron schedules before?"
    ]
  },
  {
    id: "job-103",
    title: "Senior Full-Stack Developer for SaaS MVP (React + Node.js)",
    description: "Looking for an experienced full-stack engineer to take over and complete our B2B team collaboration MVP. Backend is Node.js/Express with Postgres, Frontend is React. Needs authentication (OAuth/JWT), stripe subscription billing integration, and WebSocket real-time notifications.",
    platform: "Upwork",
    category: "Full Stack",
    budgetType: "hourly",
    minBudget: 50,
    maxBudget: 75,
    clientCountry: "Canada",
    clientRating: 5.0,
    clientReviewsCount: 52,
    clientPaymentVerified: true,
    clientTotalSpent: 85000,
    skillsRequired: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    proposalsCount: 8,
    postedAt: "9 mins ago",
    postedTimestamp: Date.now() - 540000,
    urgency: "urgent",
    screeningQuestions: [
      "Describe your experience implementing Stripe webhooks and subscription tiers.",
      "Are you comfortable working in an existing Git codebase with pull requests?"
    ]
  },
  {
    id: "job-104",
    title: "AI Chatbot & Knowledge Base Integration using Gemini/OpenAI",
    description: "We need an AI engineer to integrate an intelligent customer support chatbot on our website. The bot needs to ingest our PDF product manuals, vectorize them into Supabase pgvector, and answer customer queries accurately with source citations. Fast turnaround required.",
    platform: "Toptal",
    category: "AI & Machine Learning",
    budgetType: "fixed",
    minBudget: 1500,
    maxBudget: 2500,
    clientCountry: "Germany",
    clientRating: 4.9,
    clientReviewsCount: 14,
    clientPaymentVerified: true,
    clientTotalSpent: 31000,
    skillsRequired: ["Python", "FastAPI", "Gemini / OpenAI API", "Supabase", "TypeScript"],
    proposalsCount: 4,
    postedAt: "14 mins ago",
    postedTimestamp: Date.now() - 840000,
    urgency: "high",
    screeningQuestions: [
      "Have you implemented RAG (Retrieval Augmented Generation) with vector embeddings before?",
      "How do you prevent AI hallucinations in customer-facing bots?"
    ]
  },
  {
    id: "job-105",
    title: "Fix Slow Database Queries & Optimize React App Performance",
    description: "Our React web app is experiencing slow initial load times (Lighthouse score 42) and our PostgreSQL database queries on user analytics are taking 4+ seconds. Need an optimization expert to audit our queries, add proper indexing, optimize bundle size, and implement server-side caching.",
    platform: "Freelancer",
    category: "Web Development",
    budgetType: "fixed",
    minBudget: 500,
    maxBudget: 800,
    clientCountry: "Australia",
    clientRating: 4.7,
    clientReviewsCount: 27,
    clientPaymentVerified: true,
    clientTotalSpent: 18400,
    skillsRequired: ["React", "PostgreSQL", "Node.js", "TypeScript"],
    proposalsCount: 14,
    postedAt: "22 mins ago",
    postedTimestamp: Date.now() - 1320000,
    urgency: "normal"
  },
  {
    id: "job-106",
    title: "Cheap Logo Design ($15) for Crypto Project",
    description: "Need someone to make 5 logos today for $15 total. Must be original vector graphic.",
    platform: "Freelancer",
    category: "Design",
    budgetType: "fixed",
    minBudget: 15,
    maxBudget: 20,
    clientCountry: "India",
    clientRating: 3.2,
    clientReviewsCount: 2,
    clientPaymentVerified: false,
    clientTotalSpent: 30,
    skillsRequired: ["Graphic Design", "Logo Design"],
    proposalsCount: 45,
    postedAt: "30 mins ago",
    postedTimestamp: Date.now() - 1800000,
    urgency: "low"
  }
];

export const MOCK_JOB_POOL: Partial<JobPosting>[] = [
  {
    title: "Build Responsive E-Commerce Marketplace with Next.js & Stripe",
    description: "Looking for a full-stack developer to build a multi-vendor digital goods marketplace. Features: Seller onboarding, Stripe Connect split payouts, instant downloads, search filtering, and user reviews. Clean code and responsive UI required.",
    platform: "Upwork",
    category: "Web Development",
    budgetType: "fixed",
    minBudget: 2200,
    maxBudget: 3500,
    clientCountry: "United States",
    clientRating: 5.0,
    clientReviewsCount: 41,
    clientPaymentVerified: true,
    clientTotalSpent: 64000,
    skillsRequired: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS"],
    screeningQuestions: [
      "Have you integrated Stripe Connect for marketplace payouts before?",
      "Can you provide a link to a marketplace or e-commerce store you created?"
    ]
  },
  {
    id: "job-gen-2",
    title: "Automated Data Pipeline with Python & AWS Lambda",
    description: "We need an engineer to build a serverless Python pipeline that fetches daily financial metrics from 5 REST APIs, transforms JSON payloads, and pushes structured records to PostgreSQL with automated Slack alert digests.",
    platform: "Freelancer",
    category: "Automation & Scraping",
    budgetType: "fixed",
    minBudget: 750,
    maxBudget: 1200,
    clientCountry: "Singapore",
    clientRating: 4.9,
    clientReviewsCount: 16,
    clientPaymentVerified: true,
    clientTotalSpent: 22000,
    skillsRequired: ["Python", "AWS", "PostgreSQL", "REST APIs", "FastAPI"],
    screeningQuestions: [
      "What is your approach to handling API rate limits and exponential backoff?"
    ]
  },
  {
    id: "job-gen-3",
    title: "AI Voice Agent Integration for Appointment Booking",
    description: "Seeking an AI developer to connect a voice AI agent with Google Calendar and Twilio. When a customer calls, the bot should hold a natural voice conversation, check calendar slot availability, and confirm bookings.",
    platform: "Toptal",
    category: "AI & Machine Learning",
    budgetType: "hourly",
    minBudget: 60,
    maxBudget: 90,
    clientCountry: "United States",
    clientRating: 4.95,
    clientReviewsCount: 68,
    clientPaymentVerified: true,
    clientTotalSpent: 115000,
    skillsRequired: ["Python", "Gemini / OpenAI API", "FastAPI", "Node.js", "REST APIs"],
    screeningQuestions: [
      "Have you worked with Twilio Voice Webhooks and real-time audio streams?",
      "How do you handle background noise and user interruptions in voice bots?"
    ]
  },
  {
    id: "job-gen-4",
    title: "Convert Figma Designs to Pixel-Perfect React Components with Tailwind",
    description: "We have an approved 18-page Figma design system for our enterprise SaaS product. Need a frontend specialist to code all components in clean, accessible React + Tailwind CSS with dark mode support.",
    platform: "Fiverr Pro",
    category: "Web Development",
    budgetType: "fixed",
    minBudget: 1000,
    maxBudget: 1600,
    clientCountry: "Netherlands",
    clientRating: 4.85,
    clientReviewsCount: 23,
    clientPaymentVerified: true,
    clientTotalSpent: 39000,
    skillsRequired: ["React", "TypeScript", "Tailwind CSS"],
    screeningQuestions: [
      "How do you ensure responsiveness across tablet, desktop, and mobile viewports?"
    ]
  }
];
