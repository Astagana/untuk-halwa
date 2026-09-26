/* ===========================================================
   Untuk Halwa — dari Dias
   Edit bagian CONFIG aja kalau mau ganti nomor / nama lagu.
   =========================================================== */
const CONFIG = {
  waNumber: "6282253507804",          // <-- GANTI jadi nomor WhatsApp kamu (awali 62)
  waText:   "Aku kangen sama kamuu",  // teks yang otomatis muncul di chat
  trackName:"song.mp3",               // nama tampil di player
  letter:   "Kalau kamu masih nyimpen rasa yang sama, walau cuma sedikit — aku juga masih punya banyak rasa ke kamu, aku bohong kalau aku kuat tanpa kamu, aku gakuat aku bener bener kangen sama kamuu, aku gabisa tanpa kamu, saat aku diem aku selalu inget samaa kamuu,         akuu bodoh.                                                                            — Aku Minta Maaf."
};

/* ---------- helper ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = (t) => {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ":" + String(s).padStart(2, "0");
};

/* ---------- tautan WhatsApp ---------- */
(() => {
  const url = `https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(CONFIG.waText)}`;
  $$("[data-wa]").forEach(a => (a.href = url));
  $("#trackTitle").textContent = CONFIG.trackName;
})();

/* ---------- audio ---------- */
const audio  = $("#audio");
const playBtn = $("#playBtn");
const seekBar = $("#seekBar");
const seekFill = $("#seekFill");
const player = $("#player");

audio.volume = 0.75;

function togglePlay() {
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
  syncPlayBtn();
}
function syncPlayBtn() {
  playBtn.textContent = audio.paused ? "▶" : "❚❚";
  player.classList.toggle("is-paused", audio.paused);
}
playBtn.addEventListener("click", togglePlay);
audio.addEventListener("play", syncPlayBtn);
audio.addEventListener("pause", syncPlayBtn);
audio.addEventListener("loadedmetadata", () => ($("#durTime").textContent = fmt(audio.duration)));
audio.addEventListener("timeupdate", () => {
  const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  seekFill.style.width = p + "%";
  seekBar.style.setProperty("--pos", p + "%");
  $("#curTime").textContent = fmt(audio.currentTime);
});
audio.addEventListener("error", () => {
  $("#trackTitle").textContent = "song.mp3 nggak ketemu";
  $("#player").querySelector(".player__sub").textContent = "taruh file lagunya di sebelah index.html";
});

function seekTo(clientX) {
  const r = seekBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
  if (audio.duration) audio.currentTime = ratio * audio.duration;
}
seekBar.addEventListener("click", e => seekTo(e.clientX));
seekBar.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") audio.currentTime += 5;
  if (e.key === "ArrowLeft")  audio.currentTime -= 5;
});
$("#vol").addEventListener("input", e => (audio.volume = +e.target.value));

/* ---------- gerbang awal ---------- */
$("#enterBtn").addEventListener("click", () => {
  $("#gate").classList.add("is-gone");
  document.body.classList.remove("is-locked");
  audio.play().catch(() => {});
  syncPlayBtn();
  burst(window.innerWidth / 2, window.innerHeight / 2, 14);
});
document.body.classList.add("is-locked");

/* ---------- navigasi halaman ---------- */
const pages = $$(".page");
const navItems = $$(".nav__item");
const nextBtn = $("#nextBtn");
const prevBtn = $("#prevBtn");
let current = 0;

$("#counterAll").textContent = String(pages.length).padStart(2, "0");

function goTo(i, dir) {
  i = Math.min(Math.max(i, 0), pages.length - 1);
  if (i === current && pages[current].classList.contains("is-active")) return;

  pages[current].classList.remove("is-active");
  current = i;
  const page = pages[current];
  page.classList.add("is-active");

  navItems.forEach((n, k) => n.classList.toggle("is-active", k === current));
  $("#counterNow").textContent = String(current + 1).padStart(2, "0");
  $("#topFill").style.width = ((current + 1) / pages.length) * 100 + "%";
  prevBtn.classList.toggle("is-hidden", current === 0);
  nextBtn.classList.toggle("is-hidden", current === pages.length - 1);

  // reset interaksi di halaman ini biar tetap rapi kalau dibuka ulang
  $$(".note", page).forEach(n => n.classList.remove("is-open"));
  $$(".flip", page).forEach(f => f.classList.remove("is-flipped"));

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (current === pages.length - 1) burst(window.innerWidth - 60, window.innerHeight * 0.5, 10);
}

