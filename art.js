// Rishi Code — /art skill: animated ASCII gallery
(function () {
  "use strict";
  const W = 34,
    H = 12;

  const scene = (fill) =>
    Array.from({ length: H }, () => Array(W).fill(fill || " "));
  function draw(g, art, x, y) {
    for (let r = 0; r < art.length; r++) {
      const yy = y + r;
      if (yy < 0 || yy >= H) continue;
      const line = art[r];
      for (let c = 0; c < line.length; c++) {
        const xx = x + c;
        if (xx < 0 || xx >= W) continue;
        const ch = line[c];
        if (ch !== " ") g[yy][xx] = ch;
      }
    }
  }
  const toStr = (g) => g.map((r) => r.join("")).join("\n");
  const artW = (art) => Math.max.apply(null, art.map((l) => l.length));

  // scroll a set of frames horizontally across the scene
  function scroller(frames, o) {
    o = o || {};
    const step = o.step || 1;
    const hold = o.hold || 3;
    const dir = o.dir || 1;
    const w = artW(frames[0]);
    return function (t) {
      const g = scene();
      if (o.extras) o.extras(g, t);
      const span = W + w;
      let x =
        dir > 0
          ? ((t * step) % span) - w
          : W - ((t * step) % span);
      const fr = frames[Math.floor(t / hold) % frames.length];
      const y = o.y != null ? o.y : Math.floor((H - fr.length) / 2);
      draw(g, fr, Math.round(x), y);
      return toStr(g);
    };
  }

  // bob a set of frames in place
  function bobber(frames, o) {
    o = o || {};
    const hold = o.hold || 6;
    const amp = o.bob != null ? o.bob : 1;
    return function (t) {
      const g = scene();
      if (o.extras) o.extras(g, t);
      const fr = frames[Math.floor(t / hold) % frames.length];
      const x = 2;
      const y =
        Math.floor((H - fr.length) / 2) + Math.round(Math.sin(t / 7) * amp);
      draw(g, fr, x, y);
      return toStr(g);
    };
  }

  function bubbles(g, t) {
    for (let i = 0; i < 6; i++) {
      const x = (i * 8 + 3) % W;
      const y = H - 1 - ((t + i * 4) % (H - 1));
      if (y >= 0 && y < H) g[y][x] = i % 2 ? "o" : "°";
    }
  }
  function waterline(g) {
    for (let x = 0; x < W; x++) g[H - 1][x] = "~";
  }

  // ---------------- ANIMALS ----------------
  const cat = bobber(
    [
      [" /\\_/\\ ", "( o.o )", " > ^ < "],
      [" /\\_/\\ ", "( -.- )", " > ^ < "],
    ],
    { hold: 8, bob: 1 }
  );
  const dog = bobber(
    [
      ["  / \\__", " (    @\\___", "  /         O", " /   (____/", "     |   |"],
      ["  / \\__", " (    @\\___", "  /         O", " /   (____/", "     |  |"],
    ],
    { hold: 6 }
  );
  const rabbit = bobber(
    [
      [" (\\_/) ", " (o.o) ", ' ("")("") '],
      [" (\\_/) ", " (o_o) ", ' ("")("") '],
    ],
    { hold: 7 }
  );
  const bird = scroller(
    [
      ["  \\   / ", " --(o)-- "],
      [" --(o)-- ", "  /   \\ "],
    ],
    { step: 1, hold: 3, y: 4 }
  );
  const snake = scroller(
    [
      ["   ____", "  /    \\___", " < o        \\____", "  \\____________>"],
    ],
    { step: 1, hold: 4, y: 5 }
  );

  // ---------------- OCEAN ----------------
  const fish = scroller([[" ><(((°> "], [" ><(((o> "]], {
    step: 1,
    hold: 3,
    y: 5,
    extras: (g, t) => {
      bubbles(g, t);
      waterline(g);
    },
  });
  const whale = bobber(
    [
      [
        "        v",
        "       :",
        "    ___:____      |\"\\/\"|",
        "  ,'        `.     \\  /",
        "  |  O         \\____/ |",
      ],
      [
        "       :",
        "       :",
        "    ___:____      |\"\\/\"|",
        "  ,'        `.     \\  /",
        "  |  O         \\____/ |",
      ],
    ],
    { hold: 5, bob: 1, extras: (g) => waterline(g) }
  );
  const octopus = bobber(
    [
      ["   _---_", "  / o o \\", "  \\  ^  /", "   )'|'(", "  //|||\\\\"],
      ["   _---_", "  / o o \\", "  \\  ^  /", "   )'|'(", "  \\\\|||//"],
    ],
    { hold: 5, extras: (g, t) => bubbles(g, t) }
  );
  const crab = (function () {
    const frA = [" (\\/)(°,,,,°)(\\/) "];
    const frB = [" (><)(°,,,,°)(><) "];
    return function (t) {
      const g = scene();
      waterline(g);
      const fr = Math.floor(t / 4) % 2 ? frB : frA;
      const w = artW(fr);
      const range = W - w;
      const p = (t % (range * 2)) / range;
      const x = Math.round((p <= 1 ? p : 2 - p) * range);
      draw(g, fr, x, 6);
      return toStr(g);
    };
  })();
  const shark = scroller(
    [
      ["    /\\", "___/  \\___"],
    ],
    {
      step: 1,
      hold: 4,
      y: 8,
      extras: (g) => {
        for (let x = 0; x < W; x++) g[9] && (g[9][x] = "~");
      },
    }
  );

  // ---------------- VEHICLES ----------------
  const car = scroller(
    [
      ["    ______", "   /|_||_\\`.__", "  (   _    _  _\\", "  =`-(O)--(O)-'"],
      ["    ______", "   /|_||_\\`.__", "  (   _    _  _\\", "  =`-(o)--(o)-'"],
    ],
    { step: 1, hold: 2, y: 5 }
  );
  const rocket = (function () {
    const body = [
      "   /\\",
      "  |==|",
      "  |R |",
      "  |==|",
      " /|##|\\",
      "'-|##|-'",
    ];
    const flames = [["  )/\\(", "  //\\\\"], ["  )||(", "  (/\\)"]];
    return function (t) {
      const g = scene();
      const y = 5 - (Math.floor(t / 2) % 8);
      draw(g, body, 8, y);
      draw(g, flames[Math.floor(t / 2) % 2], 8, y + 6);
      // exhaust smoke below
      for (let i = 0; i < 4; i++) {
        const sy = y + 8 + i;
        if (sy >= 0 && sy < H) g[sy][10 + (i % 2)] = i % 2 ? "." : ":";
      }
      return toStr(g);
    };
  })();
  const plane = scroller([["       __|__", "*--o---(_)---o--*"]], {
    step: 1,
    hold: 3,
    y: 4,
  });
  const train = scroller(
    [
      ["   o  O  o", "    _____", "  _|[][]|_", " |__RISHI_|", "=(O)===(O)="],
      ["  O  o  O", "    _____", "  _|[][]|_", " |__RISHI_|", "=(o)===(o)="],
    ],
    { step: 1, hold: 2, y: 4 }
  );
  const bike = scroller(
    [
      ["    __o", "  _-\\<,_", " (*)/ (*)"],
      ["    __o", "  _-\\<,_", " (x)/ (x)"],
    ],
    { step: 1, hold: 2, y: 6 }
  );

  const ART = {
    Animals: [
      { label: "Cat", render: cat },
      { label: "Dog", render: dog },
      { label: "Rabbit", render: rabbit },
      { label: "Bird", render: bird },
      { label: "Snake", render: snake },
    ],
    Ocean: [
      { label: "Fish", render: fish },
      { label: "Whale", render: whale },
      { label: "Octopus", render: octopus },
      { label: "Crab", render: crab },
      { label: "Shark", render: shark },
    ],
    Vehicles: [
      { label: "Car", render: car },
      { label: "Rocket", render: rocket },
      { label: "Plane", render: plane },
      { label: "Train", render: train },
      { label: "Bike", render: bike },
    ],
  };

  function playAnimation(item) {
    const stage = document.createElement("div");
    stage.className = "stage";
    const pre = document.createElement("pre");
    stage.appendChild(pre);
    const bar = document.createElement("div");
    bar.className = "stage__bar";
    bar.textContent = "▶ " + item.label + "  ·  press q / Esc / Enter to stop";
    stage.appendChild(bar);

    let t = 0;
    let timer = null;
    function tick() {
      pre.textContent = item.render(t);
      t++;
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      RC.exitMode();
    }
    RC.enterMode(stage, (e) => {
      if (e.key === "q" || e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        stop();
      } else if (e.key === " " || e.key.indexOf("Arrow") === 0) {
        e.preventDefault();
      }
    });
    tick();
    RC.scrollDown();
    timer = setInterval(tick, 120);
  }

  function chooseArt(catName) {
    const items = ART[catName];
    RC.openMenu({
      title: "/art · " + catName + " — choose art",
      options: items.map((it) => ({ label: it.label, item: it })),
      onSelect: (opt) => playAnimation(opt.item),
      onCancel: () => RC.print("art closed.", "line--dim"),
    });
  }

  RC.registerCommand("art", () => {
    RC.openMenu({
      title: "/art — choose a category",
      options: Object.keys(ART).map((k) => ({
        label: k,
        note: "(" + ART[k].length + " pieces)",
        key: k,
      })),
      onSelect: (opt) => chooseArt(opt.key),
      onCancel: () => RC.print("art closed.", "line--dim"),
    });
  });
})();
