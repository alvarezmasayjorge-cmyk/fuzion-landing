const isMobile = () => window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;

// ========== OFFSET DINÁMICO DE HEADER ==========
function updateHeaderOffsets() {
  const bar = document.getElementById('urgencyBar');
  const nav = document.getElementById('navbar');
  const barH = bar && !bar.classList.contains('hidden') ? bar.getBoundingClientRect().height : 0;
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--bar-h', barH + 'px');
  document.documentElement.style.setProperty('--nav-h', navH + 'px');
}

// Ejecutar al cargar y en cada resize
updateHeaderOffsets();
window.addEventListener('resize', updateHeaderOffsets, { passive: true });
// Re-medir después de que carguen las fuentes (puede cambiar la altura)
document.fonts?.ready.then(updateHeaderOffsets);

// ========== CURSOR (desktop) ==========
if (!isMobile()) {
  const cursor = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.className = 'cursor'; cursorDot.className = 'cursor-dot';
  document.body.append(cursor, cursorDot);
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px';
    cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .servicio-card, .equipo-card, .portafolio-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}


// ========== URGENCY BAR ==========
const urgencyBar = document.getElementById('urgencyBar');
const urgencyBarClose = document.getElementById('urgencyBarClose');
const navbar = document.getElementById('navbar');

urgencyBarClose?.addEventListener('click', () => {
  urgencyBar.classList.add('hidden');
  navbar.classList.add('bar-hidden');
  // Esperar a que la transición termine y re-medir
  setTimeout(updateHeaderOffsets, 350);
});
document.getElementById('urgencyBarCta')?.addEventListener('click', openOfertaSection);


// ========== NAVBAR SCROLL ==========
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });


// ========== HAMBURGER ==========
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

function openMenu() {
  hamburger.classList.add('active');
  mobileNav.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('modal-open');
}
function closeMenu() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('modal-open');
}
hamburger.addEventListener('click', () => hamburger.classList.contains('active') ? closeMenu() : openMenu());
mobileNav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));
mobileNav.addEventListener('click', (e) => { if (e.target === mobileNav) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeFormModal(); closeOfertaPopup(); } });


// ========== COUNTDOWN ==========
function getEndOfWeek() {
  // Próximo domingo a las 23:59:59
  const stored = localStorage.getItem('fuzion_countdown_end');
  if (stored) return new Date(parseInt(stored));
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (7 - now.getDay()));
  sunday.setHours(23, 59, 59, 0);
  localStorage.setItem('fuzion_countdown_end', sunday.getTime().toString());
  return sunday;
}

const endDate = getEndOfWeek();

function updateCountdown() {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) return;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');

  // Main section countdown
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('cdDays', pad(days)); setEl('cdHours', pad(hours)); setEl('cdMins', pad(mins)); setEl('cdSecs', pad(secs));
  setEl('pcdDays', pad(days)); setEl('pcdHours', pad(hours)); setEl('pcdMins', pad(mins)); setEl('pcdSecs', pad(secs));
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Spots counter — decrements realistically
let spots = parseInt(localStorage.getItem('fuzion_spots') || '7');
function decrementSpots() {
  if (spots > 1 && Math.random() < 0.3) {
    spots = Math.max(1, spots - 1);
    localStorage.setItem('fuzion_spots', spots);
  }
  document.querySelectorAll('#spotsLeft').forEach(el => el.textContent = `${spots} cupos`);
}
decrementSpots();
setInterval(decrementSpots, 90000);


// ========== POPUP OFERTA ==========
const ofertaPopup = document.getElementById('ofertaPopup');

function openOfertaPopup() {
  ofertaPopup.classList.add('open');
  document.body.classList.add('modal-open');
}
function closeOfertaPopup() {
  ofertaPopup.classList.remove('open');
  document.body.classList.remove('modal-open');
}

document.getElementById('ofertaPopupClose')?.addEventListener('click', closeOfertaPopup);
document.getElementById('ofertaPopupSkip')?.addEventListener('click', closeOfertaPopup);
ofertaPopup?.addEventListener('click', (e) => { if (e.target === ofertaPopup) closeOfertaPopup(); });

// Mostrar popup a los 3.5s — solo una vez por sesión
if (!sessionStorage.getItem('fuzion_popup_shown')) {
  setTimeout(() => {
    openOfertaPopup();
    sessionStorage.setItem('fuzion_popup_shown', '1');
  }, 3500);
}

function openOfertaSection(e) {
  e?.preventDefault();
  closeOfertaPopup();
  document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' });
}


// ========== MODAL FORMULARIO ==========
const formModal = document.getElementById('formModal');

