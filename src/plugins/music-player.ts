/**
 * Navidrome/Subsonic Music Player
 * 3-state: FAB → Expanded Panel → Capsule
 */

interface MusicConfig {
  enable: boolean;
  server_url: string;
  username: string;
  password: string;
  mode: "random" | "playlist";
  playlist_id: string;
  song_count: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt?: string;
}

// ===== MD5 =====
function syncMD5(str: string): string {
  function rotateLeft(v: number, s: number) { return (v << s) | (v >>> (32 - s)); }
  function addU(x: number, y: number) { const l = (x & 0xffff) + (y & 0xffff); return (((x >>> 16) + (y >>> 16) + (l >>> 16)) << 16) | (l & 0xffff); }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function tf(fn: Function, a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addU(a, addU(addU(fn(b, c, d), x), ac)); return addU(rotateLeft(a, s), b);
  }
  function toWords(s: string) {
    const w: number[] = [];
    for (let i = 0; i < s.length; i++) w[i >> 2] |= (s.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    w[s.length >> 2] |= 0x80 << ((s.length % 4) * 8);
    w[(((s.length + 8) >>> 6) << 4) + 14] = s.length * 8;
    return w;
  }
  function toHex(v: number) { let h = ""; for (let i = 0; i <= 3; i++) h += ("0" + ((v >>> (i * 8)) & 0xff).toString(16)).slice(-2); return h; }
  const x = toWords(str);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const T = [0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391];
  const K1=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], K2=[1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12], K3=[5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2], K4=[0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9];
  for (let k = 0; k < x.length; k += 16) {
    const AA=a,BB=b,CC=c,DD=d;
    for (let i=0;i<16;i++){a=tf(F,a,b,c,d,x[k+K1[i]]||0,S[i%4],T[i]);const t=d;d=c;c=b;b=a;a=t;}
    for (let i=0;i<16;i++){a=tf(G,a,b,c,d,x[k+K2[i]]||0,S[4+(i%4)],T[16+i]);const t=d;d=c;c=b;b=a;a=t;}
    for (let i=0;i<16;i++){a=tf(H,a,b,c,d,x[k+K3[i]]||0,S[8+(i%4)],T[32+i]);const t=d;d=c;c=b;b=a;a=t;}
    for (let i=0;i<16;i++){a=tf(I,a,b,c,d,x[k+K4[i]]||0,S[12+(i%4)],T[48+i]);const t=d;d=c;c=b;b=a;a=t;}
    a=addU(a,AA);b=addU(b,BB);c=addU(c,CC);d=addU(d,DD);
  }
  return toHex(a)+toHex(b)+toHex(c)+toHex(d);
}

function generateSalt(len = 6): string {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789"; let s = "";
  for (let i = 0; i < len; i++) s += c.charAt(Math.floor(Math.random() * c.length));
  return s;
}

function buildUrl(base: string, ep: string, u: string, p: string, params: Record<string, string | number> = {}): string {
  const salt = generateSalt();
  const token = syncMD5(p + salt);
  const url = new URL(`${base}/rest/${ep}`);
  url.searchParams.set("c", "FuwariPlayer");
  url.searchParams.set("v", "1.16.1");
  url.searchParams.set("f", "json");
  url.searchParams.set("u", u);
  url.searchParams.set("s", salt);
  url.searchParams.set("t", token);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, String(v));
  return url.toString();
}

function fmtTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
}

type PlayerView = "fab" | "expanded" | "capsule";

