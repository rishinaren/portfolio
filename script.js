const output = document.getElementById("output");
const input = document.getElementById("command-input");
const inputLine = document.getElementById("input-line");
const promptEl = document.getElementById("prompt");

const promptText = "C:\\Users\\guest>";

const resumeUrl =
  "https://drive.google.com/file/d/1CbptF0EKWF35iLluC2RKUCbOoD_UD56Z/view?usp=sharing";
const githubUrl = "https://github.com/rishinaren";

const educationLines = [
  "Education",
  "Georgia Institute of Technology",
  "Graduating Jan. 2027",
  "B.S. Computer Engineering; Concentrations: Signal/Information Processing & AI, Cybersecurity",
  "Atlanta, GA",
  "Relevant Coursework: Object-Oriented Programming, Data Structures & Algorithms, Advanced Programming Techniques  (C++), Discrete Math for CS, Computer Networks/Communications, Digital Signal Processing",
];

const skillLines = [
  "Technical Skills",
  "Languages: Python, Java, C/C++, JavaScript/TypeScript, SQL",
  "Web & Frontend: Next.js, React, Tailwind CSS, Vite",
  "AI/ML: Pytorch,NumPy, scikit, LLMs (Claude,OpenAI)",
  "Databases/Backend: PostgreSQL, SQLite, Prisma ORM, REST APIs, Supabase, Next.js API Routes, MongoDB, Redis, FastAPI, Flask",
  "Platforms/Tools: Vercel, Supabase, Git/GitHub, Google APIs, OSM Overpass, Raspberry Pi , Docker, Docker Compose, Apache Kafka, AWS Lambda, API Gateway, DynamoDB, AWS S3, AWS CloudWatch, Firebase Auth",
];

const projects = [
  {
    title:
      "Ask-Menu | Next.js 14, TypeScript, Tailwind, SQLite/PostgreSQL+pgvector, Next API Routes, Docker, | https://github.com/rishinaren/Ask-Menu.git",
    bullets: [
      "Built an AI Q&A app with Next.js 14, TypeScript, and Tailwind through user image uploads (drag-and-drop/clipboard paste) ; ran browser-side OCR via Tesseract.js for efficient client-side image processing.",
      "Implemented a RAG pipeline: embeddings of menu/user questions are created, vector similarity search finds most relevant menu chunks, and final context is fed to Claude to answer price comparison/diet/ingredient based queries.",
    ],
  },
  {
    title:
      "ATLVeg | Next.js 14, Tailwind, Prisma, Supabase Auth, PostgreSQL/SQLite, Places/Maps API, Overpass | https://github.com/rishinaren/ATLVeg",
    bullets: [
      "Built a full-stack restaurant finder with Next.js, TypeScript, and Tailwind, aggregating Google Places and OSM Overpass data into a Prisma and PostgreSQL backend with veg scoring/distance/rating/cuisine filters.",
      "Implemented email/password auth with Supabase Auth and a Prisma/PostgreSQL schema for users, favorites, search history; integrated map embeds, directions links, and photo endpoints using Google APIs",
    ],
  },
  {
    title:
      "TechTrend | Apache Kafka, Python, OpenAI GPT-4o, MongoDB, Flask, Docker Compose | https://github.com/rishinaren/TechTrend",
    bullets: [
      "Implemented an analytics pipeline that ingests API news items, pushes them through Kafka, and uses GPT-4o to generate positive/negative labels before storing results in MongoDB.",
      "Designed MongoDB pipelines for time-series data/topic-sorting, ran all services (Kafka, processors, MongoDB, API)  via Docker Compose, and fed backend data to React Dashboard.",
    ],
  },
  {
    title:
      "BudgetBuddy | AWS Lambda, API Gateway, DynamoDB, Firebase, S3, React 18, Tailwind | https://github.com/rishinaren/BudgetBuddy",
    bullets: [
      "Built a serverless expense tracker where API Gateway routes expenses and reports to AWS Lambda functions that handle CRUD logic and store user data in DynamoDB tables.",
      "Integrated Firebase Auth for secure sign-in, S3 presigned uploads for receipt images, and CloudWatch Event triggers that invoke Lambdas to send weekly budget summaries.",
    ],
  },
  {
    title:
      "E-Shop | React, Tailwind, PostgreSQL, MongoDB, Redis, Kafka, Docker JWT | https://github.com/rishinaren/E-shop",
    bullets: [
      "Built a cloud-native e-commerce backend as FastAPI microservices (user, product, cart, order, payment), each packaged in Docker and communicating via REST plus Kafka events when orders are placed.",
      "Used PostgreSQL for user/order/payment records, MongoDB for product catalog, and Redis for cart sessions, routed through an API Gateway with JWT auth so services can scale/fail independently.",
    ],
  },
];