function openFormModal(e) {
  e?.preventDefault();
  closeOfertaPopup();
  formModal.classList.add('open');
  document.body.classList.add('modal-open');
}
function closeFormModal() {
  formModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

document.getElementById('formModalClose')?.addEventListener('click', closeFormModal);
formModal?.addEventListener('click', (e) => { if (e.target === formModal) closeFormModal(); });

// Todos los botones con open-form-btn
document.querySelectorAll('.open-form-btn').forEach(btn => {
  btn.addEventListener('click', openFormModal);
});

// El botón del popup lleva al modal
document.getElementById('popupCtaBtn')?.addEventListener('click', (e) => {
  closeOfertaPopup();
  setTimeout(openFormModal, 200);
});


// ========== VSL PLAYER ==========
document.getElementById('vslPlayBtn')?.addEventListener('click', () => {
  const thumb = document.getElementById('vslThumbnail');
  const frame = document.getElementById('vslFrame');
  if (!thumb || !frame) return;
  const iframe = frame.querySelector('iframe');
  if (iframe) iframe.src = iframe.dataset.src;
  thumb.hidden = true;
  frame.hidden = false;
});


// ========== SCROLL ANIMATIONS ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.servicio-card, .testimonio-card, .hero-content, .proceso-step, .pain-item, .oferta-paquete').forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

if (!isMobile()) {
  document.querySelectorAll('.portafolio-card, .equipo-card').forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
}


// ========== CONTADORES ==========
function animateCounter(el, target, duration = 1800) {
  const step = target / (duration / 16);
  let val = 0;
  const timer = setInterval(() => {
    val += step;
    if (val >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); }
    else el.textContent = Math.floor(val).toLocaleString();
  }, 16);
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(el => animateCounter(el, parseInt(el.dataset.target)));
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
const statsEl = document.querySelector('.stats');
if (statsEl) statsObserver.observe(statsEl);


// ========== 3D CARDS (desktop) ==========
if (!isMobile()) {
  document.querySelectorAll('.equipo-card, .servicio-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height/2) / r.height) * -8;
      const ry = ((e.clientX - r.left - r.width/2) / r.width) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}


// ========== GLITCH ==========
const glitchEl = document.querySelector('.glitch');
if (glitchEl) {
  setInterval(() => {
    glitchEl.classList.add('glitching');
    setTimeout(() => glitchEl.classList.remove('glitching'), 300);
  }, 3500);
}


// ========== CAROUSEL DOTS ==========
function initCarouselDots() {
  const grid = document.querySelector('.portafolio-grid');
  const dotsContainer = document.getElementById('portafolioDots');
  if (!grid || !dotsContainer) return;
  const cards = grid.querySelectorAll('.portafolio-card');
  dotsContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
    dot.addEventListener('click', () => cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }));
    dotsContainer.appendChild(dot);
  });
  let t;
  grid.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const active = Math.round(grid.scrollLeft / (cards[0].offsetWidth + 14));
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === active));
    }, 50);
  }, { passive: true });
}
initCarouselDots();


// ========== MOBILE BOTTOM BAR ==========
const mobileBottomBar = document.getElementById('mobileBottomBar');
if (mobileBottomBar) {
  const hero = document.querySelector('.hero');
  const update = () => {
    const pastHero = window.scrollY > (hero ? hero.offsetHeight * 0.4 : 300);
    mobileBottomBar.classList.toggle('visible', pastHero);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}


// ========== FORMULARIO → WHATSAPP ==========
const form = document.getElementById('form-contacto');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroWhatsApp = '59170000000';
    const fields = form.querySelectorAll('input, select, textarea');
    const nombre = fields[0].value;
    const empresa = fields[1].value;
    const email = fields[2].value;
    const telefono = fields[3].value;
    const servicio = fields[4].value;
    const mensaje = fields[5].value;

    let txt = `¡Hola Fuzion Studio! 🎬%0A%0A`;
    txt += `*Nombre:* ${nombre}%0A`;
    if (empresa) txt += `*Empresa:* ${empresa}%0A`;
    txt += `*Email:* ${email}%0A`;
    if (telefono) txt += `*WhatsApp:* ${telefono}%0A`;
    txt += `*Servicio:* ${servicio}%0A`;
    if (mensaje) txt += `%0A*Proyecto:*%0A${mensaje}`;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Abriendo WhatsApp... 💬';
    btn.style.background = '#25D366';
    btn.disabled = true;

    setTimeout(() => {
      window.open(`https://wa.me/${numeroWhatsApp}?text=${txt}`, '_blank');
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Quiero mi cotización GRATIS →';
        btn.style.background = '';
        btn.disabled = false;
        closeFormModal();
      }, 1000);
    }, 600);
  });
}

// Portafolio — abrir video al hacer clic
document.querySelectorAll('.portafolio-card[data-video]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const id = card.dataset.video;
    const plataforma = card.dataset.plataforma || 'youtube';
    const url = plataforma === 'vimeo'
      ? `https://player.vimeo.com/video/${id}?autoplay=1`
      : `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    document.getElementById('videoIframe').src = url;
    const modal = document.getElementById('videoModal');
    modal.style.display = 'flex';
  });
});

function cerrarVideo() {
  document.getElementById('videoIframe').src = '';
  document.getElementById('videoModal').style.display = 'none';
}

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarVideo();
});

// Cerrar al hacer clic fuera del video
document.getElementById('videoModal').addEventListener('click', function(e) {
  if (e.target === this) cerrarVideo();
});

// update