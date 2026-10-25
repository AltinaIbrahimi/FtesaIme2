// ====== NDRYSHO VETËM KËTU ======
const CONFIG = {
  name: "Ernës",                           // emri në rasën gjinore (Kanagjegjin e ...)
  letter: "E",                             // shkronja në vulë
  date: "2026-12-12T19:00:00",             // data dhe ora (viti-muaji-dita T ora)
  city: "Prishtinë, Kosovë",
  family: "familja",                       // p.sh. "familjet Krasniqi dhe Berisha"
  rsvpBy: "5 dhjetor 2026",
  whatsapp: "38344123456",                 // numri pa + dhe pa zero fillestare
  events: [
    { title: "Pritja e mysafirëve", time: "19:00", place: "Shtëpia e Ernës", address: "Rruga e Bardhë 12, Prishtinë", map: "https://www.google.com/maps/search/?api=1&query=Prishtina" },
    { title: "Nata e Kanagjegjit", time: "20:00", place: "Salla \"Tradita\"", address: "Rruga e Kuqe 5, Prishtinë", map: "https://www.google.com/maps/search/?api=1&query=Prishtina" }
  ],
  // Vendosni fotot në dosjen images/ me këto emra (shih PROMPTET-AI.md)
  photos: [
    ["images/foto1.jpg", "Erna me veshje tradicionale dhe mindil"],
    ["images/foto2.jpg", "Erna me stoli dhe qëndisje"],
    ["images/foto3.jpg", "Vallja e mindilit"],
    ["images/foto4.jpg", "Erna me familjen në veshje popullore"],
    ["images/foto5.jpg", "Detaje: qëndisje dhe stoli"],
    ["images/foto6.jpg", "Gratë me mindil në valle"]
  ]
};
// ================================

const $ = id => document.getElementById(id);
const when = new Date(CONFIG.date);
const DITET = ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];
const MUAJT = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const dateStr = `${when.getDate()} ${MUAJT[when.getMonth()]} ${when.getFullYear()}`;
const hh = d => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

document.title = `Kanagjegji i ${CONFIG.name}`;
$("names").textContent = CONFIG.name;
$("sealLetter").textContent = CONFIG.letter;
$("coverDate").textContent = `${dateStr.toUpperCase()}  ·  ${CONFIG.city.toUpperCase()}`;
$("dateText").textContent = `${DITET[when.getDay()]}, ${dateStr}, ora ${hh(when)}`;
$("footName").textContent = `Kanagjegji i ${CONFIG.name}`;
$("footDate").textContent = `${dateStr}  ·  ${CONFIG.city}`;
$("deadline").textContent = `Ju lutemi konfirmoni deri më ${CONFIG.rsvpBy}`;
$("inviteText").innerHTML =
  `Me gëzim dhe dashuri të thellë,<br>${CONFIG.family} ka nderin t'ju ftojë<br>të ndani me ne natën e<br>` +
  `<strong>Kanagjegjit të ${CONFIG.name}</strong><br>me këngë, valle dhe mindil,<br>siç na kanë mësuar të parët.`;

// Ekrani hapës
const cover = $("cover");
function openInvite() {
  cover.classList.add("gone");
  document.body.classList.remove("locked");
  setTimeout(() => cover.remove(), 900);
  scrollTo(0, 0);
}
cover.onclick = openInvite;
cover.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInvite(); } };

// Detajet e eventit
$("events").innerHTML = CONFIG.events.map(e => `
  <article class="card">
    <h3>${e.title}</h3>
    <p class="time">${e.time}</p>
    <p class="place">${e.place}</p>
    <p>${e.address}</p>
    <a class="link" href="${e.map}" target="_blank" rel="noopener">Hap hartat →</a>
  </article>`).join("");

// Galeria: nëse fotoja mungon, shfaqet vend i bukur për ta plotësuar
CONFIG.photos.forEach(([src, cap], i) => {
  const fig = document.createElement("figure");
  const img = new Image();
  img.alt = cap; img.loading = "lazy"; img.src = src;
  img.onerror = () => {
    const ph = document.createElement("div");
    ph.className = "ph";
    ph.innerHTML = `<span>Foto ${i + 1}<br><small>${src}</small></span>`;
    img.replaceWith(ph);
  };
  img.onclick = () => openBox(src, cap);
  fig.append(img);
  const fc = document.createElement("figcaption");
  fc.textContent = cap; fig.append(fc);
  $("gallery").append(fig);
});

function openBox(src, alt) {
  const d = document.createElement("dialog");
  d.className = "lightbox";
  d.innerHTML = `<img src="${src}" alt="${alt}">`;
  d.onclick = () => { d.close(); d.remove(); };
  document.body.append(d); d.showModal();
}

// Numërimi mbrapsht
function tick() {
  let s = Math.max(0, Math.floor((when - Date.now()) / 1000));
  const parts = [["ditë", 86400], ["orë", 3600], ["minuta", 60], ["sekonda", 1]];
  $("countdown").innerHTML = parts.map(([l, n]) => {
    const v = Math.floor(s / n); s -= v * n;
    return `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`;
  }).join("");
}
tick(); setInterval(tick, 1000);

// Kalendari (.ics)
$("calBtn").onclick = () => {
  const z = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(when.getTime() + 5 * 3600e3);
  const last = CONFIG.events[CONFIG.events.length - 1];
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `DTSTART:${z(when)}`, `DTEND:${z(end)}`, `SUMMARY:Kanagjegji i ${CONFIG.name}`,
    `LOCATION:${last.place}, ${last.address}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "kanagjegj.ics"; a.click();
};

// Konfirmimi përmes WhatsApp
$("rsvp").onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const yes = f.get("answer") === "po";
  const text = `Përshëndetje! Jam ${f.get("name")}. ` +
    (yes ? `Do të vijmë me gëzim (${f.get("guests")}).` : "Fatkeqësisht nuk do të mund të vij.") +
    (f.get("msg") ? `\n${f.get("msg")}` : "");
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
};

// Ndarja
$("shareBtn").onclick = async () => {
  const data = { title: document.title, url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch {} }
  else { await navigator.clipboard?.writeText(location.href); $("shareBtn").textContent = "Linku u kopjua ✓"; }
};
