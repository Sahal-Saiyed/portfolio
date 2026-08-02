export type Project = {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  description: string;
  contribution: string;
  image: string;
  imageAlt: string;
  accent: "olive" | "blue" | "amber" | "violet";
  tags: string[];
  stack: string[];
  links: {
    live?: string;
    source?: string;
    extra?: { label: string; href: string };
  };
  problem: string;
  solution: string;
  architecture: string[];
  decisions: { title: string; detail: string }[];
  results: string[];
  limitations: string[];
};

export const projects: Project[] = [
  {
    slug: "jurigpt",
    index: "01",
    title: "JuriGPT — AI Legal Assistant for Indian Law",
    shortTitle: "JuriGPT",
    eyebrow: "RAG · Generative AI · Full-stack",
    summary:
      "A grounded legal AI assistant that retrieves from curated Indian-law sources, streams multilingual answers, and creates validated legal-document drafts.",
    description:
      "JuriGPT turns a curated legal knowledge base into a source-aware assistant. It combines semantic retrieval, context processing, Gemini generation, authenticated conversation history, and intent-driven document drafting in one full-stack product.",
    contribution:
      "I designed and built the retrieval pipeline, application services, authentication and persistence flows, document-generation workflow, and responsive React experience.",
    image: "/projects/jurigpt.png",
    imageAlt: "JuriGPT product logo",
    accent: "olive",
    tags: ["Flagship", "Live", "End-to-end"],
    stack: [
      "Python",
      "FastAPI",
      "React",
      "TypeScript",
      "Gemini",
      "E5 Embeddings",
      "ChromaDB",
      "MongoDB",
      "Docker",
    ],
    links: {
      live: "https://jurigpt.vercel.app/",
      source: "https://github.com/Sahal-Saiyed/AI-Legal-Assistant",
    },
    problem:
      "Legal information is fragmented, difficult to navigate, and especially risky when a general-purpose model answers without traceable context. The product needed to make source-grounded information easier to explore while remaining explicit that it does not provide legal advice.",
    solution:
      "The system ingests PDF, Markdown, and text sources, recursively chunks them with metadata, embeds them with E5, and retrieves relevant context from ChromaDB. A provider-independent LLM layer streams grounded responses, while a separate validated workflow collects required fields before generating supported legal-document drafts.",
    architecture: [
      "Curated legal sources",
      "Chunking + metadata",
      "E5 embeddings",
      "Semantic retrieval",
      "Context processing",
      "Gemini streaming",
      "Source-backed answer",
    ],
    decisions: [
      {
        title: "Grounding before generation",
        detail:
          "Retrieval and overlap-aware context processing happen before prompting, reducing duplicate evidence and keeping responses tied to the curated knowledge base.",
      },
      {
        title: "Validation instead of invention",
        detail:
          "Document drafting uses intent routing and mandatory-field follow-ups. Missing names, dates, or amounts are requested rather than fabricated.",
      },
      {
        title: "Product, not a prompt demo",
        detail:
          "JWT authentication, MongoDB-backed conversation management, search, rename, deletion, streaming, and responsive UI make the assistant usable beyond a notebook.",
      },
    ],
    results: [
      "Eleven selectable response languages",
      "Source attribution and streamed answers",
      "Persistent authenticated conversations",
      "Supported legal-document drafting with PDF export",
      "Modular, provider-independent backend boundaries",
    ],
    limitations: [
      "The current E5 index is optimized for English retrieval, so multilingual questions may retrieve less relevant context.",
      "Generated document PDFs currently target English drafts.",
      "The assistant provides legal information, not legal advice.",
    ],
  },
  {
    slug: "neev-ai-poc",
    index: "02",
    title: "Neev AI Agent",
    shortTitle: "Neev AI Agent",
    eyebrow: "Freelance client POC · Agentic workflows",
    summary:
      "A freelance proof of concept that turns conversational requests for reinforcement formulas and custom shapes into validated, reviewable approval workflows.",
    description:
      "Built as a paid freelance engagement, NEEV AI POC helps construction teams manage project hierarchies, reinforcement shapes, formula overrides, and AI-assisted change requests without allowing the agent to make uncontrolled updates.",
    contribution:
      "I developed the LangGraph assistant, deterministic fallback extraction, validation layer, role-based user and admin workflows, formula-resolution services, image storage, and MongoDB persistence.",
    image: "/projects/neev_ai_agent.png",
    imageAlt: "NEEV AI logo",
    accent: "amber",
    tags: ["Freelance client work", "Proof of concept", "Workflow AI"],
    stack: [
      "Python",
      "LangGraph",
      "Streamlit",
      "MongoDB Atlas",
      "OpenRouter",
      "Pydantic",
      "GridFS",
    ],
    links: {},
    problem:
      "Construction-estimation workflows involve project-specific reinforcement shapes and formulas. Teams needed a safer way to request formula changes or new shapes, preserve context, and route those requests to an administrator instead of modifying shared calculation logic directly.",
    solution:
      "A conversational assistant gathers the project, category, shape, output, formula, and reason across multiple turns. Structured extraction is merged with deterministic recovery logic, validated against project data, and submitted as a pending request. Administrators review and apply approved changes as project-scoped overrides.",
    architecture: [
      "User request",
      "LangGraph state",
      "Structured extraction",
      "Deterministic fallback",
      "Domain validation",
      "Admin approval",
      "Project override",
    ],
    decisions: [
      {
        title: "Human approval stays in control",
        detail:
          "The agent prepares requests but never directly updates formulas or creates shared shapes. Approval remains an explicit administrator action.",
      },
      {
        title: "LLM output is not trusted blindly",
        detail:
          "Pydantic schemas, domain validation, and regex-based fallback extraction recover common fields and reject incomplete or inconsistent requests.",
      },
      {
        title: "Project-specific customization",
        detail:
          "Overrides are resolved per project, preserving a global shape library while allowing controlled local changes.",
      },
    ],
    results: [
      "Multi-turn structured request collection",
      "Role-based user and administrator experiences",
      "Formula-change and new-shape approval flows",
      "MongoDB Atlas persistence and GridFS image storage",
      "Deployed Streamlit application",
    ],
    limitations: [
      "Client-sensitive implementation details are intentionally withheld.",
      "Proprietary formulas, screenshots, and operational data are not displayed.",
      "The engagement focused on a practical proof of concept rather than public multi-tenant distribution.",
    ],
  },
  {
    slug: "captioncaptain",
    index: "03",
    title: "CaptionCaptain — Multimodal Video Captioning",
    shortTitle: "CaptionCaptain",
    eyebrow: "Multimodal AI · Vision-language models",
    summary:
      "A Dockerized video-understanding pipeline that selects key frames and produces structured, context-aware captions in distinct writing styles.",
    description:
      "CaptionCaptain accepts a video upload or URL, extracts representative frames, sends visual context to a vision-language model, and returns captions for formal, sarcastic, technical-humor, nontechnical-humor, and custom styles.",
    contribution:
      "I built the key-frame extraction, image preprocessing, multimodal prompting, structured response validation, batch evaluation workflow, Docker packaging, and interactive Streamlit interface.",
    image: "/projects/captioncaptain.png",
    imageAlt: "CaptionCaptain cap-and-clapperboard logo",
    accent: "violet",
    tags: ["Hackathon", "Live", "Multimodal"],
    stack: [
      "Python",
      "OpenCV",
      "Fireworks AI",
      "Vision-language models",
      "Pydantic",
      "Streamlit",
      "Docker",
    ],
    links: {
      live: "https://captioncaptain.streamlit.app/",
      source: "https://github.com/Sahal-Saiyed/CaptionCaptain",
      extra: {
        label: "Hackathon submission",
        href: "https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-ii/praxis/captioncaptain",
      },
    },
    problem:
      "A single video contains more context than a text-only caption generator can see. The challenge was to extract useful visual moments efficiently and turn them into reliably structured captions with clearly different tones.",
    solution:
      "OpenCV samples and preprocesses key frames, which are supplied to a vision-language model with style-specific instructions and few-shot context. The response is normalized into a strict JSON structure for both interactive use and automated evaluation.",
    architecture: [
      "Video upload / URL",
      "Frame extraction",
      "Key-frame selection",
      "Image preprocessing",
      "Multimodal prompt",
      "JSON validation",
      "Styled captions",
    ],
    decisions: [
      {
        title: "Representative frames over full video",
        detail:
          "Selecting meaningful frames keeps inference practical while retaining enough visual context for the model to understand the scene.",
      },
      {
        title: "Structured output guardrails",
        detail:
          "Pydantic and defensive parsing convert chatty model responses into a predictable schema for the UI and evaluation pipeline.",
      },
      {
        title: "Reproducible evaluation",
        detail:
          "The application includes a containerized batch workflow in addition to the interactive experience.",
      },
    ],
    results: [
      "Multiple built-in and custom writing styles",
      "Interactive video preview and caption workflow",
      "Containerized, reproducible execution",
      "Automated input/output evaluation path",
      "Submitted to the AMD Developer Hackathon: ACT II",
    ],
    limitations: [
      "Output quality depends on the selected model and the visual coverage of sampled frames.",
      "The current workflow targets caption ideation rather than frame-accurate subtitles.",
    ],
  },
  {
    slug: "revcast",
    index: "04",
    title: "RevCast AI — Revenue Forecasting",
    shortTitle: "RevCast AI",
    eyebrow: "Machine learning · Forecasting · Analytics",
    summary:
      "An interactive forecasting and business-intelligence application with monthly, quarterly, and yearly predictions and stakeholder-friendly analysis.",
    description:
      "RevCast AI turns historical transaction data into forecasts, trend views, category and branch performance, customer behavior insights, and interactive visualizations for business users.",
    contribution:
      "I prepared the data, engineered time and business features, trained and evaluated Random Forest regression models, persisted the models, and developed the authenticated Streamlit dashboard.",
    image: "/projects/revcast.png",
    imageAlt: "RevCast AI forecasting product logo",
    accent: "blue",
    tags: ["Internship", "Live", "Classical ML"],
    stack: [
      "Python",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "Random Forest",
      "Plotly",
      "Streamlit",
      "Joblib",
    ],
    links: {
      live: "https://revcast.streamlit.app/",
      source: "https://github.com/Sahal-Saiyed/RevCastAI",
    },
    problem:
      "Historical sales tables are difficult for business stakeholders to interpret directly. The application needed to turn transaction data into forecasts and explainable operational views without requiring users to work in notebooks.",
    solution:
      "The pipeline aggregates revenue at monthly, quarterly, and yearly levels, engineers time-based signals, trains dedicated Random Forest models, and serves predictions alongside interactive Plotly analysis in Streamlit.",
    architecture: [
      "Transaction data",
      "Cleaning",
      "Feature engineering",
      "Time aggregation",
      "Random Forest models",
      "MAE evaluation",
      "Interactive dashboard",
    ],
    decisions: [
      {
        title: "Separate forecasting horizons",
        detail:
          "Dedicated monthly, quarterly, and yearly models keep inputs and outputs understandable for the corresponding business view.",
      },
      {
        title: "Decision-oriented interface",
        detail:
          "Forecasts sit beside trend, category, branch, and customer analysis so stakeholders can interpret predictions in context.",
      },
      {
        title: "Persisted inference",
        detail:
          "Trained models are serialized with Joblib and loaded by the application for responsive prediction.",
      },
    ],
    results: [
      "Monthly, quarterly, and yearly forecasts",
      "MAE-based evaluation workflow",
      "Branch and category performance views",
      "Customer-behavior and time-trend analysis",
      "Deployed interactive Streamlit application",
    ],
    limitations: [
      "The application is a portfolio demonstration based on historical data rather than a live enterprise data feed.",
      "Random Forest predictions are useful for nonlinear patterns but do not provide the interpretability of a dedicated causal model.",
    ],
  },
];

