import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/safe initialization of Gemini AI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to sanitize or parse JSON safely from Gemini
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "");
  }
  return cleaned.trim();
}

// Helper to run Gemini with automatic model fallback when 503 high demand occurs
async function generateWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  params: { contents: any; config?: any }
) {
  const modelsToTry = [
    primaryModel,
    primaryModel !== "gemini-3.1-flash-lite" ? "gemini-3.1-flash-lite" : "gemini-3.8-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
      return { response, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || "");
      const is503OrUnavailable =
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("Resource has been exhausted") ||
        errMsg.includes("429");

      if (is503OrUnavailable) {
        console.warn(`Model ${modelName} hit high demand (503/429), trying fallback model...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// 1. API: Generate Complete Winning Bid Proposal
app.post("/api/generate-bid", async (req, res) => {
  try {
    const { job, profile, strategyConfig, model } = req.body;
    const selectedModel = model || "gemini-3.8-flash";

    if (!job || !profile) {
      return res.status(400).json({ error: "Job and profile data are required" });
    }

    const ai = getGeminiClient();

    // Fallback heuristic if API key is not yet set
    if (!ai) {
      const calculatedScore = Math.min(
        98,
        Math.max(
          65,
          Math.floor(
            (job.skillsRequired?.filter((s: string) =>
              profile.skills?.some((ps: string) => ps.toLowerCase().includes(s.toLowerCase()))
            ).length /
              Math.max(1, job.skillsRequired?.length || 1)) *
              40 +
              55
          )
        )
      );

      const targetPrice =
        job.budgetType === "fixed"
          ? Math.round((job.minBudget + job.maxBudget) / 2 || job.maxBudget || 500)
          : Math.round(profile.hourlyRate || 45);

      const mockProposal = `Hi there,

I carefully reviewed your project "${job.title}" and noticed your requirement for ${job.skillsRequired?.slice(0, 3).join(", ") || "this stack"}. As a senior specialist with over ${profile.yearsOfExperience || 5} years of proven production experience, I build robust, scalable architectures that ship on schedule with zero regression.

Here is my recommended execution roadmap tailored specifically to your deliverables:
1. Architecture & Core Setup: Establishing a clean, modular foundation with best-practice type safety and optimized runtime configurations.
2. Feature Engineering & Business Logic: Implementing fast, responsive interfaces, reliable data flow pipelines, and thoroughly validated endpoints.
3. Edge-Case Hardening & Performance: Comprehensive QA, Lighthouse/speed optimization, and security audits to guarantee seamless performance.
4. Seamless Deployment & Handover: Automated CI/CD integration, clear documentation, and 30 days of post-launch guarantee.

Why work with me:
- High communication cadence with daily staging demos and progress reports.
- Clean, maintainable codebase written for long-term scalability.
- Immediate availability to start today and commit full-time focus.

Let's jump on a quick 5-minute chat to discuss your milestones and get started immediately!

Best regards,
${profile.name || "Senior Developer"}`;

      return res.json({
        proposalText: mockProposal,
        hookOpening: `I noticed your requirement for ${job.skillsRequired?.[0] || "this project"} and can deliver a fast, scalable solution in ${job.budgetType === "fixed" ? "5 days" : "immediate sprints"}.`,
        bidAmount: targetPrice,
        deliveryDays: job.budgetType === "fixed" ? 5 : 7,
        milestones: [
          {
            title: "Milestone 1: Discovery & Architecture Blueprint",
            amount: Math.round(targetPrice * 0.3),
            durationDays: 2,
            deliverable: "Technical specification and initial prototype setup",
          },
          {
            title: "Milestone 2: Core Feature Implementation",
            amount: Math.round(targetPrice * 0.5),
            durationDays: 3,
            deliverable: "Fully functional modules integrated and tested",
          },
          {
            title: "Milestone 3: QA, Optimization & Handover",
            amount: Math.round(targetPrice * 0.2),
            durationDays: 1,
            deliverable: "Source code, documentation, and deployment support",
          },
        ],
        screeningAnswers: (job.screeningQuestions || []).map((q: string) => ({
          question: q,
          answer: `Yes, I have extensive experience with this. In my past projects, I handled similar constraints with high performance and clean code standards.`,
        })),
        matchScore: calculatedScore,
        matchReasoning: `Strong skill alignment with ${profile.skills?.slice(0, 4).join(", ")}. Profile experience matches project scope.`,
        clientPainPoints: [
          "Needs reliable, fast turnaround without communication bottlenecks.",
          "Requires clean, maintainable code with zero technical debt.",
        ],
        redFlags: job.maxBudget < 50 ? ["Budget is on the lower side for this scope"] : [],
      });
    }

    const systemInstruction = `You are the world's most successful elite Freelancer Bid Strategist and Proposal Writer (top 0.1% on Freelancer.com, Upwork, and Toptal).
Your goal is to write a punchy, ultra-persuasive, high-converting bid proposal that wins client interviews.
MANDATORY LENGTH RULE:
- The full proposal text ('proposalText') MUST be strictly between 1,200 and 1,400 letters/characters in total length.
- Make sure to provide thorough technical execution steps, past case proof, architecture roadmap, and guarantee terms to comfortably reach this 1,200–1,400 character window without padding with empty fluff.

Rules for high-converting proposals:
1. NEVER start with generic fluff like "I am writing in response to..." or "Dear Hiring Manager".
2. Hook the client in the first 2 sentences by directly addressing their specific pain point or offering a concrete solution/insight.
3. Reference the freelancer's most relevant skills, projects, and metrics.
4. Structure with clean bullet points and clear sections so it's effortless to scan.
5. Provide realistic milestone breakdown with pricing and duration.
6. Answer all client screening questions concisely and with demonstrated proof.
7. Return strictly valid JSON adhering to the specified schema.`;

    const prompt = `FREELANCER PROFILE:
Name: ${profile.name}
Title: ${profile.title}
Tone: ${profile.tone}
Experience: ${profile.yearsOfExperience} years
Hourly Rate: $${profile.hourlyRate}/hr
Min Fixed Rate: $${profile.minFixedRate}
Skills: ${profile.skills?.join(", ")}
Bio: ${profile.bio}
Portfolio Projects: ${JSON.stringify(profile.portfolioProjects || [])}
Unique Selling Points: ${profile.uniqueSellingPoints?.join("; ")}
Custom Signature: ${profile.customSignature}

CLIENT JOB POSTING:
Title: ${job.title}
Platform: ${job.platform}
Category: ${job.category}
Budget Type: ${job.budgetType}
Budget Range: $${job.minBudget} - $${job.maxBudget} (or $${job.minBudget}-$${job.maxBudget}/hr)
Client Country: ${job.clientCountry}
Client Rating: ${job.clientRating} / 5 (${job.clientReviewsCount} reviews)
Skills Required: ${job.skillsRequired?.join(", ")}
Screening Questions: ${JSON.stringify(job.screeningQuestions || [])}
Job Description:
"""
${job.description}
"""

BID STRATEGY PREFERENCES:
Strategy: ${strategyConfig?.bidAmountStrategy || "smart_competitive"}
Urgency: ${job.urgency}

CRITICAL: The generated 'proposalText' must be between 1,200 and 1,400 letters/characters in length. Generate the ultimate winning proposal in JSON format.`;

    const { response, modelUsed } = await generateWithFallback(ai, selectedModel, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            proposalText: {
              type: Type.STRING,
              description: "The complete, ready-to-send proposal copy with formatting and signature. Total character/letter count MUST be strictly between 1,200 and 1,400 letters/characters.",
            },
            hookOpening: {
              type: Type.STRING,
              description: "The punchy 1-2 sentence opening hook that grabs immediate attention in client preview",
            },
            bidAmount: {
              type: Type.NUMBER,
              description: "The optimal competitive bid amount in USD",
            },
            deliveryDays: {
              type: Type.NUMBER,
              description: "Estimated turnaround time in days",
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  durationDays: { type: Type.NUMBER },
                  deliverable: { type: Type.STRING },
                },
                required: ["title", "amount", "durationDays", "deliverable"],
              },
            },
            screeningAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ["question", "answer"],
              },
            },
            matchScore: {
              type: Type.NUMBER,
              description: "Match score percentage from 0 to 100",
            },
            matchReasoning: {
              type: Type.STRING,
              description: "Why this job matches or doesn't match the freelancer profile",
            },
            clientPainPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key unsaid or explicit client pain points identified in the description",
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Potential risks or ambiguities in this job posting (if any)",
            },
          },
          required: [
            "proposalText",
            "hookOpening",
            "bidAmount",
            "deliveryDays",
            "milestones",
            "screeningAnswers",
            "matchScore",
            "matchReasoning",
            "clientPainPoints",
            "redFlags",
          ],
        },
      },
    });

    const cleaned = cleanJsonOutput(response.text || "{}");
    const parsed = JSON.parse(cleaned);
    parsed.modelUsed = modelUsed;
    return res.json(parsed);
  } catch (err: any) {
    console.error("Error generating bid:", err);
    return res.status(500).json({ error: err.message || "Failed to generate bid proposal" });
  }
});

// 2. API: Deep Job Match Analysis & Red Flag Scanner
app.post("/api/analyze-job", async (req, res) => {
  try {
    const { job, profile, model } = req.body;
    const selectedModel = model || "gemini-3.8-flash";
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        matchScore: 88,
        matchReasons: ["Skills match closely with your profile stack", "Budget is within your target rate"],
        missingSkills: [],
        clientPsychology: "Client values speed, transparent communication, and immediate availability.",
        budgetCompetitiveness: "Healthy budget with high ROI potential.",
        recommendedPrice: job.budgetType === "fixed" ? Math.round(job.maxBudget * 0.9) : profile.hourlyRate,
        recommendedDays: 5,
        redFlags: [],
        suggestedQuestionsToClient: [
          "Do you have existing API documentation or wireframes ready?",
          "What is your target deadline for the initial production launch?",
        ],
      });
    }

    const prompt = `Analyze this freelancer job posting against the freelancer's profile:
JOB: ${JSON.stringify(job)}
PROFILE: ${JSON.stringify(profile)}

Provide an in-depth breakdown of win probability, client psychology, red flags, recommended pricing, and sharp questions to ask the client.`;

    const { response, modelUsed } = await generateWithFallback(ai, selectedModel, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            matchReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            clientPsychology: { type: Type.STRING },
            budgetCompetitiveness: { type: Type.STRING },
            recommendedPrice: { type: Type.NUMBER },
            recommendedDays: { type: Type.NUMBER },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestionsToClient: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "matchScore",
            "matchReasons",
            "missingSkills",
            "clientPsychology",
            "budgetCompetitiveness",
            "recommendedPrice",
            "recommendedDays",
            "redFlags",
            "suggestedQuestionsToClient",
          ],
        },
      },
    });

    const cleaned = cleanJsonOutput(response.text || "{}");
    const result = JSON.parse(cleaned);
    result.modelUsed = modelUsed;
    return res.json(result);
  } catch (err: any) {
    console.error("Error analyzing job:", err);
    return res.status(500).json({ error: err.message || "Failed to analyze job" });
  }
});

// 3. API: Rewrite & Refine Proposal (e.g., shorter, more technical, aggressive, consultative)
app.post("/api/rewrite-proposal", async (req, res) => {
  try {
    const { currentProposal, jobTitle, instruction, profile, model } = req.body;
    const selectedModel = model || "gemini-3.8-flash";
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        updatedProposal: `${currentProposal}\n\n[Refined with instruction: ${instruction}]`,
      });
    }

    const prompt = `Here is a freelancer bid proposal for the job "${jobTitle}":
"""
${currentProposal}
"""

Freelancer Name: ${profile?.name || "Freelancer"}
User Refinement Request: "${instruction}"

Rewrite and polish the proposal strictly following the user instruction.
IMPORTANT LENGTH REQUIREMENT: The resulting proposal MUST be between 1,200 and 1,400 letters/characters in total length.
Keep it high-converting, professional, and ready to send. Return only the revised text.`;

    const { response } = await generateWithFallback(ai, selectedModel, {
      contents: prompt,
    });

    return res.json({
      updatedProposal: response.text?.trim() || currentProposal,
    });
  } catch (err: any) {
    console.error("Error rewriting proposal:", err);
    return res.status(500).json({ error: err.message || "Failed to rewrite proposal" });
  }
});

// 4. API: Optimize Freelancer Profile
app.post("/api/optimize-profile", async (req, res) => {
  try {
    const { profile, targetNiche } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        improvedTitle: `Senior ${profile.title} | High-Conversion Specialist`,
        improvedBio: `Top-rated specialist helping startups and enterprises build scalable solutions with clean architecture.`,
        suggestedSkills: [...(profile.skills || []), "CI/CD", "Performance Optimization", "TypeScript"],
        suggestedHooks: [
          "I have built exact architectures like this with 99.9% uptime.",
          "Let's review your core deliverables so we can ship within days, not weeks.",
        ],
        actionableTips: [
          "Add quantifiable metrics in your project descriptions (e.g. 'Improved load time by 45%').",
          "Set up video walkthroughs for your top 2 portfolio case studies.",
        ],
      });
    }

    const prompt = `Act as an elite freelance career coach and SEO expert for platforms like Upwork and Freelancer.com.
Analyze this profile:
${JSON.stringify(profile)}
Target Niche: ${targetNiche || "Software Engineering & Full Stack"}

Provide profile optimization advice to increase bid win rates 3x.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedTitle: { type: Type.STRING },
            improvedBio: { type: Type.STRING },
            suggestedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["improvedTitle", "improvedBio", "suggestedSkills", "suggestedHooks", "actionableTips"],
        },
      },
    });

    const cleaned = cleanJsonOutput(response.text || "{}");
    return res.json(JSON.parse(cleaned));
  } catch (err: any) {
    console.error("Error optimizing profile:", err);
    return res.status(500).json({ error: err.message || "Failed to optimize profile" });
  }
});

// 5. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now(),
  });
});

// Vite Middleware for Development / Static Serve in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Freelancer Bid Bot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