const workLines = [
  "Work Experience",
  "MATRIX Lab — Georgia Tech",
  "August 2025 -- Present",
  "Researcher/Software Engineer",
  "Atlanta, GA",
  "- Built an embedded PPE eye-protection compliance system for Georgia Tech Engineering Labs on Raspberry Pi using Ultralytics YOLO for localization and ResNet18 for goggles / eyeglasses / none classification.",
  "- Optimizing edge inference with OpenCV, PiCamera2/libcamera, and CPU-only execution to meet real-time constraints, delivered human-centered feedback via NeoPixel LED alerts and on-screen annotations",
  "- Delivering reproducible ML operations: automated crop generation for training, transfer-learned the classifier with augmentation, and maintained versioned PyTorch models",
  "",
  "Networks & Machine Learning Lab — Georgia Tech",
  "August 2025 -- Present",
  "Research Intern",
  "Atlanta, GA",
  "- Applying  large-scale data analytics (via API data processing) & spatio-termporal modeling to study big-tech data center sustainability efforts.",
];

const introText =
  "Hi, I'm Rishi Narendran, a Computer Engineering Student at Georgia Tech. Type help to get started.";

const scrollToBottom = () => {
  window.scrollTo(0, document.body.scrollHeight);
};

const appendLine = (text, variant) => {
  const line = document.createElement("div");
  line.className = "terminal__line";
  if (variant) {
    line.classList.add(`terminal__line--${variant}`);
  }
  line.textContent = text;
  output.insertBefore(line, inputLine);
  scrollToBottom();
  return line;
};

const appendPromptLine = (command) => {
  const line = document.createElement("div");
  line.className = "terminal__line";
  const promptSpan = document.createElement("span");
  promptSpan.className = "terminal__prompt";
  promptSpan.textContent = `${promptText} `;
  const commandSpan = document.createElement("span");
  commandSpan.textContent = command;
  line.appendChild(promptSpan);
  line.appendChild(commandSpan);
  output.insertBefore(line, inputLine);
  scrollToBottom();
  return line;
};

const printLines = (lines, variant) => {
  lines.forEach((line) => appendLine(line, variant));
};

const printProjects = () => {
  appendLine("Projects", "muted");
  appendLine("");
  projects.forEach((project, index) => {
    appendLine(project.title);
    project.bullets.forEach((bullet) => appendLine(`- ${bullet}`));
    if (index < projects.length - 1) {
      appendLine("");
    }
  });
};

const printHelp = () => {
  appendLine("Commands", "muted");
  printLines(
    [
      "help - show this list",
      "resume - open resume PDF",
      "github - open GitHub profile",
      "email - show contact email",
      "projects - view projects",
      "work - view work experience",
      "education - view education",
      "skills - view technical skills",
    ],
    "muted"
  );
};

const runCommand = (rawInput) => {
  const command = rawInput.trim();
  if (!command) {
    return;
  }

  appendPromptLine(command);

  const normalized = command.toLowerCase();

  if (normalized === "help") {
    printHelp();
    return;
  }

  if (normalized === "resume") {
    appendLine("Redirecting to resume...");
    setTimeout(() => {
      window.location.href = resumeUrl;
    }, 300);
    return;
  }

  if (normalized === "github") {
    appendLine("Redirecting to GitHub...");
    setTimeout(() => {
      window.location.href = githubUrl;
    }, 300);
    return;
  }

  if (normalized === "email") {
    appendLine("rnarendran3@gatech.edu");
    return;
  }

  if (normalized === "projects") {
    printProjects();
    return;
  }

  if (normalized === "work") {
    printLines(workLines);
    return;
  }

  if (normalized === "education") {
    printLines(educationLines);
    return;
  }

  if (normalized === "skills" || normalized === "technical skills") {
    printLines(skillLines);
    return;
  }

  appendLine(`Command not found: ${command}. Type help.`, "muted");
};

const typeIntro = () => {
  input.setAttribute("contenteditable", "false");
  const introLine = appendLine("", "accent");
  let index = 0;

  const step = () => {
    introLine.textContent = introText.slice(0, index);
    index += 1;
    if (index <= introText.length) {
      setTimeout(step, 22);
    } else {
      input.setAttribute("contenteditable", "true");
      input.focus();
      scrollToBottom();
    }
  };

  step();
};

const handleCommand = () => {
  const value = input.textContent || "";
  input.textContent = "";
  runCommand(value);
  input.focus();
  scrollToBottom();
};

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleCommand();
  }
});

input.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});

document.addEventListener("click", () => {
  input.focus();
});

promptEl.textContent = promptText;
typeIntro();