export const experience = [
  {
    period: "May — Jun 2026",
    role: "Freelance AI Engineer",
    organization: "Independent client engagement",
    detail:
      "Built NEEV AI POC with structured LangGraph workflows, role-based approval, project-specific formula overrides, and MongoDB Atlas.",
  },
  {
    period: "Jan — Apr 2025",
    role: "AI/ML Intern",
    organization: "Infolabz IT Services, Ahmedabad",
    detail:
      "Designed and deployed RevCast AI, from sales-data preprocessing and Random Forest forecasting to stakeholder-facing interactive analysis.",
  },
  {
    period: "Jun — Jul 2024",
    role: "Data Analytics Intern",
    organization: "IBM CSRBOX · Remote",
    detail:
      "Analyzed large datasets, improved data accuracy, and contributed to the HydroSense water-potability analysis project.",
  },
];

export const capabilities = [
  {
    number: "01",
    title: "Applied AI",
    description:
      "RAG pipelines, agentic workflows, semantic retrieval, prompt design, structured generation, and multimodal systems.",
    tags: ["LangGraph", "Gemini", "Embeddings", "Vector DBs"],
  },
  {
    number: "02",
    title: "ML & Data",
    description:
      "Feature engineering, regression, classification, forecasting, evaluation, statistical analysis, and visualization.",
    tags: ["Scikit-learn", "PyTorch", "Pandas", "Plotly"],
  },
  {
    number: "03",
    title: "Product Engineering",
    description:
      "APIs, authentication, persistence, streaming interfaces, validation, deployment, and responsive product experiences.",
    tags: ["FastAPI", "React", "TypeScript", "MongoDB"],
  },
];
