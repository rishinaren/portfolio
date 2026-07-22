// Rishi Code — /game skill: Dino runner, Chess (+ bot), playable Rubik's Cube
// Ports of the linked repos: termrex, chess-tui, ratty's rubiks_cube.
(function () {
  "use strict";

  // ======================================================================
  // DINO RUN  (port of github.com/SATYADAHAL/termrex)
  // ======================================================================
  function dino() {
    const wrap = document.createElement("div");
    wrap.className = "game";
    const c = document.createElement("canvas");
    c.width = 660;
    c.height = 190;
    wrap.appendChild(c);
    const bar = document.createElement("div");
    bar.className = "game__bar";
    bar.textContent = "Space / ↑ jump   ·   ↓ duck   ·   q quits";
    wrap.appendChild(bar);
    const ctx = c.getContext("2d");

    const groundY = 150;
    let d, obstacles, speed, score, hi, spawnIn, over, raf, last;

    function reset() {
      d = { x: 60, y: groundY, vy: 0, onGround: true, duck: false };
      obstacles = [];
      speed = 5;
      score = 0;
      spawnIn = 60;
      over = false;
    }
    function box() {
      const h = d.duck && d.onGround ? 22 : 42;
      const w = d.duck && d.onGround ? 50 : 34;
      return { x: d.x, y: d.y - h, w: w, h: h };
    }
    function spawn() {
      const canBird = score > 180 && Math.random() < 0.28;
      if (canBird) {
        const alt = Math.random() < 0.5 ? 34 : 62;
        obstacles.push({ type: "bird", x: c.width, y: groundY - alt, w: 34, h: 22, f: 0 });
      } else {
        const n = 1 + Math.floor(Math.random() * 3);
        obstacles.push({ type: "cactus", x: c.width, y: groundY, w: 12 * n + 4, h: 32 });
      }
      spawnIn = Math.max(28, 70 - speed * 3 + Math.random() * 40);
    }
    function hit(a, b) {
      return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
      );
    }
    function update() {
      speed = 5 + score / 220;
      if (!d.onGround) {
        d.vy += 0.9;
        d.y += d.vy;
        if (d.y >= groundY) {
          d.y = groundY;
          d.vy = 0;
          d.onGround = true;
        }
      }
      for (const o of obstacles) {
        o.x -= speed;
        if (o.type === "bird") o.f += 0.2;
      }
      obstacles = obstacles.filter((o) => o.x + o.w > -10);
      if (--spawnIn <= 0) spawn();
      score += 0.2 * (speed / 5) + 0.2;
      const db = box();
      for (const o of obstacles) {
        const ob =
          o.type === "bird"
            ? { x: o.x + 4, y: o.y, w: o.w - 8, h: o.h }
            : { x: o.x + 3, y: o.y - o.h, w: o.w - 6, h: o.h };
        if (hit(db, ob)) {
          over = true;
          hi = Math.max(hi || 0, Math.floor(score));
        }
      }
    }
    function draw() {
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#6f6358";
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(c.width, groundY + 2);
      ctx.stroke();
      ctx.fillStyle = "#4a4139";
      for (let x = -((Math.floor(score * (speed / 5)) * 2) % 40); x < c.width; x += 40)
        ctx.fillRect(x, groundY + 6, 14, 2);
      const b = box();
      ctx.fillStyle = "#e4d7cc";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(b.x + b.w - (d.duck ? 12 : 9), b.y + 6, 4, 4);
      ctx.fillStyle = "#e4d7cc";
      if (!d.duck) {
        ctx.fillRect(b.x + b.w, b.y + 8, 8, 12);
        ctx.fillRect(b.x + 4, b.y + b.h, 8, 6);
        ctx.fillRect(b.x + b.w - 14, b.y + b.h, 8, 6);
      }
      for (const o of obstacles) {
        if (o.type === "cactus") {
          ctx.fillStyle = "#6cc07a";
          ctx.fillRect(o.x, o.y - o.h, o.w, o.h);
          ctx.fillRect(o.x - 5, o.y - o.h + 8, 5, 12);
          ctx.fillRect(o.x + o.w, o.y - o.h + 6, 5, 12);
        } else {
          ctx.fillStyle = "#d97757";
          const up = Math.floor(o.f) % 2 === 0;
          ctx.fillRect(o.x + 6, o.y + 6, 22, 6);
          ctx.fillRect(o.x, o.y + (up ? 0 : 12), 12, 6);
          ctx.fillRect(o.x + 24, o.y + 8, 10, 4);
        }
      }
      ctx.fillStyle = "#9a8b7e";
      ctx.font = "16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        (hi ? "HI " + String(hi).padStart(5, "0") + "  " : "") +
          String(Math.floor(score)).padStart(5, "0"),
        c.width - 14,
        26
      );
      ctx.textAlign = "left";
      if (over) {
        ctx.fillStyle = "#e4d7cc";
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.fillText("G A M E   O V E R", c.width / 2, 80);
        ctx.font = "14px monospace";
        ctx.fillStyle = "#9a8b7e";
        ctx.fillText("Enter / Space to restart  ·  q to quit", c.width / 2, 104);
        ctx.textAlign = "left";
      }
    }
    function loop(ts) {
      if (!last) last = ts;
      last = ts;
      if (!over) update();
      draw();
      raf = requestAnimationFrame(loop);
    }
    function jump() {
      if (d.onGround) {
        d.vy = -13.5;
        d.onGround = false;
      }
    }
    function keyup(e) {
      if (e.key === "ArrowDown") d.duck = false;
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("keyup", keyup);
      RC.exitMode();
    }

    reset();
    document.addEventListener("keyup", keyup);
    RC.enterMode(wrap, (e) => {
      if (e.key === "q" || e.key === "Escape") {
        e.preventDefault();
        stop();
        return;
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        if (over) reset();
        else jump();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        d.duck = true;
      }
    });
    raf = requestAnimationFrame(loop);
  }

  // ======================================================================
  // CHESS  (port of github.com/thomas-mauran/chess-tui) — 2-player or vs bot
  // ======================================================================
  function chess() {
    RC.openMenu({
      title: "Chess — choose mode",
      options: [
        { label: "Vs Computer", note: "— you play White", ai: "b" },
        { label: "2 Player", note: "— local hot-seat", ai: null },
      ],
      onSelect: (opt) => startChess(opt.ai),
      onCancel: () => RC.print("game closed.", "line--dim"),
    });
  }

  function startChess(aiColor) {
    const GLYPH = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
    const wrap = document.createElement("div");
    wrap.className = "game";
    const boardEl = document.createElement("div");
    boardEl.className = "chess";
    const status = document.createElement("div");
    status.className = "chess-status";
    const bar = document.createElement("div");
    bar.className = "game__bar";
    bar.textContent =
      (aiColor ? "you (White) vs Computer  ·  " : "") +
      "click a piece then a square  ·  arrows + space  ·  q quits";
    wrap.append(boardEl, status, bar);

    const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    let board, turn, rights, ep, cursor, sel, legal, done, thinking;

    function parse() {
      board = [];
      const rows = start.split("/");
      for (let r = 0; r < 8; r++) {
        const row = [];
        for (const ch of rows[r]) {
          if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) row.push(null);
          else row.push({ t: ch.toLowerCase(), c: ch === ch.toLowerCase() ? "b" : "w" });
        }
        board.push(row);
      }
      turn = "w";
      rights = { wK: true, wQ: true, bK: true, bQ: true };
      ep = null;
      cursor = { r: 6, c: 4 };
      sel = null;
      legal = [];
      done = false;
      thinking = false;
    }
    const inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const opp = (c) => (c === "w" ? "b" : "w");
    const clone = (b) => b.map((row) => row.map((p) => (p ? { t: p.t, c: p.c } : null)));

    function attacked(b, r, c, by) {
      const pd = by === "w" ? 1 : -1;
      for (const dc of [-1, 1]) {
        const pr = r + pd, pc = c + dc;
        if (inb(pr, pc)) {
          const p = b[pr][pc];
          if (p && p.c === by && p.t === "p") return true;
        }
      }
      const kn = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of kn) {
        const p = inb(r + dr, c + dc) && b[r + dr][c + dc];
        if (p && p.c === by && p.t === "n") return true;
      }
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
        let rr = r + dr, cc = c + dc;
        while (inb(rr, cc)) {
          const p = b[rr][cc];
          if (p) { if (p.c === by && (p.t === "b" || p.t === "q")) return true; break; }
          rr += dr; cc += dc;
        }
      }
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        let rr = r + dr, cc = c + dc;
        while (inb(rr, cc)) {
          const p = b[rr][cc];
          if (p) { if (p.c === by && (p.t === "r" || p.t === "q")) return true; break; }
          rr += dr; cc += dc;
        }
      }
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const p = inb(r + dr, c + dc) && b[r + dr][c + dc];
        if (p && p.c === by && p.t === "k") return true;
      }
      return false;
    }
    function kingPos(b, col) {
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (p && p.c === col && p.t === "k") return { r, c };
        }
      return null;
    }
    function inCheck(b, col) {
      const k = kingPos(b, col);
      return k ? attacked(b, k.r, k.c, opp(col)) : false;
    }

    function pseudo(b, r, c, epSq, rts) {
      const p = b[r][c];
      if (!p) return [];
      const out = [];
      const add = (tr, tc, extra) => out.push(Object.assign({ fr: r, fc: c, tr, tc }, extra));
      const dir = p.c === "w" ? -1 : 1;
      if (p.t === "p") {
        const startRow = p.c === "w" ? 6 : 1;
        if (inb(r + dir, c) && !b[r + dir][c]) {
          add(r + dir, c, {});
          if (r === startRow && !b[r + 2 * dir][c]) add(r + 2 * dir, c, { dbl: true });
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir, tc = c + dc;
          if (!inb(tr, tc)) continue;
          const tp = b[tr][tc];
          if (tp && tp.c !== p.c) add(tr, tc, {});
          else if (epSq && epSq.r === tr && epSq.c === tc) add(tr, tc, { ep: true });
        }
      } else if (p.t === "n") {
        for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
          const tr = r + dr, tc = c + dc;
          if (inb(tr, tc) && (!b[tr][tc] || b[tr][tc].c !== p.c)) add(tr, tc, {});
        }
      } else if (p.t === "k") {
        for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
          const tr = r + dr, tc = c + dc;
          if (inb(tr, tc) && (!b[tr][tc] || b[tr][tc].c !== p.c)) add(tr, tc, {});
        }
        const homeRow = p.c === "w" ? 7 : 0;
        if (r === homeRow && c === 4 && !attacked(b, r, c, opp(p.c))) {
          const kSide = p.c === "w" ? rts.wK : rts.bK;
          const qSide = p.c === "w" ? rts.wQ : rts.bQ;
          if (kSide && !b[homeRow][5] && !b[homeRow][6] &&
              b[homeRow][7] && b[homeRow][7].t === "r" &&
              !attacked(b, homeRow, 5, opp(p.c)) && !attacked(b, homeRow, 6, opp(p.c)))
            add(homeRow, 6, { castle: "K" });
          if (qSide && !b[homeRow][1] && !b[homeRow][2] && !b[homeRow][3] &&
              b[homeRow][0] && b[homeRow][0].t === "r" &&
              !attacked(b, homeRow, 3, opp(p.c)) && !attacked(b, homeRow, 2, opp(p.c)))
            add(homeRow, 2, { castle: "Q" });
        }
      } else {
        const dirs =
          p.t === "b" ? [[-1,-1],[-1,1],[1,-1],[1,1]]
          : p.t === "r" ? [[-1,0],[1,0],[0,-1],[0,1]]
          : [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of dirs) {
          let tr = r + dr, tc = c + dc;
          while (inb(tr, tc)) {
            if (!b[tr][tc]) add(tr, tc, {});
            else { if (b[tr][tc].c !== p.c) add(tr, tc, {}); break; }
            tr += dr; tc += dc;
          }
        }
      }
      return out;
    }

    function apply(b, m, st) {
      const p = b[m.fr][m.fc];
      st.ep = null;
      if (m.ep) b[m.fr][m.tc] = null;
      b[m.tr][m.tc] = p;
      b[m.fr][m.fc] = null;
      if (m.dbl) st.ep = { r: (m.fr + m.tr) / 2, c: m.fc };
      if (m.castle === "K") { b[m.tr][5] = b[m.tr][7]; b[m.tr][7] = null; }
      if (m.castle === "Q") { b[m.tr][3] = b[m.tr][0]; b[m.tr][0] = null; }
      if (p.t === "p" && (m.tr === 0 || m.tr === 7)) p.t = "q";
      if (p.t === "k") {
        if (p.c === "w") { st.rights.wK = st.rights.wQ = false; }
        else { st.rights.bK = st.rights.bQ = false; }
      }
      const touch = (r, c) => {
        if (r === 7 && c === 0) st.rights.wQ = false;
        if (r === 7 && c === 7) st.rights.wK = false;
        if (r === 0 && c === 0) st.rights.bQ = false;
        if (r === 0 && c === 7) st.rights.bK = false;
      };
      touch(m.fr, m.fc);
      touch(m.tr, m.tc);
    }

    function legalFrom(r, c) {
      const p = board[r][c];
      if (!p || p.c !== turn) return [];
      return pseudo(board, r, c, ep, rights).filter((m) => {
        const b2 = clone(board);
        const st = { ep: ep, rights: Object.assign({}, rights) };
        apply(b2, m, st);
        return !inCheck(b2, p.c);
      });
    }
    function anyLegal(col) {
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          if (board[r][c] && board[r][c].c === col && legalFrom(r, c).length) return true;
      return false;
    }

    // ---- simple bot: minimax + alpha-beta ----
    const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    function evalBoard(b) {
      let s = 0;
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (!p) continue;
          let v = VAL[p.t];
          if (p.t === "p" || p.t === "n" || p.t === "b") {
            v += (3.5 - Math.max(Math.abs(3.5 - r), Math.abs(3.5 - c))) * 6;
          }
          if (p.t === "p") v += (p.c === "w" ? 6 - r : r - 1) * 3;
          s += p.c === "w" ? v : -v;
        }
      return s;
    }
    function genLegal(b, col, st) {
      const out = [];
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
          const p = b[r][c];
          if (!p || p.c !== col) continue;
          for (const m of pseudo(b, r, c, st.ep, st.rights)) {
            const b2 = clone(b);
            const st2 = { ep: st.ep, rights: Object.assign({}, st.rights) };
            apply(b2, m, st2);
            if (!inCheck(b2, col)) {
              m.cap = b[m.tr][m.tc] ? VAL[b[m.tr][m.tc].t] : 0;
              out.push(m);
            }
          }
        }
      out.sort((a, z) => z.cap - a.cap); // captures first → better pruning
      return out;
    }
    function search(b, col, st, depth, alpha, beta) {
      if (depth === 0) return evalBoard(b);
      const moves = genLegal(b, col, st);
      if (!moves.length) return inCheck(b, col) ? (col === "w" ? -1e6 - depth : 1e6 + depth) : 0;
      if (col === "w") {
        let best = -Infinity;
        for (const m of moves) {
          const b2 = clone(b), st2 = { ep: st.ep, rights: Object.assign({}, st.rights) };
          apply(b2, m, st2);
          best = Math.max(best, search(b2, "b", st2, depth - 1, alpha, beta));
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
        return best;
      }
      let best = Infinity;
      for (const m of moves) {
        const b2 = clone(b), st2 = { ep: st.ep, rights: Object.assign({}, st.rights) };
        apply(b2, m, st2);
        best = Math.min(best, search(b2, "w", st2, depth - 1, alpha, beta));
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
    const DEPTH = 3;
    function aiMove() {
      const st = { ep: ep, rights: Object.assign({}, rights) };
      const moves = genLegal(board, aiColor, st);
      if (!moves.length) { setStatus(); render(); return; }
      let best = null, bestVal = aiColor === "w" ? -Infinity : Infinity;
      for (const m of moves) {
        const b2 = clone(board), st2 = { ep: ep, rights: Object.assign({}, rights) };
        apply(b2, m, st2);
        const val = search(b2, opp(aiColor), st2, DEPTH - 1, -Infinity, Infinity);
        const better = aiColor === "w" ? val > bestVal : val < bestVal;
        if (better || (val === bestVal && Math.random() < 0.25)) { bestVal = val; best = m; }
      }
      move(best || moves[0]);
    }

    function setStatus() {
      const nm = turn === "w" ? "White" : "Black";
      if (done) return;
      const check = inCheck(board, turn);
      if (!anyLegal(turn)) {
        done = true;
        status.textContent = check
          ? "Checkmate — " + (turn === "w" ? "Black" : "White") + " wins!  (type /game to play again)"
          : "Stalemate — draw.  (type /game to play again)";
        status.style.color = "#f0a882";
        return;
      }
      status.textContent = nm + " to move" + (check ? "  ·  Check!" : "");
      status.style.color = check ? "#f0a882" : "#e4d7cc";
    }

    function move(m) {
      const st = { ep: ep, rights: rights };
      apply(board, m, st);
      ep = st.ep;
      rights = st.rights;
      turn = opp(turn);
      sel = null;
      legal = [];
      setStatus();
      render();
      if (aiColor && turn === aiColor && !done) {
        thinking = true;
        status.textContent = "Computer is thinking…";
        status.style.color = "#9a8b7e";
        setTimeout(() => {
          try { aiMove(); } finally { thinking = false; }
        }, 220);
      }
    }

    function activate(r, c) {
      if (done || thinking || (aiColor && turn === aiColor)) return;
      if (sel) {
        const m = legal.find((x) => x.tr === r && x.tc === c);
        if (m) { move(m); return; }
      }
      const p = board[r][c];
      if (p && p.c === turn) { sel = { r, c }; legal = legalFrom(r, c); }
      else { sel = null; legal = []; }
      render();
    }

    function render() {
      boardEl.innerHTML = "";
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const sq = document.createElement("div");
          sq.className = "sq " + ((r + c) % 2 ? "darksq" : "lightsq");
          if (sel && sel.r === r && sel.c === c) sq.classList.add("sel");
          if (cursor.r === r && cursor.c === c) sq.classList.add("cursor");
          const mv = legal.find((x) => x.tr === r && x.tc === c);
          if (mv) sq.classList.add(board[r][c] || mv.ep ? "capture" : "move");
          const p = board[r][c];
          if (p) {
            const s = document.createElement("span");
            s.className = "pc " + p.c;
            s.textContent = GLYPH[p.t];
            sq.appendChild(s);
          }
          sq.addEventListener("click", () => { cursor = { r, c }; activate(r, c); });
          boardEl.appendChild(sq);
        }
      }
    }

    function stop() { RC.exitMode(); }

    parse();
    RC.enterMode(wrap, (e) => {
      if (e.key === "q" || e.key === "Escape") { e.preventDefault(); stop(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); cursor.r = Math.max(0, cursor.r - 1); render(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); cursor.r = Math.min(7, cursor.r + 1); render(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); cursor.c = Math.max(0, cursor.c - 1); render(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); cursor.c = Math.min(7, cursor.c + 1); render(); }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); activate(cursor.r, cursor.c); }
    });
    setStatus();
    render();
  }

  // ======================================================================
  // RUBIK'S CUBE  (playable — port of ratty's rubiks_cube.rs colors/angles)
  // scramble → timer → keyboard face turns → solve
  // ======================================================================
  function cube() {
    const wrap = document.createElement("div");
    wrap.className = "game";
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 300;
    wrap.appendChild(c);
    const status = document.createElement("div");
    status.className = "chess-status";
    const bar = document.createElement("div");
    bar.className = "game__bar";
    bar.textContent =
      "U D L R F B turn faces  ·  Shift reverses  ·  arrows orbit  ·  n new  ·  q quits";
    wrap.append(status, bar);
    const ctx = c.getContext("2d");

    // ratty palette + face normals
    const COL = {
      U: "rgb(242,242,242)", D: "rgb(255,213,0)", F: "rgb(0,155,72)",
      B: "rgb(0,70,173)", R: "rgb(183,18,52)", L: "rgb(255,88,0)",
    };
    const FN = {
      U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1],
      B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0],
    };
    const MOVES = {
      U: { axis: "y", sign: 1, dir: -1 }, D: { axis: "y", sign: -1, dir: 1 },
      R: { axis: "x", sign: 1, dir: -1 }, L: { axis: "x", sign: -1, dir: 1 },
      F: { axis: "z", sign: 1, dir: -1 }, B: { axis: "z", sign: -1, dir: 1 },
    };
    const IDX = { x: 0, y: 1, z: 2 };
    const HS = 0.45;

    function perpAxes(N) {
      if (N[0]) return [[0, 1, 0], [0, 0, 1]];
      if (N[1]) return [[1, 0, 0], [0, 0, 1]];
      return [[1, 0, 0], [0, 1, 0]];
    }
    function rotAxis(v, axis, a) {
      const s = Math.sin(a), co = Math.cos(a);
      const [x, y, z] = v;
      if (axis === "x") return [x, y * co - z * s, y * s + z * co];
      if (axis === "y") return [x * co + z * s, y, -x * s + z * co];
      return [x * co - y * s, x * s + y * co, z];
    }

    let stickers, view, spinRaf, anim, queue, phase, tStart, tEnd, moves;
    let yaw = -0.62, pitch = -0.5;

    function buildSolved() {
      stickers = [];
      for (const k in FN) {
        const N = FN[k];
        const [u, v] = perpAxes(N);
        for (let i = -1; i <= 1; i++)
          for (let j = -1; j <= 1; j++) {
            stickers.push({
              c: [N[0] * 1.5 + u[0] * i + v[0] * j,
                  N[1] * 1.5 + u[1] * i + v[1] * j,
                  N[2] * 1.5 + u[2] * i + v[2] * j],
              n: N.slice(),
              col: COL[k],
            });
          }
      }
    }
    const inLayer = (s, mv) => s.c[IDX[mv.axis]] * mv.sign > 0.5;
    function applyExact(mv, inv) {
      const ang = (inv ? -1 : 1) * mv.dir * (Math.PI / 2);
      for (const s of stickers) {
        if (!inLayer(s, mv)) continue;
        s.c = rotAxis(s.c, mv.axis, ang).map((x) => Math.round(x * 2) / 2);
        s.n = rotAxis(s.n, mv.axis, ang).map((x) => Math.round(x));
      }
    }
    function solved() {
      const groups = {};
      for (const s of stickers) {
        const key = s.n.map((x) => Math.round(x)).join(",");
        (groups[key] = groups[key] || []).push(s.col);
      }
      for (const key in groups)
        for (const col of groups[key]) if (col !== groups[key][0]) return false;
      return Object.keys(groups).length === 6;
    }

    function enqueue(key, inv, dur) {
      queue.push({ mv: MOVES[key], inv: inv, dur: dur });
    }
    function scramble() {
      buildSolved();
      queue = [];
      const keys = Object.keys(MOVES);
      let prev = null;
      for (let i = 0; i < 22; i++) {
        let k;
        do { k = keys[Math.floor(Math.random() * keys.length)]; } while (k === prev);
        prev = k;
        enqueue(k, Math.random() < 0.5, 0.11);
      }
      phase = "scramble";
      moves = 0;
      tStart = 0;
      tEnd = 0;
      anim = null;
    }
    function startAnim(item) {
      anim = { mv: item.mv, inv: item.inv, dur: item.dur, t0: performance.now() };
    }

    function fmt(ms) {
      return (ms / 1000).toFixed(1) + "s";
    }
    function setStatus() {
      if (phase === "scramble") {
        status.textContent = "Scrambling…";
        status.style.color = "#9a8b7e";
      } else if (phase === "play") {
        status.textContent =
          "Time " + fmt(performance.now() - tStart) + "   ·   Moves " + moves;
        status.style.color = "#e4d7cc";
      } else if (phase === "solved") {
        status.textContent =
          "Solved in " + fmt(tEnd - tStart) + " · " + moves + " moves — nice! (n = new)";
        status.style.color = "#f0a882";
      }
    }

    function smooth(t) { return t * t * (3 - 2 * t); }

    function frame() {
      // process queue
      if (!anim && queue.length) startAnim(queue.shift());
      let ang = 0;
      if (anim) {
        const p = Math.min(1, (performance.now() - anim.t0) / (anim.dur * 1000));
        ang = (anim.inv ? -1 : 1) * anim.mv.dir * smooth(p) * (Math.PI / 2);
        if (p >= 1) {
          applyExact(anim.mv, anim.inv);
          const fin = anim.mv;
          anim = null;
          if (phase === "play") moves++;
          if (queue.length === 0 && phase === "scramble") {
            phase = "play";
            tStart = performance.now();
            moves = 0;
          } else if (phase === "play" && solved()) {
            phase = "solved";
            tEnd = performance.now();
          }
          void fin;
        }
      }

      ctx.fillStyle = "#0a0806";
      ctx.fillRect(0, 0, c.width, c.height);

      const vrot = (v) => rotAxis(rotAxis(v, "x", pitch), "y", yaw);
      const proj = (p) => {
        const s = 320 / (5 - p[2]);
        return [c.width / 2 + p[0] * s, c.height / 2 - p[1] * s, p[2]];
      };

      const draws = [];
      for (const s of stickers) {
        const [u, v] = perpAxes(s.n);
        let corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [
          s.c[0] + (u[0] * a + v[0] * b) * HS,
          s.c[1] + (u[1] * a + v[1] * b) * HS,
          s.c[2] + (u[2] * a + v[2] * b) * HS,
        ]);
        let nrm = s.n;
        if (anim && inLayer(s, anim.mv)) {
          corners = corners.map((p) => rotAxis(p, anim.mv.axis, ang));
          nrm = rotAxis(s.n, anim.mv.axis, ang);
        }
        const nv = vrot(nrm);
        if (nv[2] <= 0.03) continue; // backface cull
        const pts = corners.map((p) => proj(vrot(p)));
        const depth = pts.reduce((a, p) => a + p[2], 0) / 4;
        draws.push({ pts, col: s.col, depth, shade: nv[2] });
      }
      draws.sort((a, b) => a.depth - b.depth);
      for (const d of draws) {
        ctx.beginPath();
        ctx.moveTo(d.pts[0][0], d.pts[0][1]);
        for (let i = 1; i < 4; i++) ctx.lineTo(d.pts[i][0], d.pts[i][1]);
        ctx.closePath();
        ctx.globalAlpha = 0.6 + 0.4 * Math.min(1, d.shade);
        ctx.fillStyle = d.col;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0a0806";
        ctx.stroke();
      }

      setStatus();
      spinRaf = requestAnimationFrame(frame);
    }

    function stop() {
      if (spinRaf) cancelAnimationFrame(spinRaf);
      RC.exitMode();
    }

    scramble();
    RC.enterMode(wrap, (e) => {
      const k = e.key;
      if (k === "q" || k === "Escape") { e.preventDefault(); stop(); return; }
      if (k === "n" || k === "N") { e.preventDefault(); scramble(); return; }
      if (k === "ArrowLeft") { e.preventDefault(); yaw -= 0.12; return; }
      if (k === "ArrowRight") { e.preventDefault(); yaw += 0.12; return; }
      if (k === "ArrowUp") { e.preventDefault(); pitch -= 0.12; return; }
      if (k === "ArrowDown") { e.preventDefault(); pitch += 0.12; return; }
      const up = k.toUpperCase();
      if (MOVES[up] && phase === "play" && queue.length < 3) {
        e.preventDefault();
        enqueue(up, k === up /* uppercase = reversed */, 0.2);
      }
    });
    frame();
  }

  // ======================================================================
  const GAMES = { dino: dino, chess: chess, cube: cube };
  RC.registerCommand("game", () => {
    RC.openMenu({
      title: "/game — choose a game",
      options: [
        { label: "Dino Run", note: "— endless runner (termrex)", key: "dino" },
        { label: "Chess", note: "— vs computer or 2-player (chess-tui)", key: "chess" },
        { label: "Rubik's Cube", note: "— scramble & solve (ratty)", key: "cube" },
      ],
      onSelect: (opt) => GAMES[opt.key](),
      onCancel: () => RC.print("game closed.", "line--dim"),
    });
  });
})();
