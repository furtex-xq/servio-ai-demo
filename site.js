// Servio AI homepage: account state, private live phone in the tour, films, gallery, calculator,
// demo booking and presentation mode. Runs after the page's own script (uses lang, CH, active, send).
(function () {
  const $ = s => document.querySelector(s);
  const L = (ru, en) => (typeof lang !== "undefined" && lang === "ru") ? ru : en;
  const sv = window.servio;

  // ── account + the tour phone: live app only for approved accounts, screenshots for everyone else ──
  const frameApp = $("#app");
  function useScreenshots() {
    const img = document.createElement("img"); img.className = "shot"; img.alt = "";
    frameApp.style.display = "none"; frameApp.parentElement.appendChild(img);
    ready = true;
    tourStatic = go => {
      const i = Math.max(0, CH.findIndex(c => c.go === go));
      img.src = `media/tour/${lang}_${String(i).padStart(2, "0")}.webp`;
    };
    const t = $(".frame .try"); if (t) { EN.try_s = "Screens of the app · the live demo opens with access"; T.ru.try_s = "Экраны приложения · живое демо — по доступу"; t.dataset.t = "try_s"; t.innerHTML = L(T.ru.try_s, EN.try_s); }
    tourStatic(CH[Math.max(active, 0)].go);
  }
  (async () => {
    let a = { signed_in: false, demo: false };
    try { if (sv) a = await sv.access(); } catch (e) {}
    const ac = $("#acct"); if (a.signed_in) { ac.classList.add("in"); ac.title = L("Личный кабинет", "Your account"); }
    if (a.demo) frameApp.src = frameApp.dataset.src; else useScreenshots();
  })();

  // ── films ──
  const VIDS = [["media/explainer-60s.mp4", "media/poster-60s.jpg"], ["media/story-5min.mp4", "media/poster-5min.jpg"]];
  const vid = $("#vid");
  document.querySelectorAll(".vtabs button").forEach(b => b.onclick = () => {
    document.querySelectorAll(".vtabs button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    const [src, poster] = VIDS[+b.dataset.v]; vid.pause(); vid.poster = poster; vid.querySelector("source").src = src; vid.load();
  });

  // ── gallery ──
  const GAL = [[0, "Guest tablet", "Welcome, in the guest's language", "Планшет гостя", "Приветствие на языке гостя"],
    [1, "Menu", "Photos, prices, prep time", "Меню", "Фото, цены, время приготовления"],
    [2, "AI waiter", "Answers from your menu", "ИИ-официант", "Отвечает по вашему меню"],
    [3, "Cart", "Comments for the kitchen", "Корзина", "Комментарии для кухни"],
    [4, "Kitchen display", "Orders by station", "Кухонный экран", "Заказы по станциям"],
    [5, "Waiter's phone", "Ready orders and calls", "Телефон официанта", "Готовые заказы и вызовы"],
    [6, "Owner's dashboard", "Revenue, live", "Панель владельца", "Выручка вживую"],
    [8, "Analytics", "What sells and what doesn't", "Аналитика", "Что продаётся, а что нет"],
    [9, "Floor plan", "Your tables, your layout", "План зала", "Ваши столы и зал"]];
  function gallery() {
    $("#gal").innerHTML = GAL.map(([i, en, ens, ru, rus]) => `<figure><div class="ph"><img loading="lazy" src="media/tour/${lang}_${String(i).padStart(2, "0")}.webp" alt="${L(ru, en)}"></div><figcaption>${L(ru, en)}<small>${L(rus, ens)}</small></figcaption></figure>`).join("");
  }

  // ── calculator ──
  const PLANS = [[5, "Trial", 0], [20, "Standard", 99.99], [100, "Pro", 249.99]];
  const eur = n => "€" + Math.round(n).toLocaleString(L("ru-RU", "en-GB"));
  function calc() {
    const v = id => Math.max(0, parseFloat($(id).value) || 0);
    const tables = v("#k_tables"), hours = v("#k_orders") * v("#k_min") * v("#k_days") / 60, worth = hours * v("#k_cost");
    const plan = PLANS.find(p => tables <= p[0]) || null;
    $("#k_hours").textContent = Math.round(hours).toLocaleString(L("ru-RU", "en-GB")) + L(" ч", " h");
    $("#k_worth").textContent = eur(worth);
    if (!plan) { $("#k_plan").textContent = L("Больше 100 — напишите нам", "Over 100 — talk to us"); $("#k_net").textContent = "—"; return; }
    const price = plan[2] || PLANS[1][2];
    $("#k_plan").textContent = plan[2] ? `${plan[1]} · €${plan[2].toLocaleString(L("ru-RU", "en-GB"))}` : L(`Пробный 14 дней, потом Standard · €99,99`, `14-day trial, then Standard · €99.99`);
    const net = worth - price, n = $("#k_net"); n.textContent = (net >= 0 ? "+" : "−") + eur(Math.abs(net)); n.classList.toggle("neg", net < 0);
  }
  document.querySelectorAll(".calc input").forEach(i => i.addEventListener("input", calc));

  // ── book a demo ──
  const book = $("#book"), bmsg = $("#bmsg");
  book.addEventListener("submit", async e => {
    e.preventDefault(); const f = book, b = f.querySelector("button"); bmsg.className = "bmsg"; bmsg.textContent = "";
    if (!sv) { bmsg.className = "bmsg bad"; bmsg.textContent = L("Не удалось отправить. Напишите на supportservioai@gmail.com", "Couldn't send. Email supportservioai@gmail.com"); return; }
    b.disabled = true;
    const { error } = await sv.sb.rpc("site_request_demo", { p_name: f.name.value, p_contact: f.contact.value, p_restaurant: f.rest.value, p_city: f.city.value, p_when: f.when.value, p_message: f.msg.value });
    b.disabled = false;
    if (error) { bmsg.className = "bmsg bad"; bmsg.textContent = /too many/i.test(error.message) ? L("Слишком много заявок подряд — попробуйте позже.", "Too many requests — please try later.") : /required/i.test(error.message) ? L("Укажите имя и контакт.", "Please add your name and a contact.") : L("Не удалось отправить. Напишите на supportservioai@gmail.com", "Couldn't send. Email supportservioai@gmail.com"); return; }
    f.reset(); bmsg.className = "bmsg ok"; bmsg.textContent = L("Спасибо! Мы свяжемся с вами в течение дня.", "Thank you! We'll get back to you within a day.");
  });

  // ── presentation mode ──
  const root = document.documentElement;
  let stops = [], cur = 0;
  function collect() {
    stops = [$("#top"), ...document.querySelectorAll("section.sec, section.cta, #tour .sec-head, #tour .chapter")]
      .filter(Boolean).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  }
  function go(i) {
    collect(); cur = Math.max(0, Math.min(stops.length - 1, i));
    const el = stops[cur], top = el.getBoundingClientRect().top + scrollY - (el.classList.contains("chapter") ? (innerHeight - el.offsetHeight) / 2 : 0);
    scrollTo({ top: Math.max(0, top), behavior: "smooth" }); $("#pNum").textContent = `${cur + 1} / ${stops.length}`;
  }
  function nearest() { collect(); let best = 0, d = 1e9; stops.forEach((el, i) => { const t = Math.abs(el.getBoundingClientRect().top); if (t < d) { d = t; best = i; } }); return best; }
  function enter() { root.classList.add("pres"); history.replaceState(null, "", "?slides" + location.hash); setTimeout(() => go(nearest()), 50); }
  function leave() { root.classList.remove("pres"); history.replaceState(null, "", location.pathname + location.hash); if (document.fullscreenElement) document.exitFullscreen(); }
  $("#presLink").addEventListener("click", e => { e.preventDefault(); enter(); scrollTo({ top: 0 }); setTimeout(() => go(0), 80); });
  $("#pPrev").onclick = () => go(nearest() - 1); $("#pNext").onclick = () => go(nearest() + 1);
  $("#pExit").onclick = leave;
  $("#pFull").onclick = () => document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.();
  addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (!root.classList.contains("pres")) return;
    if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(nearest() + 1); }
    else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(nearest() - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(1e6); }
    else if (e.key === "f" || e.key === "F") $("#pFull").click();
    else if (e.key === "Escape" && !document.fullscreenElement) leave();
  });
  addEventListener("scroll", () => { if (root.classList.contains("pres")) $("#pNum").textContent = `${nearest() + 1} / ${stops.length}`; }, { passive: true });
  if (new URLSearchParams(location.search).has("slides")) setTimeout(enter, 300);

  // ── language-dependent bits ──
  function relang() {
    gallery(); calc();
    const ph = { name: ["Иван", "Alex"], contact: ["+43 660 123 4567", "+43 660 123 4567"], rest: ["Golden Bite", "Golden Bite"], city: ["Вена", "Vienna"], when: ["Будни после 15:00", "Weekdays after 3 pm"] };
    for (const [k, [r, e]] of Object.entries(ph)) { const i = book.querySelector(`[name=${k}]`); if (i) i.placeholder = L(r, e); }
    if (tourStatic && active >= 0) tourStatic(CH[active].go);
  }
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setTimeout(relang, 0)));
  relang();
})();
