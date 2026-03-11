(function () {
    const HEADER_SEL = 'header, .app-header, .s-header';
    const TIMEOUT_MS = 5000; // 5s: if not started by then, show fallback
  
    const CFG = {
      videoSrc:  'https://selia-tech.github.io/videos/video-2026-01-02T04-22-03-445Z-3mef6h.mp4',
      bannerImg: 'https://cdn.files.salla.network/homepage/1333909099/0eecdcb5-3c5b-4771-b741-cb9236bc2ee6.webp',
      headlineAr:'عيش أجواء الشتاء.. مع ريحة جمر وجمعة احباب '
    };
  
    const HERO_ID = 'heroOne';
  
    function buildHero(){
      const sec = document.createElement('section');
      sec.id = HERO_ID;
  
      const v = document.createElement('video');
      // iOS autoplay helpers
      v.src = CFG.videoSrc;
      v.autoplay = true;
      v.muted = true;
      v.loop = true; // loop forever
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.preload = 'auto';
      v.poster = CFG.bannerImg; // show image until playback actually starts
      sec.appendChild(v);
  
      const copy = document.createElement('div');
      copy.className = 'top-copy';
      copy.innerHTML = `<h2 class="headline-ar" dir="rtl">${CFG.headlineAr}</h2>`;
      sec.appendChild(copy);
  
      // --- fallback logic (no double-play, just loop or swap) ---
      let started = false;
      let swapped = false;
  
      const swapToBanner = () => {
        if (swapped) return;
        const img = new Image();
        img.src = CFG.bannerImg;
        img.alt = 'banner';
        try { sec.replaceChild(img, v); } catch (_) {}
        
       
  
        swapped = true;
      };
  
      // If it never starts playing within TIMEOUT_MS, fallback
      const timer = setTimeout(() => { if (!started) swapToBanner(); }, TIMEOUT_MS);
  
      // Once we truly start, clear the timer
      const onStarted = () => {
        if (started) return;
        started = true;
        clearTimeout(timer);
      };
  
      // Consider any of these as “started enough”
      v.addEventListener('playing', onStarted, { once:true });
      v.addEventListener('canplaythrough', onStarted, { once:true });
      v.addEventListener('timeupdate', function tickOnce(){
        if (v.currentTime > 0) { onStarted(); v.removeEventListener('timeupdate', tickOnce); }
      });
  
      // Hard errors -> fallback
      v.addEventListener('error',  swapToBanner, { once:true });
      v.addEventListener('abort',  swapToBanner, { once:true });
      v.addEventListener('stalled', () => { /* might still recover; timer handles fallback */ });
  
      // Try to kick autoplay after metadata
      v.addEventListener('loadedmetadata', () => {
        const p = v.play();
        if (p && typeof p.then === 'function') p.catch(() => swapToBanner());
      }, { once:true });
  
      return sec;
    }
  
    function insert(){
      const header = document.querySelector(HEADER_SEL);
      if (!header) return false;
      if (!document.getElementById(HERO_ID)) header.after(buildHero());
      return true;
    }
  
    function init(){
      if (insert()) return;
      const mo = new MutationObserver(()=>{ if(insert()) mo.disconnect(); });
      mo.observe(document.body,{childList:true,subtree:true});
    }
  
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init, { once:true });
    document.addEventListener('salla:pageUpdated', () => setTimeout(init, 60));
  })();
  
  
  (function () {
    const UNDER_ID = 'heroUnder';
    const HERO_ID  = 'heroOne';
  
    // content + behavior config
    const UNDER = {
      title: 'شواية فحم كبيرة XL',
      desc:  'لهواة ومحبي الشوي في اجواء الشتاء ،<br/>تجمع بين التصميم الأنيق والمتعدد الاستخدامات. تعطيك تجربة شواء مميزة مع هيكلها الصلب المقاوم للحرارة.',
      now:   '1,400',
      old:   '1,590',
      cta:   'اطلب الآن',
      // primary target (same as your floating snippet)
      scrollSel: '.s-block--fast-checkout',
      // optional fallbacks in case themes differ
      altSel: ['.s-block--fast-checkout', '#fast-checkout', '.fast-checkout', '#checkout', '[data-fast-checkout]'],
      // offset (e.g., sticky header height)
      offsetY: 20
    };
  
    function buildUnder(){
      const sec = document.createElement('section');
      sec.id = UNDER_ID;
      sec.innerHTML = `
        <div class="under-card" dir="rtl">
          <h3 class="under-title">${UNDER.title}</h3>
          <p class="under-desc">${UNDER.desc}</p>
          <div class="price-row" aria-label="السعر">
            <span class="price-now">${UNDER.now} <span>ر.س</span></span>
            <span class="price-old">${UNDER.old} ر.س</span>
          </div>
          <button type="button" class="cta">${UNDER.cta}</button>
        </div>
      `;
  
      // CTA behavior: smooth scroll with SPA-safe observer
      const btn = sec.querySelector('.cta');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        smartScroll([UNDER.scrollSel, ...UNDER.altSel], UNDER.offsetY);
      });
      return sec;
    }
  
    function smartScroll(selectors, offsetY){
      const find = () => {
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el) return el;
        }
        return null;
      };
  
      const go = (el) => {
        const top = el.getBoundingClientRect().top + window.pageYOffset - (offsetY || 0);
        window.scrollTo({ top, behavior: 'smooth' });
      };
  
      const el = find();
      if (el) { go(el); return true; }
  
      // Wait briefly for SPA/async content
      const mo = new MutationObserver(() => {
        const e2 = find();
        if (e2) { go(e2); mo.disconnect(); }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => mo.disconnect(), 5000); // stop waiting after 5s
      return false;
    }
  
    function insertUnder(){
      const hero = document.getElementById(HERO_ID);
      if (!hero) return false;
      if (!document.getElementById(UNDER_ID)) hero.after(buildUnder());
      return true;
    }
  
    function init(){
      if (insertUnder()) return;
      const mo = new MutationObserver(()=>{ if (insertUnder()) mo.disconnect(); });
      mo.observe(document.body, { childList:true, subtree:true });
    }
  
    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init, { once:true });
    document.addEventListener('salla:pageUpdated', () => setTimeout(init, 60));
  })();
  
  
  
  
  (() => {
    const SECTION_ID = "grill-explorer";
    const STYLE_ID = "ge-inline-styles";
    const BEFORE_SEL = "#heroUnder"; // change if you want (inserts before this)
  
    // ✅ Replace with your real assets
    const GRILL_IMAGE =
      "https://cdn.files.salla.network/homepage/1333909099/b7884876-6826-4e53-9464-aa797830a1f0.webp"; // <-- replace
  
    const FEATURES = [
      {
        title: "مقبض(هندل) للتحكم بالحرارة بارتفاع الفحم",
        desc: " مقبض رفع على الجانب الأيسر والأيمن، يمكنك تدوير المقبض لرفع أو خفض صاجة الفحم و تغيير  الحرارة  على الفور دون الحاجة إلى التلاعب بالشواية أو الفحم.",
        img: "https://cdn.files.salla.network/homepage/1333909099/a6404ac9-f105-4992-b053-4c93ee130890.webp", // <-- replace
        aria: "ميزة التحكم في حرارة الفحم",
      },
      {
        title: "صاجيتن مزدوجة",
        desc: "صاجتين فحم مزدوجة لشواء وجبتين في نفس الوقت",
        img: "https://cdn.files.salla.network/homepage/1333909099/ff7479ab-a114-4f1d-bc17-8231dbabe85f.webp", // <-- replace
        aria: "باب أمامي يُمكنك من زيادة الفحم أو تقليله أثناء الشواء",
      },
      {
        title: "شبك واسع ومساحة شواء أكبر",
        desc: "شبك واسع يساعدك تشوي كميات أكثر بشكل متوازن مع توزيع حرارة أفضل داخل الشواية.",
        img: "https://cdn.files.salla.network/homepage/1333909099/5c64a542-42b3-49ed-bb85-1096a93e1bf7.webp", // <-- replace
        aria: "شبك واسع",
      },
      {
        title: "رف جانبي عملي للتحضير والتقديم",
        desc: "رف خشبي جانبي لوضع الأطباق، وخطافات لتعليق أدوات الشواء عليها — تخليك مرتّب وسريع أثناء الشواء",
        img: "https://cdn.files.salla.network/homepage/1333909099/5f827fe1-7d40-4867-97b4-bc263f48b5d5.webp", // <-- replace
        aria: "الرف الجانبي",
      },
      {
        title: "عجلات قوية وتخزين سفلي",
        desc: "سهولة نقل الشواية + مساحة تخزين سفلية لأكياس الفحم والأدوات.",
        img: "https://cdn.files.salla.network/homepage/1333909099/fe952c11-7f54-4f43-833f-a26069ec37b5.webp", // <-- replace
        aria: "العجلات والتخزين السفلي",
      },
    ];
  
    // ================== (Half CSS injected by JS) ==================
    const CSS_INLINE = `
    /* scoped variables */
    #${SECTION_ID}{
      --color-accent:#d95e16;
      --color-accent-dark:#b94d10;
      --color-accent-glow:rgba(217,94,22,.4);
      --radius-md:12px;--radius-lg:20px;
      --transition:.3s ease;
    }
  
    /* light theme defaults */
    #${SECTION_ID}, #${SECTION_ID}.theme-light{
      --color-bg:#f5f5f5;
      --color-bg-secondary:#f5f5f5;
      --color-bg-card:#ffffff;
      --color-text:#1a1a1a;
      --color-text-muted:#666666;
      --color-border:rgba(217,94,22,.2);
      --color-hotspot-bg:rgba(255,255,255,.9);
      --gradient-bg:#f5f5f5;
      --shadow-card:none;
      --shadow-image:none;
    }
  
    /* dark theme option */
    #${SECTION_ID}.theme-dark{
      --color-bg:#0a0a0a;
      --color-bg-secondary:#151515;
      --color-bg-card:#1a1a1a;
      --color-text:#f5f5f5;
      --color-text-muted:#a0a0a0;
      --color-border:rgba(217,94,22,.2);
      --color-hotspot-bg:rgba(10,10,10,.7);
      --gradient-bg:linear-gradient(180deg,#0a0a0a 0%,#151515 50%,#0a0a0a 100%);
      --shadow-card:0 10px 40px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05);
      --shadow-image:0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(217,94,22,.1);
    }
  
    /* scope reset (NOT global) */
    #${SECTION_ID}, #${SECTION_ID} *{ box-sizing:border-box; }
    #${SECTION_ID}{ direction:rtl; padding:40px 20px; background:var(--gradient-bg); color:var(--color-text); }
    @media (min-width:768px){ #${SECTION_ID}{ padding:60px 40px; } }
  
    .ge-header{ text-align:center; margin:0 auto 40px; max-width:800px; opacity:0; transform:translateY(30px); }
    @media (min-width:768px){ .ge-header{ margin-bottom:60px; } }
  
    .ge-header h2{ font-size:clamp(1.5rem,5vw,2.5rem); font-weight:700; margin-bottom:16px; display:inline-block; position:relative; color:var(--color-text); }
    .ge-header h2::after{ content:""; position:absolute; bottom:-8px; right:50%; transform:translateX(50%); width:80px; height:3px;
      background:linear-gradient(90deg,transparent,var(--color-accent),transparent); border-radius:2px; }
    .ge-header p{ font-size:clamp(.95rem,2.5vw,1.1rem); color:var(--color-text-muted); max-width:500px; margin:0 auto; }
  
    .ge-content{ display:flex; flex-direction:column; gap:30px; max-width:1400px; margin:0 auto; align-items:center; }
    @media (min-width:768px){
      .ge-content{ flex-direction:row; align-items:flex-start; gap:50px; }
    }
    @media (min-width:1200px){ .ge-content{ gap:80px; } }
  
    .ge-image-wrap{ position:relative; width:100%; max-width:800px; border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-image); opacity:0; transform:translateY(30px); }
    @media (min-width:768px){ .ge-image-wrap{ flex:1.2; max-width:none; } }
    .ge-image-wrap img{ display:block; width:100%; height:auto; object-fit:contain; }
  
    .ge-hotspot{
      position:absolute; width:36px; height:36px; border-radius:50%;
      background:var(--color-hotspot-bg); border:2px solid var(--color-accent);
      color:var(--color-accent); font-size:14px; font-weight:700;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:var(--transition);
      transform:translate(-50%,-50%) scale(0);
      z-index:10; opacity:0;
    }
    @media (min-width:768px){ .ge-hotspot{ width:42px; height:42px; font-size:16px; } }
  
    .ge-hotspot::before{
      content:""; position:absolute; inset:0; border-radius:50%;
      border:2px solid var(--color-accent);
      animation:ge-pulse 2s ease-out infinite; opacity:0;
    }
    .ge-hotspot:hover{ background:var(--color-accent); color:#fff; transform:translate(-50%,-50%) scale(1.1); }
    .ge-hotspot:focus{ outline:none; box-shadow:0 0 0 3px var(--color-accent-glow); }
    .ge-hotspot.active{ background:var(--color-accent); color:#fff; box-shadow:0 0 20px var(--color-accent-glow); }
    .ge-hotspot.active::before{ animation:none; }
  
    @keyframes ge-pulse{
      0%{ transform:scale(1); opacity:.8; }
      100%{ transform:scale(2); opacity:0; }
    }
  
    /* hotspot positions */
    .ge-hotspot[data-index="0"]{ top: 46%;right: 22%; }
    .ge-hotspot[data-index="1"]{ top:49%; right:50%; }
    .ge-hotspot[data-index="2"]{ top:22%; right:45%; }
    .ge-hotspot[data-index="3"]{ top:40%; right:80%; }
    .ge-hotspot[data-index="4"]{ top:82%; right:22%; }
  
    .ge-details{
      width:100%; max-width:500px; background:var(--color-bg-card);
      border-radius:var(--radius-lg); padding:24px; border:1px solid var(--color-border);
      box-shadow:var(--shadow-card);
      opacity:0; transform:translateY(30px);
    }
    @media (min-width:768px){
      .ge-details{ flex:0.8; max-width:400px; position:sticky; top:40px; padding:35px; }
    }
    @media (min-width:1200px){ .ge-details{ max-width:450px; padding:40px; } }
  
    .ge-details-image{ width:100%; max-width:280px; margin:0 auto 20px; border-radius:var(--radius-md); overflow:hidden; }
    .ge-details-img{ width:100%; max-height:180px; display:block; object-fit:cover; transition:opacity .3s ease; }
  
    .ge-details-title{ font-size:clamp(1.2rem,3vw,1.5rem); font-weight:700; color:var(--color-text); margin:0 0 16px; line-height:1.4; }
    .ge-details-desc{ font-size:1rem; color:var(--color-text-muted); line-height:1.8; margin:0 0 24px; }
  
    .ge-nav-pills{ display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
    .ge-nav-pill{
      width:40px; height:40px; border-radius:50%;
      background:transparent;
      border:2px solid rgba(217,94,22,.3);
      color:var(--color-text-muted);
      font-size:14px; font-weight:600;
      cursor:pointer; transition:var(--transition);
      display:flex; align-items:center; justify-content:center;
    }
    .ge-nav-pill:hover{ border-color:var(--color-accent); color:var(--color-accent); }
    .ge-nav-pill:focus{ outline:none; box-shadow:0 0 0 3px var(--color-accent-glow); }
    .ge-nav-pill.active{ background:var(--color-accent); border-color:var(--color-accent); color:#fff; }
    `;
  
    // ================== HTML ==================
    function sectionHTML() {
      // Build hotspots + pills 0..4
      const hotspots = FEATURES.map((f, i) => {
        const label = f.aria || f.title || `ميزة ${i + 1}`;
        return `<button class="ge-hotspot" data-index="${i}" aria-label="${escapeHtml(label)}" aria-pressed="false">${i + 1}</button>`;
      }).join("");
  
      const pills = FEATURES.map((_, i) =>
        `<button class="ge-nav-pill" data-index="${i}" aria-label="الميزة رقم ${i + 1}">${i + 1}</button>`
      ).join("");
  
      const first = FEATURES[0];
  
      return `
        <section id="${SECTION_ID}" class="theme-light" aria-label="استكشف مميزات الشواية">
          <header class="ge-header">
            <h2>استكشف مميزات الشواية</h2>
            <p>اضغط على المؤشرات على الشواية لتتعرف على كل ميزة .</p>
          </header>
  
          <div class="ge-content">
            <div class="ge-image-wrap">
              <img src="${GRILL_IMAGE}" alt="شواية الفحم الاحترافية">
              ${hotspots}
            </div>
  
            <div class="ge-details">
              <div class="ge-details-image">
                <img class="ge-details-img" src="${first.img}" alt="صورة الميزة">
              </div>
  
              <h3 class="ge-details-title">${escapeHtml(first.title)}</h3>
              <p class="ge-details-desc">${escapeHtml(first.desc)}</p>
  
              <div class="ge-nav-pills">
                ${pills}
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  
    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = CSS_INLINE;
      document.head.appendChild(s);
    }
  
    function mountOnce() {
      if (document.getElementById(SECTION_ID)) return true;
  
      const anchor = document.querySelector(BEFORE_SEL);
      if (!anchor) return false;
  
      ensureStyle();
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      anchor.insertAdjacentElement("afterend", node);
  
      wireUp(node);
      return true;
    }
  
    function wireUp(root) {
      const section = root;
      const hotspots = Array.from(section.querySelectorAll(".ge-hotspot"));
      const pills = Array.from(section.querySelectorAll(".ge-nav-pill"));
  
      const imgEl = section.querySelector(".ge-details-img");
      const titleEl = section.querySelector(".ge-details-title");
      const descEl = section.querySelector(".ge-details-desc");
  
      function setActive(idx, fromUser = false) {
        const feat = FEATURES[idx];
        if (!feat) return;
  
        // ripple feedback
        if (fromUser) {
          const btn = section.querySelector(`.ge-hotspot[data-index="${idx}"]`);
          if (btn) {
            btn.classList.remove("clicked");
            // force reflow
            void btn.offsetWidth;
            btn.classList.add("clicked");
            setTimeout(() => btn.classList.remove("clicked"), 650);
          }
        }
  
        // updating classes
        imgEl?.classList.add("changing");
        titleEl?.classList.add("changing");
        descEl?.classList.add("changing");
  
        setTimeout(() => {
          if (imgEl) imgEl.src = feat.img;
          if (titleEl) titleEl.textContent = feat.title;
          if (descEl) descEl.textContent = feat.desc;
  
          imgEl?.classList.remove("changing");
          titleEl?.classList.remove("changing");
          descEl?.classList.remove("changing");
        }, 180);
  
        hotspots.forEach((b) => {
          const i = Number(b.dataset.index);
          const isActive = i === idx;
          b.classList.toggle("active", isActive);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
  
        pills.forEach((b) => {
          const i = Number(b.dataset.index);
          b.classList.toggle("active", i === idx);
        });
      }
  
      hotspots.forEach((btn) => {
        btn.addEventListener("click", () => setActive(Number(btn.dataset.index), true));
      });
      pills.forEach((btn) => {
        btn.addEventListener("click", () => setActive(Number(btn.dataset.index), true));
      });
  
      // default active
      setActive(0);
  
      // Observer reveal
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              section.classList.add("ge-visible");
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.25, rootMargin: "0px 0px -10%" }
      );
      io.observe(section);
    }
  
    // Boot (handles hydration + soft navigation)
    function boot() {
      if (mountOnce()) return;
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  
  (() => {
    const SECTION_ID = "coal-360";
    const STYLE_ID = "coal-360-inline-style";
  
    // Insert after previous section (your grill explorer)
    const AFTER_SEL = "#grill-explorer";
  
    // Assets / numbers
    const VIDEO_SRC =
      "https://selia-tech.github.io/videos/video-2025-12-20T04-41-31-288Z-i6tkdb.mp4";
  
    // ✅ WebP fallback (show this when autoplay is blocked / saver mode)
    const FALLBACK_WEBP =
      "https://cdn.files.salla.network/homepage/1333909099/15e85640-79bc-41a1-9079-74f9ab5ab31d.gif"; // <-- replace
  
    const TARGET_NUMBER = 60000;
  
    // ---------------- CSS (injected) ----------------
    const CSS = `
    /* ===== Coal 360 Section ===== */
    #${SECTION_ID}{
      background:#f5f5f5;
      padding:60px 20px;
    }
  
    #${SECTION_ID} .coal-sticky{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
    }
  
    #${SECTION_ID} .coal-media{
      position:relative;
      width:auto;
      max-width:300px;
      margin-bottom:10px;
    }
  
    #${SECTION_ID} .coal-video,
    #${SECTION_ID} .coal-fallback{
      width:100%;
      height:auto;
      display:block;
      object-fit:contain;
      opacity:0;
      transform:scale(.9);
      transition:opacity 1.4s ease .2s, transform 1.4s ease .2s;
    }
  
    /* default: show video */
    #${SECTION_ID} .coal-fallback{ display:none; }
  
    /* when autoplay blocked => show fallback webp */
    #${SECTION_ID}.coal-fallback-on .coal-video{ display:none; }
    #${SECTION_ID}.coal-fallback-on .coal-fallback{ display:block; }
  
    #${SECTION_ID}.coal-visible .coal-video,
    #${SECTION_ID}.coal-visible .coal-fallback{
      opacity:1;
      transform:scale(1);
    }
  
    #${SECTION_ID} .coal-content{
      text-align:center;
      direction:rtl;
      opacity:0;
      transform:translateY(20px);
      transition:opacity 1.2s ease .8s, transform 1.2s ease .8s;
    }
  
    #${SECTION_ID}.coal-visible .coal-content{
      opacity:1;
      transform:translateY(0);
    }
  
    #${SECTION_ID} .coal-subtitle{
      font-size:clamp(2rem, 6vw, 4rem);
      color:var(--color-text, #1a1a1a);
      margin:0 0 16px;
      font-weight:400;
    }
  
    #${SECTION_ID} .coal-number{
      font-size:clamp(3rem, 10vw, 5rem);
      font-weight:700;
      color:var(--color-text, #1a1a1a);
      line-height:1;
      margin:0 0 8px;
    }
  
    #${SECTION_ID} .coal-counter{
      display:inline-block;
      min-width:1ch;
    }
  
    #${SECTION_ID} .coal-label{
      font-size:clamp(1.1rem, 6vw, 2.2rem);
      color:var(--color-text, #1a1a1a);
      font-weight:500;
      margin:0;
    }
  
    @media (max-width:768px){
      #${SECTION_ID}{ padding:40px 20px; }
      #${SECTION_ID} .coal-media{ max-width:200px; }
      #${SECTION_ID} .coal-video,
      #${SECTION_ID} .coal-fallback{
        height:17vh;
        width:auto;
        max-width:200px;
        margin:0 auto;
      }
    }
    `;
  
    // ---------------- HTML ----------------
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" aria-label="coal 360">
          <div class="coal-sticky">
            <div class="coal-media" aria-label="coal animation">
              <video class="coal-video" muted playsinline loop preload="auto">
                <source src="${VIDEO_SRC}" type="video/mp4">
              </video>
  
              <img class="coal-fallback" src="${FALLBACK_WEBP}" alt="coal animation" loading="lazy" decoding="async" />
            </div>
  
            <div class="coal-content">
              <p class="coal-subtitle">فخورين بخدمة أكثر من</p>
              <p class="coal-number"><span class="coal-counter" data-target="${TARGET_NUMBER}">0</span>+</p>
              <p class="coal-label">عميل</p>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    // ---------------- helpers ----------------
    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  
    function mountOnce() {
      if (document.getElementById(SECTION_ID)) return true;
  
      const after = document.querySelector(AFTER_SEL);
      if (!after) return false;
  
      ensureStyle();
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      after.insertAdjacentElement("afterend", node);
  
      wireUp(node);
      return true;
    }
  
    function wireUp(section) {
      const coalVideo = section.querySelector(".coal-video");
      const counterEl = section.querySelector(".coal-counter");
  
      let hasAnimated = false;
      const targetNumber = parseInt(counterEl?.dataset?.target || "", 10) || TARGET_NUMBER;
      const animationDuration = 2000;
  
      function animateCounter() {
        if (!counterEl) return;
        const startTime = performance.now();
  
        function update(t) {
          const elapsed = t - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentNumber = Math.floor(easeOut * targetNumber);
  
          counterEl.textContent = currentNumber.toLocaleString("en-US");
          if (progress < 1) requestAnimationFrame(update);
        }
  
        requestAnimationFrame(update);
      }
  
      async function tryPlayOrFallback() {
        if (!coalVideo) {
          section.classList.add("coal-fallback-on");
          return;
        }
  
        // iOS/Safari friendly flags
        coalVideo.muted = true;
        coalVideo.playsInline = true;
        coalVideo.setAttribute("playsinline", "");
        coalVideo.setAttribute("muted", "");
  
        try {
          const p = coalVideo.play();
          if (p && typeof p.then === "function") await p;
  
          // Autoplay works => keep video
          section.classList.remove("coal-fallback-on");
        } catch (e) {
          // Autoplay blocked (battery/data saver, user settings...) => show WebP
          section.classList.add("coal-fallback-on");
        }
      }
  
      function startAnimations() {
        if (hasAnimated) return;
        hasAnimated = true;
  
        section.classList.add("coal-visible");
  
        // Try autoplay; if blocked, fallback webp
        tryPlayOrFallback();
  
        setTimeout(animateCounter, 400);
      }
  
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              startAnimations();
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.3 }
      );
  
      io.observe(section);
    }
  
    // ---------------- boot ----------------
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  (() => {
    const SECTION_ID = "post-coal-mobile-banner";
    const STYLE_ID = "post-coal-mobile-banner-style";
  
    // Insert AFTER coal section
    const AFTER_SEL = ".s-block--images-gallery";
  
    const IMG_SRC =
      "https://cdn.files.salla.network/homepage/1333909099/aa295740-367b-418f-be28-cf46f0b8b2fc.webp";
  
    // optional: click action (leave empty to disable)
    const HREF = ""; // e.g. "/products/123" or "https://..."
  
    const CSS = `
    #${SECTION_ID}{
      background:transparent;
      margin:0;
      padding:0;
    }
  
    /* wrapper handles desktop sizing */
    #${SECTION_ID} .pcb-wrap{
      width:100%;
      margin:0 auto;
      padding:0 16px;            /* desktop side padding */
      max-width:800px;          /* not full width on desktop */
    }
  
    #${SECTION_ID} .pcb-link{
      display:block;
      text-decoration:none;
      border-radius:18px;
      overflow:hidden;
    }
  
    #${SECTION_ID} .pcb-img{
      display:block;
      width:100%;
      height:auto;
      object-fit:cover;
    }
  
    /* ✅ MOBILE: full-bleed (full screen width) */
    @media (max-width:768px){
      #${SECTION_ID} .pcb-wrap{
        max-width:none;
        padding:0;
      }
      #${SECTION_ID} .pcb-link{
        border-radius:0;
      }
      #${SECTION_ID} .pcb-img{
        width:100vw;
        max-width:100vw;
  
      }
    }
    `;
  
    function sectionHTML() {
      const img = `<img class="pcb-img" src="${IMG_SRC}" alt="" loading="lazy" decoding="async">`;
  
      return `
        <section id="${SECTION_ID}" aria-label="Banner">
          <div class="pcb-wrap">
            ${
              HREF
                ? `<a class="pcb-link" href="${HREF}" aria-label="Open banner">${img}</a>`
                : `<div class="pcb-link" role="img" aria-label="Banner">${img}</div>`
            }
          </div>
        </section>
      `.trim();
    }
  
    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return;
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  
    function mountOnce() {
      if (document.getElementById(SECTION_ID)) return true;
  
      const after = document.querySelector(AFTER_SEL);
      if (!after) return false;
  
      ensureStyle();
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      after.insertAdjacentElement("afterend", node);
      return true;
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  
  
  (() => {
    const SECTION_ID = "bento-features";
    const VERSION = "v2-dual-handles-fixed-direction-2026-01-04";
  
    const AFTER_PRIMARY = ".s-block--fast-checkout";
    const AFTER_FALLBACK = "#coal-360";
  
    const ASSETS = {
      grillLines:
        "https://cdn.files.salla.network/homepage/1333909099/4155606e-0b0c-4a62-a351-15d6a696a7d9.webp",
      ashAnimated:
        "https://cdn.files.salla.network/homepage/1333909099/1c3be367-1392-4931-a52a-0ff4bf03e2c3.gif",
      smokerGif:
        "https://cdn.files.salla.network/homepage/1333909099/4b5b78a8-7322-4b18-a7a9-79865142d101.gif",
      tempIcon:
        "https://cdn.files.salla.network/homepage/1333909099/80c42f91-97c1-43dd-9306-08d1b2a8e2bd.webp",
      sideGif:
        "https://cdn.files.salla.network/homepage/1333909099/823b54be-9550-48d4-904e-8ba19f71b972.gif",
    };
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="bento" data-salla-inject="1" data-bento-version="${VERSION}" aria-label="Bento Features" dir="rtl">
          <header class="bento-header">
            <span class="bento-label">مزايا أكثر</span>
            <h2>ليش تختار شوايتنا؟</h2>
            <p>مهتمين بكل التفاصيل الي تعطيك افضل تجربة شواء</p>
          </header>
  
          <div class="bento-grid">
            <div class="bento-card card-large card-heat">
              <h3>صاجتين فحم مزدوجة لشواء وجبتين في نفس الوقت</h3>
              <p class="heat-subtext">صاجتين فحم منفصلتين بمقابض رفع مستقلة – ارفع أو أنزل كل جهة على حدة</p>
  
              <div class="heat-image-container">
                <img src="${ASSETS.grillLines}" alt="شبك الشواية" class="heat-grill-image" loading="lazy" decoding="async">
  
                <div class="coal-glow coal-glow-left" aria-hidden="true"></div>
                <div class="coal-glow coal-glow-right" aria-hidden="true"></div>
  
                <div class="heat-labels-overlay" aria-hidden="true">
                  <div class="heat-label heat-label-right">
                    يمين
                    <span class="heat-label-value" data-side="right">متوسط</span>
                  </div>
                  <div class="heat-label heat-label-left">
                    يسار
                    <span class="heat-label-value" data-side="left">متوسط</span>
                  </div>
                </div>
              </div>
  
              <div class="dual-controls-container">
                <div class="handle-control" data-side="right">
                  <div class="handle-header">
                    <div class="handle-title">المقبض اليمين</div>
                    <span class="handle-value" data-side="right">متوسط</span>
                  </div>
                  <div class="handle-slider-wrap">
                    <span class="slider-label">قريب</span>
                    <input type="range" class="handle-slider" data-side="right" min="0" max="100" value="50">
                    <span class="slider-label">بعيد</span>
                  </div>
                </div>
  
                <div class="handle-control" data-side="left">
                  <div class="handle-header">
                    <div class="handle-title">المقبض اليسار</div>
                    <span class="handle-value" data-side="left">متوسط</span>
                  </div>
                  <div class="handle-slider-wrap">
                    <span class="slider-label">قريب</span>
                    <input type="range" class="handle-slider" data-side="left" min="0" max="100" value="50">
                    <span class="slider-label">بعيد</span>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bento-card card-media-bottom">
              <h3>درج تنظيف رماد سريع</h3>
              <img class="bento-card-media-bottom" src="${ASSETS.ashAnimated}" alt="درج تنظيف الرماد" loading="lazy" decoding="async">
            </div>
  
            <div class="bento-card card-media">
              <img class="bento-card-media-top" src="${ASSETS.smokerGif}" alt="شواية وسموكر" loading="lazy" decoding="async">
              <div class="bento-card-content">
                <h3>رفوف جانبية قابلة للسفط </h3>
              </div>
            </div>
  
            <div class="bento-card card-thermometer">
              <div class="thermometer-content">
                <h3>جهاز قياس حرارة مدمج</h3>
                <div class="temp-counter">
                  <span class="temp-number" data-target="350">0</span>
                  <span class="temp-unit">°C</span>
                </div>
              </div>
              <div class="thermometer-image">
                <img src="${ASSETS.tempIcon}" alt="جهاز قياس الحرارة" loading="lazy" decoding="async">
              </div>
            </div>
  
            <div class="bento-card card-side-by-side">
              <div class="card-side-text">
                <h3>فُتحات تهوية جانبية</h3>
              </div>
              <div class="card-side-media">
                <img src="${ASSETS.sideGif}" alt="فُتحات تهوية جانبية" class="card-side-gif" loading="lazy" decoding="async">
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function findAnchor() {
      return document.querySelector(AFTER_PRIMARY) || document.querySelector(AFTER_FALLBACK);
    }
  
    function upsert() {
      const existing = document.getElementById(SECTION_ID);
      const anchor = findAnchor();
  
      if (existing && existing.getAttribute("data-bento-version") === VERSION) return true;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      if (existing) {
        existing.replaceWith(node);
        wireUp(node);
        return true;
      }
  
      if (!anchor) return false;
      anchor.insertAdjacentElement("afterend", node);
      wireUp(node);
      return true;
    }
  
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  
    function wireUp(section) {
      // Entrance animation
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            section.classList.add("bento-visible");
            io.unobserve(section);
          });
        },
        { threshold: 0.15 }
      );
      io.observe(section);
  
      // ===== Dual Heat Control (FIXED) =====
      const glowLeft = section.querySelector(".coal-glow-left");
      const glowRight = section.querySelector(".coal-glow-right");
  
      const valueLeft = section.querySelector('.handle-value[data-side="left"]');
      const valueRight = section.querySelector('.handle-value[data-side="right"]');
  
      const labelLeftValue = section.querySelector('.heat-label-value[data-side="left"]');
      const labelRightValue = section.querySelector('.heat-label-value[data-side="right"]');
  
      const sliders = Array.from(section.querySelectorAll(".handle-slider"));
  
      // 0 = بعيد (cool) ... 100 = قريب (hot)
      function getHeatLabelFromValue(v) {
        if (v <= 20) return "بعيد";
        if (v <= 40) return "منخفض";
        if (v <= 60) return "متوسط";
        if (v <= 80) return "مرتفع";
        return "قريب جداً";
      }
  
      function getGlowStylesByIntensity(intensity) {
        // intensity: 0 cool -> 1 hot
        const i = clamp(intensity, 0, 1);
  
        const baseSize = 35;
        const maxSize = 90;
        const size = baseSize + (maxSize - baseSize) * i;
  
        let glowColor, outerGlow, boxShadow, pulseOpacity;
  
        if (i <= 0.2) {
          glowColor = "radial-gradient(circle, #6b3a1a 0%, #3a1f0f 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(107, 58, 26, 0.15) 0%, transparent 70%)";
          boxShadow = `0 0 ${10 + i * 20}px rgba(107, 58, 26, 0.3)`;
          pulseOpacity = 0.1;
        } else if (i <= 0.4) {
          glowColor = "radial-gradient(circle, #8b4513 0%, #5a2d0a 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(139, 69, 19, 0.25) 0%, transparent 70%)";
          boxShadow = `0 0 ${15 + i * 25}px rgba(139, 69, 19, 0.4)`;
          pulseOpacity = 0.2;
        } else if (i <= 0.6) {
          glowColor = "radial-gradient(circle, #e64a19 0%, #bf360c 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(230, 74, 25, 0.35) 0%, transparent 70%)";
          boxShadow = `0 0 ${25 + i * 30}px rgba(230, 74, 25, 0.5)`;
          pulseOpacity = 0.4;
        } else if (i <= 0.8) {
          glowColor = "radial-gradient(circle, #ff6d00 0%, #e65100 50%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(255, 109, 0, 0.45) 0%, transparent 70%)";
          boxShadow = `0 0 ${40 + i * 35}px rgba(255, 109, 0, 0.6)`;
          pulseOpacity = 0.6;
        } else {
          glowColor =
            "radial-gradient(circle, #ffab00 0%, #ff6d00 40%, #e65100 70%, transparent 100%)";
          outerGlow = "radial-gradient(circle, rgba(255, 171, 0, 0.6) 0%, transparent 70%)";
          boxShadow = `0 0 ${60 + i * 40}px rgba(255, 171, 0, 0.7)`;
          pulseOpacity = 0.85;
        }
  
        return { size, glowColor, outerGlow, boxShadow, pulseOpacity };
      }
  
      function applyGlow(glowEl, sliderValue) {
        if (!glowEl) return;
        const v = clamp(Number(sliderValue) || 0, 0, 100);
  
        // FIX: intensity grows with value (0 far/cool -> 100 near/hot)
        const intensity = v / 100;
  
        const styles = getGlowStylesByIntensity(intensity);
  
        glowEl.style.width = `${styles.size}px`;
        glowEl.style.height = `${styles.size}px`;
        glowEl.style.setProperty("--glow-color", styles.glowColor);
        glowEl.style.setProperty("--glow-outer", styles.outerGlow);
        glowEl.style.setProperty("--glow-pulse-opacity", styles.pulseOpacity);
        glowEl.style.boxShadow = styles.boxShadow;
      }
  
      function updateSide(side, sliderValue) {
        const v = clamp(Number(sliderValue) || 0, 0, 100);
        const label = getHeatLabelFromValue(v);
  
        if (side === "left") {
          if (valueLeft) valueLeft.textContent = label;
          if (labelLeftValue) labelLeftValue.textContent = label;
          applyGlow(glowLeft, v);
        } else {
          if (valueRight) valueRight.textContent = label;
          if (labelRightValue) labelRightValue.textContent = label;
          applyGlow(glowRight, v);
        }
      }
  
      sliders.forEach((s) => {
        // Force LTR so RTL theme doesn't invert the thumb
        s.setAttribute("dir", "ltr");
        s.style.direction = "ltr";
  
        const side = s.getAttribute("data-side");
        const onInput = () => updateSide(side, s.value);
  
        s.addEventListener("input", onInput, { passive: true });
        onInput();
      });
  
      // ===== Temperature counter =====
      const tempEl = section.querySelector(".temp-number");
      if (tempEl) {
        let started = false;
        let currentTemp = 0;
        const base = Number(tempEl.dataset.target || 350);
        const range = 30;
  
        function rampToBase() {
          const start = performance.now();
          const duration = 2000;
  
          const tick = (t) => {
            const p = Math.min((t - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - p, 3);
            currentTemp = Math.floor(easeOut * base);
            tempEl.textContent = String(currentTemp);
  
            if (p < 1) requestAnimationFrame(tick);
            else fluctuate();
          };
  
          requestAnimationFrame(tick);
        }
  
        function fluctuate() {
          let goingUp = false;
  
          const loop = () => {
            const target = goingUp
              ? base + Math.random() * range
              : base - Math.random() * range;
  
            const from = currentTemp;
            const start = performance.now();
            const duration = 1500 + Math.random() * 1000;
  
            const tick = (t) => {
              const p = Math.min((t - start) / duration, 1);
              const ease = 0.5 - Math.cos(p * Math.PI) / 2;
              currentTemp = Math.floor(from + (target - from) * ease);
              tempEl.textContent = String(currentTemp);
  
              if (p < 1) requestAnimationFrame(tick);
              else {
                goingUp = !goingUp;
                setTimeout(loop, 500 + Math.random() * 500);
              }
            };
  
            requestAnimationFrame(tick);
          };
  
          loop();
        }
  
        const tempIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting || started) return;
              started = true;
              setTimeout(rampToBase, 600);
              tempIO.unobserve(section);
            });
          },
          { threshold: 0.2 }
        );
  
        tempIO.observe(section);
      }
    }
  
    function boot() {
      if (upsert()) return;
      const mo = new MutationObserver(() => {
        if (upsert()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(upsert, 120);
    });
  })();
  
  
  (() => {
    const SECTION_ID = "dimensions-section";
  
    // Insert AFTER whichever exists first
    const AFTER_SELECTORS = [
      "#bento-features",
      "#coal-banner",
      "#coal-360",
      "#grill-explorer",
    ];
  
    
    const ASSETS = {
      main: "https://cdn.files.salla.network/homepage/1333909099/55dd52f0-72f4-43fe-85d9-f79792f69e8b.webp",
      areaIcon: "https://cdn.files.salla.network/homepage/1333909099/81a47861-4fef-48d4-ac2e-5a96e2a1ee01.webp",
      tempIcon: "https://cdn.files.salla.network/homepage/1333909099/f993b5dc-7e6c-45b1-88de-ee15d1115e91.webp",
      steelIcon: "https://cdn.files.salla.network/homepage/1333909099/46706b8c-03e1-43af-9e74-d02a7eeb5061.webp",
      chickenIcon: "https://cdn.files.salla.network/homepage/1333909099/67379cbb-1dab-4132-bf90-3fc09458131f.webp",
      kebabIcon: "https://cdn.files.salla.network/homepage/1333909099/dcb189fc-3237-4fd4-8d2f-6b0c66eb3dc9.webp",
      burgerIcon: "https://cdn.files.salla.network/homepage/1333909099/e45fbad0-2a3c-4fd3-acad-c72904f36d7b.webp",
    };
  
    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  
    function sectionHTML() {
      return `
  <section id="${SECTION_ID}" data-salla-inject="1" aria-label="المساحة والأبعاد" dir="rtl">
    <div class="dimensions-container">
      <h2 class="dimensions-title">المساحة والأبعاد</h2>
  
      <div class="grill-dimensions-wrap">
        <img src="${ASSETS.main}" alt="شواية الفحم - العرض 120 سم × الإرتفاع 107 سم" class="grill-main-image" loading="lazy">
      </div>
  
      <div class="feature-cards-row">
        <div class="rust-resistant-marker" aria-hidden="true">
          <span class="rust-resistant-text">حديد مقاوم للصدأ</span>
          <svg class="rust-resistant-arrow" width="22" height="50" viewBox="0 0 22 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="arrow-path" d="M20.7749 20.3821L21.1678 20.8999L21.6745 20.5155L21.3011 20.0006L20.7749 20.3821ZM6.27491 31.3828L5.88205 30.865L5.66169 31.0322L5.62937 31.3069L6.27491 31.3828ZM3.7647 48.7836C3.98714 49.0654 4.39588 49.1135 4.67764 48.8911L9.26926 45.2662C9.55103 45.0438 9.59912 44.635 9.37668 44.3533C9.15424 44.0715 8.7455 44.0234 8.46374 44.2458L4.3823 47.4679L1.16021 43.3865C0.937772 43.1047 0.529036 43.0566 0.247272 43.2791C-0.0344934 43.5015 -0.0825873 43.9103 0.139852 44.192L3.7647 48.7836ZM6.27491 0.381318L5.74866 0.762837L20.2486 20.7636L20.7749 20.3821L21.3011 20.0006L6.80117 -0.000200394L6.27491 0.381318ZM20.7749 20.3821L20.382 19.8643L5.88205 30.865L6.27491 31.3828L6.66778 31.9006L21.1678 20.8999L20.7749 20.3821ZM6.27491 31.3828L5.62937 31.3069L3.62934 48.3049L4.27488 48.3809L4.92043 48.4568L6.92046 31.4588L6.27491 31.3828Z" fill="white"/>
          </svg>
        </div>
  
        <div class="feature-card">
          <div class="feature-card-icon">
            <img src="${ASSETS.areaIcon}" alt="مساحة الطهي" loading="lazy">
          </div>
          <div class="feature-card-label">مساحة الطهي</div>
          <div class="feature-card-value feature-card-value--small">3444 سم²</div>
        </div>
  
        <div class="feature-card">
          <div class="feature-card-icon">
            <img src="${ASSETS.tempIcon}" alt="أقصى حرارة" loading="lazy">
          </div>
          <div class="feature-card-label">أقصى حرارة</div>
          <div class="feature-card-value">315°C</div>
        </div>
  
        <div class="feature-card">
          <div class="feature-card-icon">
            <img src="${ASSETS.steelIcon}" alt="معدن الشبك" loading="lazy">
          </div>
          <div class="feature-card-label">معدن الشبك</div>
          <div class="feature-card-value">ستانلس ستيل</div>
        </div>
      </div>
  
      <div class="capacity-cards-row">
        <div class="capacity-card">
          <div class="capacity-card-icon">
            <img src="${ASSETS.chickenIcon}" alt="دجاج" loading="lazy">
          </div>
          <div class="capacity-card-value">11-9 دجاجات</div>
        </div>
  
        <span class="capacity-divider">أو</span>
  
        <div class="capacity-card">
          <div class="capacity-card-icon">
            <img src="${ASSETS.kebabIcon}" alt="أسياخ كباب" loading="lazy">
          </div>
          <div class="capacity-card-value">20-18 أسياخ كباب</div>
        </div>
  
        <span class="capacity-divider">أو</span>
  
        <div class="capacity-card">
          <div class="capacity-card-icon">
            <img src="${ASSETS.burgerIcon}" alt="برجر" loading="lazy">
          </div>
          <div class="capacity-card-value">30-22 برجر</div>
        </div>
      </div>
  
      <div class="cta-section">
        <button class="cta-button" type="button" onclick="window.location.href='https://bckyrdbbq.com/pages/lp1304367330/766788790';">المقاس الصغير</button>
  
        <div class="cta-marker" aria-hidden="true">
          <svg class="cta-arrow" viewBox="0 0 74 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="arrow-path" d="M19.0093 5.16342C16.926 5.253 14.9745 5.12632 13.1598 5.53098C8.40032 6.5923 5.82982 9.49033 5.52749 13.9729C5.15393 19.5115 7.34378 24.4116 10.2493 29.0758C11.3196 30.7939 12.6293 32.3855 14.36 33.852C14.7041 31.7978 15.0482 29.7436 15.4349 27.4348C17.1128 27.6061 18.7306 27.7712 20.753 27.9777C19.9592 33.045 19.177 38.0382 18.3664 43.213C12.7992 42.502 7.47486 41.822 1.82926 41.1011C2.08401 39.4611 2.32313 37.9218 2.59907 36.1454C4.78962 36.4312 6.8005 36.6937 9.22128 37.0095C8.76103 36.2974 8.50828 35.8384 8.18898 35.4226C3.8304 29.7465 0.671883 23.6136 0.0660916 16.5752C-0.77642 6.78641 6.51579 -0.214472 17.2579 0.00524035C22.264 0.107631 26.709 1.77914 30.8578 4.19058C39.7826 9.37799 46.5915 16.5406 52.8969 24.1569C54.6626 26.2897 72.0546 48.5814 73.8677 50.9336C72.2615 51.872 69.8093 54.6383 69.8093 54.6383C66.2047 50.383 46.8611 24.8459 43.019 21.0212C38.9053 16.9262 34.4719 13.0064 29.6552 9.63587C26.6752 7.55059 22.7205 6.63177 19.0093 5.16342Z" fill="#F5F5F5"/>
          </svg>
          <span class="cta-question">${escapeHtml("ودك بمقاس اصغر؟")}</span>
        </div>
      </div>
    </div>
  </section>
  `.trim();
    }
  
    function findAfterAnchor() {
      for (const sel of AFTER_SELECTORS) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    }
  
    function mountOnce() {
      const existing = document.getElementById(SECTION_ID);
  
      // if our injected one exists -> done
      if (existing && existing.getAttribute("data-salla-inject") === "1") return true;
  
      // if native exists (not ours) -> don't duplicate
      if (existing && existing.getAttribute("data-salla-inject") !== "1") return true;
  
      const after = findAfterAnchor();
      if (!after) return false;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      after.insertAdjacentElement("afterend", node);
      wireUp(node);
  
      return true;
    }
  
    function wireUp(section) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              section.classList.add("visible");
              io.unobserve(section);
            }
          });
        },
        { threshold: 0.2 }
      );
  
      io.observe(section);
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  
  
  (function () {
    const SECTION_SEL = '.s-block--comparison';
    const LOGO_URL = 'https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/xQmPP/e7738694-44bb-4f25-acb3-82f2f68282e7-500x463.94611727417-6Ggr3G53AwWWdIc4aNkSjKktnuNbv9HZv90AjYv1.jpg';
  
    function patchComparison() {
      document.querySelectorAll(SECTION_SEL).forEach(sec => {
        if (sec.dataset.patched === '1') return;
  
        // 1) remove top title + buy button
        sec.querySelector('.title-wrapper')?.remove();
        sec.querySelector('.button-wrap')?.remove();
  
        // 2) put title into the FIRST <th> (was empty)
        const ths = sec.querySelectorAll('thead th');
        if (ths.length >= 3) {
          ths[0].textContent = 'ليه عالم الشواء؟';
  
        
          ths[1].innerHTML =
            `<img src="${LOGO_URL}" alt="lafeminite" class="cmp-logo" loading="lazy">`;
        }
  
        sec.dataset.patched = '1';
      });
    }
  
    function addCssOnce() {
      if (document.getElementById('cmpPatchCss')) return;
      const s = document.createElement('style');
      s.id = 'cmpPatchCss';
      s.textContent = `
        .s-block--comparison thead th { vertical-align: middle; }
        .s-block--comparison thead th:first-child {
          font-weight: 700; text-align: center;
    
        }
        .s-block--comparison .cmp-logo {
          height: auto; width: 230px; display: inline-block;
        }
        @media (max-width:640px){ .s-block--comparison .cmp-logo{ height: auto;
          width: 199px; } }
      `;
      document.head.appendChild(s);
    }
  
    function run() {
      addCssOnce();
      patchComparison();
      const mo = new MutationObserver(patchComparison);
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  
    document.addEventListener('salla:pageUpdated', () => setTimeout(run, 50));
  })();
  
  (() => {
    const SECTION_ID = "prefooter-inject";
    const SEL = `#${SECTION_ID}`;
  
    // Insert AFTER this "last" section (change as you like)
    const LAST = ".s-block--faqs"; // or "#bento-features" / "#coal-banner" / "#coal-360"
  
    // Scroll-to target
    const JUMP = ".s-block--fast-checkout";
  
    // Assets
    const VIDEO_SRC =
      "https://selia-tech.github.io/videos/video-2025-12-21T08-17-22-012Z-xns8yy.mp4"; // <-- replace
    const FALLBACK_IMG =
      "https://cdn.files.salla.network/homepage/1333909099/d46b60ee-a5ae-45f9-9506-3ce56dd98d73.webp"; // <-- replace
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="prefooter" data-salla-inject="1" aria-label="Prefooter" dir="rtl">
          <div class="prefooter-media" aria-hidden="true">
            <video class="prefooter-video" muted playsinline loop preload="auto" poster="${FALLBACK_IMG}">
              <source src="${VIDEO_SRC}" type="video/mp4">
            </video>
  
            <img class="prefooter-fallback" src="${FALLBACK_IMG}" alt="" loading="lazy">
          </div>
  
          <div class="prefooter-overlay" aria-hidden="true"></div>
  
          <div class="prefooter-content">
            <h2 class="prefooter-title">
              الحق الشتاء وعيش<br>
              تجربة الشوي المتكاملة
            </h2>
            <a href="#" class="prefooter-cta">اطلب الان</a>
          </div>
        </section>
      `.trim();
    }
  
    function mountOnce() {
      const existing = document.querySelector(SEL);
      if (existing) return true;
  
      const anchor = document.querySelector(LAST);
      if (!anchor) return false;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      anchor.insertAdjacentElement("afterend", node);
      wireUp(node);
  
      return true;
    }
  
    function wireUp(section) {
      const video = section.querySelector(".prefooter-video");
      const fallbackImg = section.querySelector(".prefooter-fallback");
      const cta = section.querySelector(".prefooter-cta");
  
      // preload fallback image
      if (fallbackImg && fallbackImg.src) {
        const img = new Image();
        img.src = fallbackImg.src;
      }
  
      let hardFail = false;
      let tries = 0;
      let watchdog = null;
  
      const MAX_TRIES = 3;     // how many play attempts
      const WATCHDOG_MS = 4500; // wait longer before deciding it "didn't start"
  
      const showFallback = (hard = false) => {
        section.classList.add("prefooter--fallback");
        if (hard) hardFail = true;
        if (video) {
          try {
            video.pause();
          } catch (_) {}
        }
      };
  
      const clearFallback = () => {
        if (!hardFail) section.classList.remove("prefooter--fallback");
      };
  
      const isActuallyPlaying = () => {
        if (!video) return false;
        return !video.paused && video.currentTime > 0;
      };
  
      const armWatchdog = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          if (hardFail || !video) return;
          if (isActuallyPlaying()) return;
  
          if (tries < MAX_TRIES) {
            attemptPlay("watchdog-retry");
          } else {
            // soft fallback (still allow user gesture retry)
            showFallback(false);
          }
        }, WATCHDOG_MS);
      };
  
      const attemptPlay = (reason = "try") => {
        if (!video || hardFail) return;
  
        tries += 1;
  
        // ensure autoplay-friendly attributes
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
  
        // start loading ASAP
        try {
          video.load();
        } catch (_) {}
  
        const p = video.play();
        armWatchdog();
  
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            // autoplay blocked or other issue -> don't hard fail, just fallback and allow tap retry
            if (tries >= MAX_TRIES) showFallback(false);
          });
        }
      };
  
      if (video) {
        video.addEventListener("playing", () => {
          clearTimeout(watchdog);
          clearFallback();
        });
  
        // only HARD fallback on real decode/network error
        video.addEventListener(
          "error",
          () => {
            clearTimeout(watchdog);
            showFallback(true);
          },
          { once: true }
        );
  
        // stalled is not fatal -> retry once
        video.addEventListener("stalled", () => {
          if (!hardFail && tries < MAX_TRIES) attemptPlay("stalled-retry");
        });
      }
  
      // Start playback when visible
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            section.classList.add("prefooter-visible");
            attemptPlay("in-view");
            io.unobserve(section);
          });
        },
        { threshold: 0.25, rootMargin: "0px 0px -10%" }
      );
      io.observe(section);
  
      // If autoplay was blocked, allow ANY tap on the section to retry
      section.addEventListener(
        "pointerdown",
        () => {
          if (hardFail) return;
          clearFallback();
          tries = 0;
          attemptPlay("user-gesture");
        },
        { passive: true }
      );
  
      // CTA click: only trigger if user clicks lower half
      if (cta) {
        cta.addEventListener("click", (e) => {
          const rect = cta.getBoundingClientRect();
          const y = e.clientY - rect.top;
  
          if (y >= rect.height / 2) {
            const target = document.querySelector(JUMP);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        });
      }
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  
  
  
  (() => {
    // ====== Config ======
    const FOOTER_SEL = ".s-block--store-rating";
    const NEW_LOGO =
      "https://cdn.files.salla.network/homepage/1333909099/17c7f3dd-2da2-4e5b-872b-90f3c8c7139d.webp";
  
    const INSTAGRAM_URL = "https://www.instagram.com/Bckyrdbbq2";
    const TIKTOK_URL = "https://www.tiktok.com/@bckyrdbbq";
  
    const BANNER_ID = "coal-strip-banner";
    const BANNER_SRC =
      "https://cdn.files.salla.network/homepage/1333909099/965a100c-de1f-49d2-b762-b8e9bad636d7.webp";
  
    // ====== SVG icons (guaranteed to render) ======
    const ICON_INSTAGRAM = `
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.8a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.8z"/>
      </svg>
    `.trim();
  
    const ICON_TIKTOK = `
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M16.5 2h2.2c.2 2.2 1.7 4 3.8 4.6v2.3c-1.7-.1-3.1-.7-4.3-1.7v8.2c0 3.6-2.9 6.6-6.6 6.6S5 19 5 15.4s2.9-6.6 6.6-6.6c.4 0 .9 0 1.3.1v2.5c-.4-.1-.8-.2-1.3-.2-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V2z"/>
      </svg>
    `.trim();
  
    function createSocialLink({ href, aria, svg, className }) {
      const a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", aria);
      a.className = className;
      a.style.color = "#fff"; // keep icon white even if theme changes
      a.innerHTML = svg;
      return a;
    }
  
    function ensureFooterUpgraded() {
      const footer = document.querySelector(FOOTER_SEL);
      if (!footer) return false;
  
      // ---- 1) Replace logo ----
      const logoImg = footer.querySelector(".store-logo img");
      if (logoImg && logoImg.src !== NEW_LOGO) {
        logoImg.src = NEW_LOGO;
        // optional: keep sizes consistent
        logoImg.loading = "lazy";
        logoImg.decoding = "async";
      }
  
      // ---- 2) Add socials beside WhatsApp ----
      const wa = footer.querySelector('a[aria-label="WhatsApp"]');
      const socialsWrap = wa ? wa.parentElement : footer.querySelector(".flex.flex-row.items-center.gap-2");
  
      if (socialsWrap) {
        // Copy the WhatsApp button classes to match styling
        const baseClass =
          wa?.className ||
          "w-8 h-8 flex items-center justify-center rounded-full bg-[#393B41] border border-[#44464D]";
  
        // If already added, don't duplicate
        const hasInsta = socialsWrap.querySelector(`a[href="${INSTAGRAM_URL}"]`);
        const hasTiktok = socialsWrap.querySelector(`a[href="${TIKTOK_URL}"]`);
  
        if (!hasInsta) {
          socialsWrap.appendChild(
            createSocialLink({
              href: INSTAGRAM_URL,
              aria: "Instagram",
              svg: ICON_INSTAGRAM,
              className: baseClass,
            })
          );
        }
  
        if (!hasTiktok) {
          socialsWrap.appendChild(
            createSocialLink({
              href: TIKTOK_URL,
              aria: "TikTok",
              svg: ICON_TIKTOK,
              className: baseClass,
            })
          );
        }
      }
  
      // ---- 3) Full-width coal stripe banner ----
      if (!document.getElementById(BANNER_ID)) {
        const wrap = document.createElement("div");
        wrap.id = BANNER_ID;
  
        // Full viewport width even if footer has `.container`
        wrap.style.width = "100vw";
        wrap.style.position = "relative";
  
        const img = document.createElement("img");
        img.src = BANNER_SRC;
        img.alt = "Coal stripe banner";
        img.loading = "lazy";
        img.decoding = "async";
        img.style.width = "100%";
        img.style.height = "auto";
        img.style.display = "block";
  
        wrap.appendChild(img);
  
        // Place it right after the footer block
        footer.insertAdjacentElement("afterend", wrap);
      }
  
      return true;
    }
  
    function boot() {
      if (ensureFooterUpgraded()) return;
  
      const mo = new MutationObserver(() => {
        if (ensureFooterUpgraded()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    // Salla soft navigation
    document.addEventListener("salla:pageUpdated", () => {
      // In case the footer re-renders, remove banner and re-add cleanly
      const existingBanner = document.getElementById(BANNER_ID);
      if (existingBanner) existingBanner.remove();
      setTimeout(ensureFooterUpgraded, 120);
    });
  })();
  
  (() => {
    const SECTION_ID = "store-location-map";
    const SEL = `#${SECTION_ID}`;
  
    // insert after this block
    const AFTER = ".s-block--fast-checkout";
  
    // Map embed (no API key) — uses coordinates
    const MAP_EMBED =
      "https://www.google.com/maps?q=24.7691717,46.7617608&z=17&output=embed";
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="slm" data-salla-inject="1" dir="rtl" aria-label="موقع متجرنا في الرياض">
          <div class="slm-wrap">
            <div class="slm-text">
              <h2 class="slm-title">موجودين في الرياض</h2>
              <p class="slm-sub">
              نوصل لجميع مدن المملكة وتقدرون تزورونا في الرياض
              </p>
              <p class="slm-meta">📍 متجر عالم الشواء — الرياض</p>
            </div>
  
            <div class="slm-map">
              <div class="slm-map-ratio">
                <iframe
                  class="slm-iframe"
                  title="موقع متجر عالم الشواء - الرياض"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  data-src="${MAP_EMBED}"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function mountOnce() {
      if (document.querySelector(SEL)) return true;
  
      const anchor = document.querySelector(AFTER);
      if (!anchor) return false;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      anchor.insertAdjacentElement("afterend", node);
      wireUp(node);
      return true;
    }
  
    function wireUp(section) {
      const iframe = section.querySelector(".slm-iframe");
  
      const start = () => {
        section.classList.add("slm-visible");
  
        // lazy set iframe src only when visible
        if (iframe && !iframe.src) {
          const src = iframe.getAttribute("data-src");
          if (src) iframe.src = src;
        }
      };
  
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              start();
              io.unobserve(section);
            });
          },
          { threshold: 0.25, rootMargin: "0px 0px -10%" }
        );
        io.observe(section);
      } else {
        // fallback
        start();
      }
    }
  
    function boot() {
      if (mountOnce()) return;
  
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();
  (() => {
    const SECTION_ID = "grill-short-video";
    const SEL = `#${SECTION_ID}`;
    const AFTER = ".s-block--comparison";
  
    // YouTube Shorts -> embed URL
    const YT_ID = "ebpmbPlkUcU";
    const YT_EMBED = `https://www.youtube.com/embed/${YT_ID}?rel=0&modestbranding=1&playsinline=1`;
  
    function sectionHTML() {
      return `
        <section id="${SECTION_ID}" class="gsv" data-salla-inject="1" dir="rtl" aria-label="مقطع فيديو للشواية">
          <div class="gsv-wrap">
            <h2 class="gsv-title">مقطع فيديو للشواية</h2>
  
            <div class="gsv-video">
              <div class="gsv-ratio">
                <iframe
                  class="gsv-iframe"
                  title="YouTube Shorts - Grill"
                  loading="lazy"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  data-src="${YT_EMBED}"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      `.trim();
    }
  
    function mountOnce() {
      if (document.querySelector(SEL)) return true;
  
      const anchor = document.querySelector(AFTER);
      if (!anchor) return false;
  
      const wrap = document.createElement("div");
      wrap.innerHTML = sectionHTML();
      const node = wrap.firstElementChild;
  
      anchor.insertAdjacentElement("afterend", node);
      wireUp(node);
      return true;
    }
  
    function wireUp(section) {
      const iframe = section.querySelector(".gsv-iframe");
  
      const start = () => {
        section.classList.add("gsv-visible");
        if (iframe && !iframe.src) {
          const src = iframe.getAttribute("data-src");
          if (src) iframe.src = src;
        }
      };
  
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              start();
              io.unobserve(section);
            });
          },
          { threshold: 0.25, rootMargin: "0px 0px -10%" }
        );
        io.observe(section);
      } else {
        start();
      }
    }
  
    function boot() {
      if (mountOnce()) return;
      const mo = new MutationObserver(() => {
        if (mountOnce()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  
    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, { once: true });
  
    document.addEventListener("salla:pageUpdated", () => {
      setTimeout(mountOnce, 120);
    });
  })();