// Rishi Code — terminal core (welcome screen, command registry, menu engine)
(function () {
  "use strict";

  const scrollback = document.getElementById("scrollback");
  const inputArea = document.getElementById("input-area");
  const inputLine = document.getElementById("input-line");
  const cmd = document.getElementById("cmd");
  const ghost = document.getElementById("ghost");
  const promptText = ">";

  const resumeUrl =
    "https://drive.google.com/file/d/1pjBGBpr7HmEgBGypFNRuDYdV3TAIpI7C/view?usp=sharing";
  const githubUrl = "https://github.com/rishinaren";
  const email = "rnarendran3@gatech.edu";
  const phoneDisplay = "(678) 756-7718";
  const phoneHref = "tel:+16787567718";

  const COMMAND_LIST = [
    ["help", "list commands"],
    ["resume", "open my resume"],
    ["github", "open my GitHub"],
    ["contact", "show my email"],
    ["phone", "show my phone"],
    ["/art", "terminal art gallery"],
    ["/game", "play terminal games"],
  ];

  const MASCOT = [
    "     bbbb     ",
    "   bbllllbb   ",
    "  bbbbbbbbbb  ",
    " bbbbbbbbbbbb ",
    " bbddbbbbddbb ",
    " bbbbbbbbbbbb ",
    "  bbbbbbbbbb  ",
    "  bb  bb  bb  ",
  ];

  const commands = {};
  const history = [];
  let hIndex = 0;
  let activeKeyHandler = null;

  const scrollDown = () => window.scrollTo(0, document.body.scrollHeight);

  function print(text, cls) {
    const d = document.createElement("div");
    d.className = "line";
    if (cls) cls.split(" ").forEach((c) => c && d.classList.add(c));
    d.textContent = text == null ? "" : text;
    scrollback.appendChild(d);
    scrollDown();
    return d;
  }

  function append(node) {
    scrollback.appendChild(node);
    scrollDown();
    return node;
  }

  function printLink(prefix, text, href, newTab) {
    const d = document.createElement("div");
    d.className = "line";
    if (prefix) d.append(prefix);
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (newTab) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    d.appendChild(a);
    scrollback.appendChild(d);
    scrollDown();
    return d;
  }

  function echo(command) {
    const d = document.createElement("div");
    d.className = "line echo";
    const p = document.createElement("span");
    p.className = "prompt";
    p.textContent = promptText;
    d.appendChild(p);
    d.appendChild(document.createTextNode(" " + command));
    scrollback.appendChild(d);
    scrollDown();
  }

  // ---- caret / focus ----
  function placeCaretEnd() {
    cmd.focus();
    const range = document.createRange();
    range.selectNodeContents(cmd);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function focusInput() {
    if (activeKeyHandler) return;
    placeCaretEnd();
  }
  function updateGhost() {
    ghost.style.display = cmd.textContent && cmd.textContent.length ? "none" : "";
  }
  function setInput(text) {
    cmd.textContent = text;
    placeCaretEnd();
    updateGhost();
  }

  // ---- takeover mode ----
  let currentModeEl = null;
  function enterMode(el, keyHandler) {
    inputArea.classList.add("hidden");
    cmd.blur();
    if (el) append(el);
    currentModeEl = el || null;
    activeKeyHandler = keyHandler;
    scrollDown();
  }
  function exitMode(keep) {
    activeKeyHandler = null;
    if (!keep && currentModeEl && currentModeEl.parentNode)
      currentModeEl.parentNode.removeChild(currentModeEl);
    currentModeEl = null;
    inputArea.classList.remove("hidden");
    placeCaretEnd();
    updateGhost();
    scrollDown();
  }

  // ---- menu engine (Claude Code /model style) ----
  function openMenu(cfg) {
    const options = cfg.options;
    let idx = cfg.start || 0;

    const wrap = document.createElement("div");
    wrap.className = "menu";
    const title = document.createElement("div");
    title.className = "menu__title";
    title.textContent = cfg.title;
    wrap.appendChild(title);

    const rows = options.map((opt, i) => {
      const row = document.createElement("div");
      row.className = "menu__opt";
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = i + 1 + ".";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = opt.label;
      const note = document.createElement("span");
      note.className = "note";
      note.textContent = opt.note || "";
      row.append(arrow, num, label, note);
      row.addEventListener("mousemove", () => {
        if (idx !== i) {
          idx = i;
          render();
        }
      });
      row.addEventListener("click", () => {
        idx = i;
        render();
        select();
      });
      wrap.appendChild(row);
      return { row, arrow };
    });

    const hint = document.createElement("div");
    hint.className = "menu__hint";
    hint.textContent = cfg.hint || "↑/↓ move · Enter select · Esc cancel";
    wrap.appendChild(hint);

    function render() {
      rows.forEach((r, i) => {
        r.row.classList.toggle("sel", i === idx);
        r.arrow.textContent = i === idx ? "▸" : " ";
      });
    }
    function collapse(text, cls) {
      wrap.innerHTML = "";
      const l = document.createElement("div");
      l.className = "line " + (cls || "line--dim");
      l.textContent = text;
      wrap.appendChild(l);
    }
    function select() {
      const chosen = options[idx];
      collapse(cfg.title.replace(/[:?]\s*$/, "") + " → " + chosen.label);
      exitMode(true);
      cfg.onSelect(chosen, idx);
    }
    function cancel() {
      collapse(cfg.title.replace(/[:?]\s*$/, "") + " (cancelled)");
      exitMode(true);
      if (cfg.onCancel) cfg.onCancel();
    }
    function key(e) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        idx = (idx + 1) % options.length;
        render();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        idx = (idx - 1 + options.length) % options.length;
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        select();
      } else if (e.key === "Escape" || e.key === "q") {
        e.preventDefault();
        cancel();
      } else if (/^[1-9]$/.test(e.key)) {
        const n = +e.key - 1;
        if (n < options.length) {
          e.preventDefault();
          idx = n;
          render();
          select();
        }
      }
    }

    render();
    enterMode(wrap, key);
  }

  // ---- commands ----
  function registerCommand(name, handler) {
    commands[name.toLowerCase()] = handler;
  }

  function printHelp() {
    print("Terminal Commands", "line--accent");
    print("");
    COMMAND_LIST.forEach(([c, d]) => print("  " + c.padEnd(12) + d));
    print("  " + "clear".padEnd(12) + "clear the screen", "line--muted");
    print("");
  }

  function openExternal(label, url) {
    print("Opening " + label + " in a new tab...");
    printLink("", url, url, true);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  registerCommand("help", printHelp);
  registerCommand("resume", () => openExternal("resume", resumeUrl));
  registerCommand("github", () => openExternal("GitHub", githubUrl));
  registerCommand("contact", () =>
    printLink("Email: ", email, "mailto:" + email, false)
  );
  registerCommand("phone", () =>
    printLink("Phone: ", phoneDisplay, phoneHref, false)
  );
  registerCommand("clear", () => {
    scrollback.innerHTML = "";
  });
  registerCommand("welcome", renderWelcome);

  function runCommand(raw) {
    const input = raw.trim();
    echo(input);
    if (!input) return;
    let name = input.split(/\s+/)[0].toLowerCase();
    if (name[0] === "/") name = name.slice(1);
    const args = input.split(/\s+/).slice(1);
    const handler = commands[name];
    if (handler) handler(args);
    else
      print(
        "'" + input + "' is not recognized. Type 'help' for commands.",
        "line--muted"
      );
  }

  // ---- welcome screen ----
  function buildMascot() {
    const wrap = document.createElement("div");
    wrap.className = "mascot";
    MASCOT.forEach((r) => {
      const row = document.createElement("div");
      row.className = "mascot__row";
      for (const ch of r) {
        const p = document.createElement("span");
        p.className =
          "px" +
          (ch === "b" ? " px--b" : ch === "l" ? " px--l" : ch === "d" ? " px--d" : "");
        row.appendChild(p);
      }
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderWelcome() {
    const box = document.createElement("div");
    box.className = "welcome";

    const title = document.createElement("div");
    title.className = "welcome__title";
    title.textContent = "Rishi Code v1.0";
    box.appendChild(title);

    const left = document.createElement("div");
    left.className = "welcome__left";
    const hi = document.createElement("div");
    hi.className = "welcome__hi";
    hi.textContent = "Hi Viewer!";
    left.appendChild(hi);
    left.appendChild(buildMascot());
    const footer = document.createElement("div");
    footer.className = "welcome__footer";
    const f1 = document.createElement("div");
    f1.textContent = "Computer Engineering · Georgia Tech";
    const f2 = document.createElement("div");
    f2.className = "path";
    f2.textContent = "~\\Rishi Code";
    footer.append(f1, f2);
    left.appendChild(footer);

    const right = document.createElement("div");
    right.className = "welcome__right";
    const h = document.createElement("div");
    h.className = "welcome__h";
    h.textContent = "Terminal Commands";
    right.appendChild(h);
    const grid = document.createElement("div");
    grid.className = "welcome__cmds";
    COMMAND_LIST.forEach(([c, d]) => {
      const cc = document.createElement("span");
      cc.className = "welcome__cmd";
      cc.textContent = c;
      const dd = document.createElement("span");
      dd.className = "welcome__desc";
      dd.textContent = d;
      grid.append(cc, dd);
    });
    right.appendChild(grid);

    box.append(left, right);
    append(box);
    syncWidth();
  }

  // keep the input box the same width as the welcome box
  function syncWidth() {
    const w = scrollback.querySelector(".welcome");
    if (w) inputArea.style.width = w.getBoundingClientRect().width + "px";
  }

  // ---- global input handling ----
  document.addEventListener("keydown", (e) => {
    if (activeKeyHandler) {
      activeKeyHandler(e);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        hIndex = Math.max(0, hIndex - 1);
        setInput(history[hIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length) {
        hIndex = Math.min(history.length, hIndex + 1);
        setInput(hIndex === history.length ? "" : history[hIndex]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    }
  });

  cmd.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
    setInput((cmd.textContent || "") + text);
  });

  cmd.addEventListener("input", updateGhost);

  document.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    if (e.target.closest(".menu, .game, .stage")) return;
    if (activeKeyHandler) return;
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    if (e.target === cmd) return;
    placeCaretEnd();
  });

  function submit() {
    const val = cmd.textContent || "";
    cmd.textContent = "";
    const t = val.trim();
    if (t) history.push(t);
    hIndex = history.length;
    runCommand(val);
    focusInput();
    updateGhost();
  }

  function complete() {
    const cur = (cmd.textContent || "").trim();
    if (!cur) return;
    const slash = cur[0] === "/";
    const bare = slash ? cur.slice(1) : cur;
    const names = Object.keys(commands).filter((n) => n.startsWith(bare.toLowerCase()));
    if (names.length === 1) setInput((slash ? "/" : "") + names[0]);
  }

  // ---- expose API for skills (art.js, games.js) ----
  window.RC = {
    print,
    printLink,
    append,
    echo,
    enterMode,
    exitMode,
    openMenu,
    registerCommand,
    focusInput,
    scrollDown,
  };

  // ---- boot ----
  renderWelcome();
  placeCaretEnd();
  updateGhost();
  window.addEventListener("resize", syncWidth);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncWidth);
})();