export function initMusicPlayer(config: MusicConfig) {
  if (!config.enable || !config.server_url || !config.username || !config.password) return;

  const baseUrl = config.server_url.replace(/\/+$/, "");
  const { username, password } = config;

  let songs: Song[] = [];
  let idx = 0;
  let playing = false;
  let loaded = false;
  let view: PlayerView = "fab";
  let lyricsLines: { time: number; text: string }[] = [];

  const audio = new Audio();
  audio.preload = "none";

  // ===== DOM =====
  const root = document.createElement("div");
  root.id = "music-player";
  root.innerHTML = `
<button class="mp-fab" aria-label="打开音乐播放器">
  <span class="mp-fab-icon icon-[material-symbols--music-note-rounded]"></span>
  <span class="mp-fab-pulse"></span>
</button>
<div class="mp-panel" style="display:none">
  <div class="mp-cover-area">
    <div class="mp-cover-disc">
      <img class="mp-cover" src="" alt="" />
      <div class="mp-no-cover"><span class="icon-[material-symbols--album] text-4xl opacity-30"></span></div>
      <div class="mp-disc-hole"></div>
    </div>
  </div>
  <div class="mp-info">
    <div class="mp-title">未加载歌曲</div>
    <div class="mp-artist">--</div>
  </div>
  <div class="mp-lyrics-box">
    <div class="mp-lyrics-scroll"><div class="mp-lyrics-inner">暂无歌词</div></div>
  </div>
  <div class="mp-seek-area">
    <input type="range" class="mp-seek" min="0" max="1000" value="0" step="1" />
    <div class="mp-times"><span class="mp-tcur">0:00</span><span class="mp-tdur">0:00</span></div>
  </div>
  <div class="mp-btns">
    <button class="mp-btn mp-prev" aria-label="上一首"><span class="icon-[material-symbols--skip-previous-rounded]"></span></button>
    <button class="mp-btn mp-play" aria-label="播放"><span class="mp-play-ico icon-[material-symbols--play-arrow-rounded]"></span></button>
    <button class="mp-btn mp-next" aria-label="下一首"><span class="icon-[material-symbols--skip-next-rounded]"></span></button>
  </div>
  <div class="mp-tip">点击播放开始</div>
</div>
<div class="mp-capsule" style="display:none">
  <div class="mp-cap-cover">
    <img class="mp-cap-img" src="" alt="" />
    <div class="mp-cap-nocover"><span class="icon-[material-symbols--album] text-lg opacity-40"></span></div>
  </div>
  <div class="mp-cap-ctrls">
    <button class="mp-cap-btn mp-cap-prev" aria-label="上一首"><span class="icon-[material-symbols--skip-previous-rounded]"></span></button>
    <button class="mp-cap-btn mp-cap-play" aria-label="播放"><span class="mp-cap-pico icon-[material-symbols--play-arrow-rounded]"></span></button>
    <button class="mp-cap-btn mp-cap-next" aria-label="下一首"><span class="icon-[material-symbols--skip-next-rounded]"></span></button>
  </div>
  <div class="mp-cap-lyr"><span class="mp-cap-ltxt"></span></div>
  <div class="mp-cap-bar"></div>
</div>`;
  document.body.appendChild(root);

  const fabEl = root.querySelector<HTMLElement>(".mp-fab")!;
  const panelEl = root.querySelector<HTMLElement>(".mp-panel")!;
  const capsuleEl = root.querySelector<HTMLElement>(".mp-capsule")!;

  const coverImg = root.querySelector<HTMLImageElement>(".mp-cover")!;
  const noCoverEl = root.querySelector<HTMLElement>(".mp-no-cover")!;
  const titleEl = root.querySelector<HTMLElement>(".mp-title")!;
  const artistEl = root.querySelector<HTMLElement>(".mp-artist")!;
  const lyricsInner = root.querySelector<HTMLElement>(".mp-lyrics-inner")!;
  const seekEl = root.querySelector<HTMLInputElement>(".mp-seek")!;
  const tcurEl = root.querySelector<HTMLElement>(".mp-tcur")!;
  const tdurEl = root.querySelector<HTMLElement>(".mp-tdur")!;
  const playIco = root.querySelector<HTMLElement>(".mp-play-ico")!;
  const tipEl = root.querySelector<HTMLElement>(".mp-tip")!;

  const capImg = root.querySelector<HTMLImageElement>(".mp-cap-img")!;
  const capNoCover = root.querySelector<HTMLElement>(".mp-cap-nocover")!;
  const capPIco = root.querySelector<HTMLElement>(".mp-cap-pico")!;
  const capLtxt = root.querySelector<HTMLElement>(".mp-cap-ltxt")!;
  const capBar = root.querySelector<HTMLElement>(".mp-cap-bar")!;

  // ===== View switching (display-based, no absolute positioning) =====
  function setView(v: PlayerView) {
    view = v;
    fabEl.style.display = v === "fab" ? "flex" : "none";
    panelEl.style.display = v === "expanded" ? "block" : "none";
    capsuleEl.style.display = v === "capsule" ? "flex" : "none";

    // Trigger enter animation
    if (v === "expanded") {
      panelEl.classList.remove("mp-enter");
      void panelEl.offsetHeight;
      panelEl.classList.add("mp-enter");
    }
    if (v === "capsule") {
      capsuleEl.classList.remove("mp-enter");
      void capsuleEl.offsetHeight;
      capsuleEl.classList.add("mp-enter");
    }
    if (v === "fab") {
      fabEl.classList.remove("mp-enter");
      void fabEl.offsetHeight;
      fabEl.classList.add("mp-enter");
    }

    root.classList.toggle("mp-playing", playing);
  }

  // FAB → Expanded
  fabEl.addEventListener("click", (e) => {
    e.stopPropagation();
    setView("expanded");
    if (!loaded) fetchSongs();
  });

  // Capsule → Expanded
  capsuleEl.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".mp-cap-btn")) return;
    e.stopPropagation();
    setView("expanded");
  });

  // Click outside panel → Capsule or FAB
  document.addEventListener("click", (e) => {
    if (view !== "expanded") return;
    if (root.contains(e.target as Node)) return;
    setView(loaded ? "capsule" : "fab");
  });

  // Click panel background (not inner content) → collapse
  panelEl.addEventListener("click", (e) => {
    if (e.target === panelEl) {
      setView(loaded ? "capsule" : "fab");
    }
  });

  // ===== API =====
  async function fetchSongs() {
    tipEl.textContent = "加载中...";
    try {
      let url: string;
      if (config.mode === "playlist" && config.playlist_id) {
        url = buildUrl(baseUrl, "getPlaylist", username, password, { id: config.playlist_id });
      } else {
        url = buildUrl(baseUrl, "getRandomSongs", username, password, { size: config.song_count || 20 });
      }
      const res = await fetch(url);
      const data = await res.json();
      const r = data["subsonic-response"];
      if (r.status !== "ok") { tipEl.textContent = "认证失败"; return; }
      const list = config.mode === "playlist" && config.playlist_id
        ? (r.playlist?.entry || [])
        : (r.randomSongs?.song || []);
      songs = list.map((s: any): Song => ({
        id: s.id, title: s.title || "未知", artist: s.artist || "未知",
        album: s.album || "", duration: s.duration || 0, coverArt: s.coverArt || s.id,
      }));
      if (songs.length === 0) { tipEl.textContent = "没有找到歌曲"; return; }
      loaded = true;
      idx = 0;
      loadSong(idx);
      tipEl.textContent = `共 ${songs.length} 首 · 点击播放`;
    } catch (e) {
      console.error("Music player:", e);
      tipEl.textContent = "连接服务器失败";
    }
  }

  function loadSong(i: number) {
    const song = songs[i];
    if (!song) return;
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    tdurEl.textContent = fmtTime(song.duration);
    tcurEl.textContent = "0:00";
    seekEl.value = "0";
    capBar.style.width = "0%";

    if (song.coverArt) {
      const cu = buildUrl(baseUrl, "getCoverArt", username, password, { id: song.coverArt, size: 300 });
      coverImg.src = cu; coverImg.style.display = "block"; noCoverEl.style.display = "none";
      capImg.src = cu; capImg.style.display = "block"; capNoCover.style.display = "none";
    } else {
      coverImg.style.display = "none"; noCoverEl.style.display = "flex";
      capImg.style.display = "none"; capNoCover.style.display = "flex";
    }

    fetchLyrics(song.id);

    const su = buildUrl(baseUrl, "stream", username, password, { id: song.id, maxBitRate: 0 });
    audio.src = su;
    audio.load();
    if (playing) audio.play().catch(() => {});
  }

  // ===== Lyrics =====
  async function fetchLyrics(songId: string) {
    lyricsLines = [];
    lyricsInner.textContent = "暂无歌词";
    capLtxt.textContent = "";
    try {
      // Navidrome extension
      const u2 = buildUrl(baseUrl, "getLyricsBySongId", username, password, { id: songId });
      const r2 = await fetch(u2);
      const d2 = await r2.json();
      const rr = d2["subsonic-response"];
      if (rr.status === "ok" && rr.lyricsList?.structuredLyrics?.[0]?.line) {
        lyricsLines = rr.lyricsList.structuredLyrics[0].line.map((l: any) => ({
          time: (l.start || 0) / 1000, text: l.value || "",
        }));
      }
    } catch { /* ignore */ }

    if (lyricsLines.length === 0) {
      // Fallback: standard getLyrics
      try {
        const song = songs[idx];
        const uf = buildUrl(baseUrl, "getLyrics", username, password, { artist: song.artist, title: song.title });
        const rf = await fetch(uf);
        const df = await rf.json();
        const rrf = df["subsonic-response"];
        if (rrf.status === "ok" && rrf.lyrics?.value) {
          parseLRC(rrf.lyrics.value);
        }
      } catch { /* ignore */ }
    }

    if (lyricsLines.length > 0) {
      lyricsInner.innerHTML = lyricsLines
        .map((l, i) => `<div class="mp-lrc-line" data-i="${i}">${l.text || "&nbsp;"}</div>`)
        .join("");
    }
  }

  function parseLRC(text: string) {
    const re = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/g;
    let m;
    const lines: { time: number; text: string }[] = [];
    while ((m = re.exec(text)) !== null) {
      const ms = m[3] ? parseInt(m[3].padEnd(3, "0")) : 0;
      lines.push({ time: parseInt(m[1]) * 60 + parseInt(m[2]) + ms / 1000, text: m[4].trim() });
    }
    lines.sort((a, b) => a.time - b.time);
    if (lines.length > 0) lyricsLines = lines;
  }

  function updateLyrics(t: number) {
    if (lyricsLines.length === 0) return;
    let ai = -1;
    for (let i = lyricsLines.length - 1; i >= 0; i--) {
      if (t >= lyricsLines[i].time) { ai = i; break; }
    }
    // Highlight in panel
    lyricsInner.querySelectorAll<HTMLElement>(".mp-lrc-line").forEach((el, i) => {
      el.classList.toggle("mp-lrc-active", i === ai);
    });
    if (ai >= 0) {
      const activeLine = lyricsInner.querySelector<HTMLElement>(".mp-lrc-active");
      if (activeLine) activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Capsule lyric fade
    if (ai >= 0 && lyricsLines[ai].text) {
      const txt = lyricsLines[ai].text;
      if (capLtxt.textContent !== txt) {
        capLtxt.classList.add("mp-lfade-out");
        setTimeout(() => {
          capLtxt.textContent = txt;
          capLtxt.classList.remove("mp-lfade-out");
          capLtxt.classList.add("mp-lfade-in");
          setTimeout(() => capLtxt.classList.remove("mp-lfade-in"), 300);
        }, 200);
      }
    }
  }

  // ===== Controls =====
  function toggle() {
    if (songs.length === 0) { fetchSongs(); return; }
    if (playing) audio.pause(); else audio.play().catch(() => {});
  }
  function prev() { if (!songs.length) return; idx = (idx - 1 + songs.length) % songs.length; loadSong(idx); }
  function next() { if (!songs.length) return; idx = (idx + 1) % songs.length; loadSong(idx); }

  function syncIcons() {
    const ic = playing ? "icon-[material-symbols--pause-rounded]" : "icon-[material-symbols--play-arrow-rounded]";
    playIco.className = `mp-play-ico ${ic}`;
    capPIco.className = `mp-cap-pico ${ic}`;
    root.classList.toggle("mp-playing", playing);
  }

  // Panel buttons
  root.querySelector(".mp-play")!.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
  root.querySelector(".mp-prev")!.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
  root.querySelector(".mp-next")!.addEventListener("click", (e) => { e.stopPropagation(); next(); });
  // Capsule buttons
  root.querySelector(".mp-cap-play")!.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
  root.querySelector(".mp-cap-prev")!.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
  root.querySelector(".mp-cap-next")!.addEventListener("click", (e) => { e.stopPropagation(); next(); });

  seekEl.addEventListener("input", (e) => {
    e.stopPropagation();
    if (audio.duration) audio.currentTime = (Number(seekEl.value) / 1000) * audio.duration;
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    seekEl.value = String((audio.currentTime / audio.duration) * 1000);
    tcurEl.textContent = fmtTime(audio.currentTime);
    capBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    updateLyrics(audio.currentTime);
  });
  audio.addEventListener("ended", next);
  audio.addEventListener("play", () => { playing = true; syncIcons(); tipEl.textContent = `${idx + 1} / ${songs.length}`; });
  audio.addEventListener("pause", () => { playing = false; syncIcons(); });
  audio.addEventListener("error", () => { tipEl.textContent = "播放失败"; setTimeout(next, 1500); });
}