nextBtn.addEventListener("click", () => goTo(current + 1, 1));
prevBtn.addEventListener("click", () => goTo(current - 1, -1));
navItems.forEach(n => n.addEventListener("click", () => {
  goTo(+n.dataset.go);
  document.body.classList.remove("nav-open");
}));
$("#restart").addEventListener("click", () => goTo(0, -1));

$$(".nav__item").forEach(n => n.addEventListener("click", () => {
  if (window.innerWidth <= 900) document.body.classList.remove("nav-open");
}));

// keyboard
document.addEventListener("keydown", e => {
  if (["ArrowRight", "PageDown"].includes(e.key)) goTo(current + 1, 1);
  if (["ArrowLeft", "PageUp"].includes(e.key)) goTo(current - 1, -1);
});

// swipe
let tx = 0, ty = 0;
document.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy)) return;
  goTo(dx < 0 ? current + 1 : current - 1);
}, { passive: true });

// menu mobile
$("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
$("#scrim").addEventListener("click", () => document.body.classList.remove("nav-open"));

/* ---------- kartu kenangan ---------- */
$$(".note").forEach(n => n.addEventListener("click", () => n.classList.toggle("is-open")));

/* ---------- kartu flip ---------- */
$$(".flip").forEach(f => f.addEventListener("click", () => f.classList.toggle("is-flipped")));

/* ---------- amplop + efek ketik ---------- */
const envBtn = $("#envBtn");
const letterBox = $("#letter");
const letterText = $("#letterText");
let typed = false;

envBtn.addEventListener("click", () => {
  envBtn.classList.add("is-open");
  $("#envHint").classList.add("is-gone");
  setTimeout(() => {
    letterBox.classList.add("is-open");
    typeLetter();
  }, 620);
});

function typeLetter() {
  if (typed) return;
  typed = true;
  const txt = CONFIG.letter;
  let i = 0;
  const tick = () => {
    letterText.textContent = txt.slice(0, ++i);
    if (i < txt.length) setTimeout(tick, txt[i] === "," || txt[i] === "." ? 130 : 34);
    else letterBox.classList.add("is-done");
  };
  setTimeout(tick, 500);
}

/* ---------- hati kecil saat klik ---------- */
const burst = (x, y, n = 6) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = $("#burst");
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "pop";
    s.textContent = "♥";
    s.style.left = x + (Math.random() * 90 - 45) + "px";
    s.style.top = y + (Math.random() * 40 - 20) + "px";
    s.style.fontSize = 10 + Math.random() * 12 + "px";
    s.style.animationDelay = Math.random() * 0.25 + "s";
    s.style.color = ["#ab5f57", "#d9a49a", "#c98a7f"][i % 3];
    box.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
};
document.addEventListener("click", e => {
  if (e.target.closest("a,button,input,.gate")) return;
  burst(e.clientX, e.clientY, 3);
});

/* ---------- kelopak jatuh ---------- */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#petals"), ctx = c.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const colors = ["#d9a49a", "#e6c6bb", "#c98a7f", "#e8d5bd"];
  let w, h, t = 0;
  const count = () => (window.innerWidth < 720 ? 14 : 26);
  let petals = [];

  function make() {
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      r: 4 + Math.random() * 6,
      vy: 0.28 + Math.random() * 0.5,
      vr: (Math.random() - 0.5) * 0.02,
      rot: Math.random() * Math.PI,
      phase: Math.random() * Math.PI * 2,
      sway: 0.4 + Math.random() * 0.7,
      a: 0.22 + Math.random() * 0.3,
      color: colors[(Math.random() * colors.length) | 0]
    };
  }
  function resize() {
    w = c.width = window.innerWidth * dpr;
    h = c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + "px";
    c.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = window.innerWidth; h = window.innerHeight;
    petals = Array.from({ length: count() }, make);
  }
  function loop() {
    ctx.clearRect(0, 0, w, h);
    t += 0.01;
    petals.forEach(p => {
      p.y += p.vy;
      p.x += Math.sin(t + p.phase) * p.sway;
      p.rot += p.vr;
      if (p.y > h + 24) { p.y = -24; p.x = Math.random() * w; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  window.addEventListener("resize", resize);
  resize();
  loop();
})();

/* ---------- awal ---------- */
syncPlayBtn();
goTo(0);
