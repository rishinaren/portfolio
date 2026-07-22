// Terminal portfolio — Rishi Narendran
const output = document.getElementById("output");
const input = document.getElementById("command-input");
const inputLine = document.getElementById("input-line");
const promptEl = document.getElementById("prompt");

const promptText = "C:\\Users\\guest>";

const resumeUrl =
  "https://drive.google.com/file/d/1pjBGBpr7HmEgBGypFNRuDYdV3TAIpI7C/view?usp=sharing";
const githubUrl = "https://github.com/rishinaren";
const email = "rnarendran3@gatech.edu";
const phoneDisplay = "(678) 756-7718";
const phoneHref = "tel:+16787567718";

const COMMANDS = ["help", "resume", "github", "contact", "phone"];

const introText = "Rishi Narendran — Computer Engineering @ Georgia Tech";

// ---- DOM helpers ----
const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight);

const appendLine = (text = "", variant) => {
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

const appendLink = (prefix, text, href, newTab) => {
  const line = document.createElement("div");
  line.className = "terminal__line";
  if (prefix) {
    line.append(prefix);
  }
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.textContent = text;
  if (newTab) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
  line.appendChild(anchor);
  output.insertBefore(line, inputLine);
  scrollToBottom();
  return line;
};

const echoCommand = (command) => {
  const line = document.createElement("div");
  line.className = "terminal__line";
  const promptSpan = document.createElement("span");
  promptSpan.className = "terminal__prompt";
  promptSpan.textContent = promptText;
  line.appendChild(promptSpan);
  line.appendChild(document.createTextNode(command));
  output.insertBefore(line, inputLine);
  scrollToBottom();
  return line;
};

// ---- commands ----
const printHelp = () => {
  appendLine("Available commands:", "muted");
  appendLine("");
  [
    ["help", "show this list"],
    ["resume", "open my resume"],
    ["github", "open my GitHub profile"],
    ["contact", "show my email address"],
    ["phone", "show my phone number"],
  ].forEach(([name, desc]) => appendLine(`  ${name.padEnd(10)}${desc}`));
  appendLine("");
};

const openExternal = (label, url) => {
  appendLine(`Opening ${label} in a new tab...`);
  appendLine("If it does not open, use the link below:", "muted");
  appendLink("", url, url, true);
  window.open(url, "_blank", "noopener,noreferrer");
};

const runCommand = (raw) => {
  const command = raw.trim();
  echoCommand(command);
  if (!command) {
    return;
  }

  switch (command.toLowerCase()) {
    case "help":
      printHelp();
      break;
    case "resume":
      openExternal("resume", resumeUrl);
      break;
    case "github":
      openExternal("GitHub", githubUrl);
      break;
    case "contact":
      appendLink("Email: ", email, `mailto:${email}`, false);
      break;
    case "phone":
      appendLink("Phone: ", phoneDisplay, phoneHref, false);
      break;
    default:
      appendLine(
        `'${command}' is not recognized. Type 'help' for a list of commands.`,
        "muted"
      );
  }
};

// ---- input handling ----
const history = [];
let historyIndex = 0;

const placeCaretEnd = () => {
  input.focus();
  const range = document.createRange();
  range.selectNodeContents(input);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const setInput = (text) => {
  input.textContent = text;
  placeCaretEnd();
};

const submit = () => {
  const value = input.textContent || "";
  input.textContent = "";
  const trimmed = value.trim();
  if (trimmed) {
    history.push(trimmed);
  }
  historyIndex = history.length;
  runCommand(value);
  input.focus();
  scrollToBottom();
};

const autocomplete = () => {
  const current = (input.textContent || "").trim().toLowerCase();
  if (!current) {
    return;
  }
  const matches = COMMANDS.filter((name) => name.startsWith(current));
  if (matches.length === 1) {
    setInput(matches[0]);
  } else if (matches.length > 1) {
    echoCommand(input.textContent);
    appendLine(matches.join("    "), "muted");
  }
};

input.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "Enter":
      event.preventDefault();
      submit();
      break;
    case "ArrowUp":
      event.preventDefault();
      if (history.length) {
        historyIndex = Math.max(0, historyIndex - 1);
        setInput(history[historyIndex]);
      }
      break;
    case "ArrowDown":
      event.preventDefault();
      if (history.length) {
        historyIndex = Math.min(history.length, historyIndex + 1);
        setInput(historyIndex === history.length ? "" : history[historyIndex]);
      }
      break;
    case "Tab":
      event.preventDefault();
      autocomplete();
      break;
    default:
      break;
  }
});

input.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain").replace(/\s+/g, " ");
  setInput(`${input.textContent || ""}${text}`);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    return;
  }
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) {
    return;
  }
  if (event.target === input) {
    return;
  }
  placeCaretEnd();
});

// ---- boot ----
const bootIntro = () => {
  input.setAttribute("contenteditable", "false");
  inputLine.style.display = "none";
  const line = appendLine("", "accent");
  let index = 0;

  const step = () => {
    line.textContent = introText.slice(0, index);
    index += 1;
    if (index <= introText.length) {
      setTimeout(step, 24);
    } else {
      appendLine("Type 'help' to see the list of commands.", "muted");
      appendLine("");
      inputLine.style.display = "";
      input.setAttribute("contenteditable", "true");
      input.focus();
      scrollToBottom();
    }
  };

  step();
};

promptEl.textContent = promptText;
bootIntro();
