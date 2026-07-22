// Rishi Code — /game skill: Dino runner, Chess, Rubik's cube (ports of the linked repos)
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
      // ground
      ctx.strokeStyle = "#6f6358";
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(c.width, groundY + 2);
      ctx.stroke();
      ctx.fillStyle = "#4a4139";
      for (let x = -((Math.floor(score * (speed / 5)) * 2) % 40); x < c.width; x += 40)
        ctx.fillRect(x, groundY + 6, 14, 2);
      // dino
      const b = box();
      ctx.fillStyle = "#e4d7cc";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(b.x + b.w - (d.duck ? 12 : 9), b.y + 6, 4, 4); // eye
      ctx.fillStyle = "#e4d7cc";
      if (!d.duck) {
        ctx.fillRect(b.x + b.w, b.y + 8, 8, 12); // snout
        ctx.fillRect(b.x + 4, b.y + b.h, 8, 6); // leg
        ctx.fillRect(b.x + b.w - 14, b.y + b.h, 8, 6);
      }
      // obstacles
      for (const o of obstacles) {
        if (o.type === "cactus") {
          ctx.fillStyle = "#6cc07a";
          ctx.fillRect(o.x, o.y - o.h, o.w, o.h);
          ctx.fillRect(o.x - 5, o.y - o.h + 8, 5, 12);
          ctx.fillRect(o.x + o.w, o.y - o.h + 6, 5, 12);
        } else {
          ctx.fillStyle = "#d97757";
          const up = Math.floor(o.f) % 2 === 0;
          ctx.fillRect(o.x + 6, o.y + 6, 22, 6); // body
          ctx.fillRect(o.x, o.y + (up ? 0 : 12), 12, 6); // wing
          ctx.fillRect(o.x + 24, o.y + 8, 10, 4); // beak
        }
      }
      // score
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
  // CHESS  (port of github.com/thomas-mauran/chess-tui — local 2-player)
  // ======================================================================
  function chess() {
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
      "click a piece then a square  ·  arrows + space also work  ·  q quits";
    wrap.append(boardEl, status, bar);

    const start =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    let board, turn, rights, ep, cursor, sel, legal, done;

    function parse() {
      board = [];
      const rows = start.split("/");
      for (let r = 0; r < 8; r++) {
        const row = [];
        for (const ch of rows[r]) {
          if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) row.push(null);
          else
            row.push({
              t: ch.toLowerCase(),
              c: ch === ch.toLowerCase() ? "b" : "w",
            });
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
    }
    const inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const opp = (c) => (c === "w" ? "b" : "w");
    const clone = (b) => b.map((row) => row.map((p) => (p ? { t: p.t, c: p.c } : null)));

    function attacked(b, r, c, by) {
      const pd = by === "w" ? 1 : -1; // white pawns sit "below" and attack upward (r-1)
      for (const dc of [-1, 1]) {
        const pr = r + pd,
          pc = c + dc;
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
          if (p) {
            if (p.c === by && (p.t === "b" || p.t === "q")) return true;
            break;
          }
          rr += dr; cc += dc;
        }
      }
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        let rr = r + dr, cc = c + dc;
        while (inb(rr, cc)) {
          const p = b[rr][cc];
          if (p) {
            if (p.c === by && (p.t === "r" || p.t === "q")) return true;
            break;
          }
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
        // castling
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
          p.t === "b"
            ? [[-1,-1],[-1,1],[1,-1],[1,1]]
            : p.t === "r"
            ? [[-1,0],[1,0],[0,-1],[0,1]]
            : [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of dirs) {
          let tr = r + dr, tc = c + dc;
          while (inb(tr, tc)) {
            if (!b[tr][tc]) add(tr, tc, {});
            else {
              if (b[tr][tc].c !== p.c) add(tr, tc, {});
              break;
            }
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
      // rights
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
          if (board[r][c] && board[r][c].c === col && legalFrom(r, c).length)
            return true;
      return false;
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
        status.className = "chess-status";
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
    }

    function activate(r, c) {
      if (done) return;
      if (sel) {
        const m = legal.find((x) => x.tr === r && x.tc === c);
        if (m) { move(m); return; }
      }
      const p = board[r][c];
      if (p && p.c === turn) {
        sel = { r, c };
        legal = legalFrom(r, c);
      } else {
        sel = null;
        legal = [];
      }
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
          sq.addEventListener("click", () => {
            cursor = { r, c };
            activate(r, c);
          });
          boardEl.appendChild(sq);
        }
      }
    }

    function stop() {
      RC.exitMode();
    }

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
  // RUBIK'S CUBE  (port of ratty's rubiks_cube.rs — colors + view angles)
  // ======================================================================
  function cube() {
    const wrap = document.createElement("div");
    wrap.className = "game";
    const c = document.createElement("canvas");
    c.width = 340;
    c.height = 300;
    wrap.appendChild(c);
    const bar = document.createElement("div");
    bar.className = "game__bar";
    bar.textContent = "auto-rotating cube  ·  ←/→ spin speed  ·  space pause  ·  q quits";
    wrap.appendChild(bar);
    const ctx = c.getContext("2d");

    // ratty palette
    const COL = {
      U: "rgb(242,242,242)", D: "rgb(255,213,0)", F: "rgb(0,155,72)",
      B: "rgb(0,70,173)", R: "rgb(183,18,52)", L: "rgb(255,88,0)",
    };
    const FACES = [
      { k: "R", n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
      { k: "L", n: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
      { k: "U", n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
      { k: "D", n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
      { k: "F", n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
      { k: "B", n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0] },
    ];
    // build stickers
    const stickers = [];
    const GAP = 0.30, SPAN = 0.66;
    for (const f of FACES) {
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) {
          const center = [
            f.n[0] + f.u[0] * i * SPAN + f.v[0] * j * SPAN,
            f.n[1] + f.u[1] * i * SPAN + f.v[1] * j * SPAN,
            f.n[2] + f.u[2] * i * SPAN + f.v[2] * j * SPAN,
          ];
          const corners = [];
          for (const [su, sv] of [[-1,-1],[1,-1],[1,1],[-1,1]])
            corners.push([
              center[0] + (f.u[0] * su + f.v[0] * sv) * GAP,
              center[1] + (f.u[1] * su + f.v[1] * sv) * GAP,
              center[2] + (f.u[2] * su + f.v[2] * sv) * GAP,
            ]);
          stickers.push({ n: f.n, corners, color: COL[f.k] });
        }
    }

    let yaw = -0.58, pitch = 0.42, spin = 0.02, paused = false, raf = null;

    function rot(p) {
      let [x, y, z] = p;
      let cx = Math.cos(pitch), sx = Math.sin(pitch);
      let y1 = y * cx - z * sx, z1 = y * sx + z * cx;
      let cy = Math.cos(yaw), sy = Math.sin(yaw);
      let x1 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
      return [x1, y1, z2];
    }
    function project(p) {
      const d = 5, f = 340;
      const s = f / (d - p[2]);
      return [c.width / 2 + p[0] * s, c.height / 2 - p[1] * s, p[2]];
    }
    function frame() {
      if (!paused) yaw += spin;
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(0, 0, c.width, c.height);
      const draws = [];
      for (const st of stickers) {
        const rn = rot(st.n);
        if (rn[2] <= 0.02) continue; // backface cull
        const pts = st.corners.map((p) => project(rot(p)));
        const depth = pts.reduce((a, p) => a + p[2], 0) / 4;
        draws.push({ pts, color: st.color, depth, shade: rn[2] });
      }
      draws.sort((a, b) => a.depth - b.depth);
      for (const d of draws) {
        ctx.beginPath();
        ctx.moveTo(d.pts[0][0], d.pts[0][1]);
        for (let i = 1; i < 4; i++) ctx.lineTo(d.pts[i][0], d.pts[i][1]);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.55 + 0.45 * Math.min(1, d.shade);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#0a0806";
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      RC.exitMode();
    }
    RC.enterMode(wrap, (e) => {
      if (e.key === "q" || e.key === "Escape") { e.preventDefault(); stop(); }
      else if (e.key === " ") { e.preventDefault(); paused = !paused; }
      else if (e.key === "ArrowRight") { e.preventDefault(); spin = Math.min(0.12, spin + 0.01); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); spin = Math.max(-0.12, spin - 0.01); }
    });
    frame();
  }

  // ======================================================================
  const GAMES = {
    dino: dino,
    chess: chess,
    cube: cube,
  };
  RC.registerCommand("game", () => {
    RC.openMenu({
      title: "/game — choose a game",
      options: [
        { label: "Dino Run", note: "— endless runner (termrex)", key: "dino" },
        { label: "Chess", note: "— local 2-player (chess-tui)", key: "chess" },
        { label: "Rubik's Cube", note: "— rotating cube (ratty)", key: "cube" },
      ],
      onSelect: (opt) => GAMES[opt.key](),
      onCancel: () => RC.print("game closed.", "line--dim"),
    });
  });
})();
