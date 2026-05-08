const isMobile = () => window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;

// ========== SEGURIDAD DE ALMACENAMIENTO ==========
const safeStorage = {
  getItem: (key, type = 'local') => {
    try {
      return (type === 'local' ? localStorage : sessionStorage).getItem(key);
    } catch (e) {
      console.warn(`Storage access blocked for ${key}:`, e);
      return null;
    }
  },
  setItem: (key, value, type = 'local') => {
    try {
      (type === 'local' ? localStorage : sessionStorage).setItem(key, value);
    } catch (e) {
      console.warn(`Storage access blocked for ${key}:`, e);
    }
  }
};

// ========== OFFSET DINÁMICO DE HEADER ==========
function updateHeaderOffsets() {
  const nav = document.getElementById('navbar');
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--nav-h', navH + 'px');
}

updateHeaderOffsets();
window.addEventListener('resize', updateHeaderOffsets, { passive: true });
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
  document.querySelectorAll('a, button, .plan-card, .diferenciador-card, .proceso-step').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}

// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
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
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => hamburger.classList.contains('active') ? closeMenu() : openMenu());
  mobileNav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));
  mobileNav.addEventListener('click', (e) => { if (e.target === mobileNav) closeMenu(); });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeFormModal(); } });

// ========== MODAL FORMULARIO ==========
const formModal = document.getElementById('formModal');
const planSelect = document.getElementById('planSelect');

function openFormModal(e, planPrefill = null) {
  e?.preventDefault();
  if (planPrefill && planSelect) {
    planSelect.value = planPrefill;
  }
  formModal.classList.add('open');
  document.body.classList.add('modal-open');
}
function closeFormModal() {
  formModal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

document.getElementById('formModalClose')?.addEventListener('click', closeFormModal);
formModal?.addEventListener('click', (e) => { if (e.target === formModal) closeFormModal(); });

document.querySelectorAll('.open-form-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const plan = btn.getAttribute('data-plan');
    openFormModal(e, plan);
  });
});

// ========== SCROLL ANIMATIONS ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.hero-content, .diferenciador-card, .proceso-step, .plan-card, .testimonio-card, .faq-item').forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ========== 3D CARDS (desktop) ==========
if (!isMobile()) {
  document.querySelectorAll('.plan-card, .diferenciador-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height/2) / r.height) * -8;
      const ry = ((e.clientX - r.left - r.width/2) / r.width) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { 
      card.style.transform = ''; 
    });
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
const form = document.getElementById('form-contacto-redes');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const numeroWhatsApp = '59160007720';
    const fields = form.querySelectorAll('input, select');
    const nombre = fields[0].value;
    const telefono = fields[1].value;
    const plan = fields[2].value;
    const tema = fields[3].value;

    // Datos para Google Sheets
    const formData = {
      fecha: new Date().toLocaleString(),
      nombre: nombre,
      whatsapp: telefono,
      plan: plan,
      tema: tema,
      pagina: 'Redes Sociales'
    };

    // Función para enviar a Google Sheets
    const sendToSheets = async (data) => {
      const scriptURL = 'https://script.google.com/macros/s/AKfycby6lRMNfhAcaf8y-c059GIO5IgI22xu89lfMtDm06E05HPAkmQH0FFX66uqyIfQKMZb/exec';
      if (!scriptURL || scriptURL.includes('TU_URL')) return;
      try {
        await fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
      } catch (error) { console.error('Error!', error.message); }
    };

    // Enviar a Sheets en segundo plano
    sendToSheets(formData);

    let txt = `¡Hola Fuzion Studio! 📱%0A%0A`;
    txt += `Quiero saber más sobre los paquetes de Videos para Redes.%0A%0A`;
    txt += `*Nombre:* ${nombre}%0A`;
    txt += `*WhatsApp:* ${telefono}%0A`;
    txt += `*Paquete de interés:* ${plan}%0A`;
    txt += `*Estado de marca:* ${tema}`;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Abriendo WhatsApp... 💬';
    btn.style.background = '#25D366';
    btn.disabled = true;

    setTimeout(() => {
      // Guardamos la URL para la página de agradecimiento
      const waUrl = `https://wa.me/${numeroWhatsApp}?text=${txt}`;
      sessionStorage.setItem('lastWaUrl', waUrl);
      
      // Redirigimos a la Thank You Page para tracking
      window.location.href = 'gracias.html';
    }, 600);
  });
}

// ========== COUNTDOWN & POPUP OFERTA PODCAST ==========
function getEndOfWeek() {
  const now = new Date();
  let stored = safeStorage.getItem('fuzion_countdown_end');
  let end;

  if (stored) {
    end = new Date(parseInt(stored));
    if (end <= now) stored = null;
  }

  if (!stored) {
    end = new Date(now);
    const daysToSunday = 7 - now.getDay();
    end.setDate(now.getDate() + (daysToSunday === 0 ? 7 : daysToSunday));
    end.setHours(23, 59, 59, 0);
    safeStorage.setItem('fuzion_countdown_end', end.getTime().toString());
  }
  return end;
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

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('pcdDaysPod', pad(days)); setEl('pcdHoursPod', pad(hours)); setEl('pcdMinsPod', pad(mins)); setEl('pcdSecsPod', pad(secs));
}

setInterval(updateCountdown, 1000);
updateCountdown();

const ofertaPopupPodcast = document.getElementById('ofertaPopupPodcast');

function openOfertaPopupPodcast() {
  if (!ofertaPopupPodcast) return;
  ofertaPopupPodcast.classList.add('open');
  document.body.classList.add('modal-open');
}
function closeOfertaPopupPodcast() {
  if (!ofertaPopupPodcast) return;
  ofertaPopupPodcast.classList.remove('open');
  document.body.classList.remove('modal-open');
}

document.getElementById('ofertaPopupClosePodcast')?.addEventListener('click', closeOfertaPopupPodcast);
document.getElementById('ofertaPopupSkipPodcast')?.addEventListener('click', closeOfertaPopupPodcast);
ofertaPopupPodcast?.addEventListener('click', (e) => { if (e.target === ofertaPopupPodcast) closeOfertaPopupPodcast(); });

if (!safeStorage.getItem('fuzion_podcast_popup_shown', 'session')) {
  setTimeout(() => {
    openOfertaPopupPodcast();
    safeStorage.setItem('fuzion_podcast_popup_shown', '1', 'session');
  }, 4000);
}

document.getElementById('popupCtaBtnPodcast')?.addEventListener('click', (e) => {
  closeOfertaPopupPodcast();
  setTimeout(() => {
    openFormModal(e, 'Pro');
  }, 200);
});
// ========== PORTAFOLIO VIDEO ==========
document.querySelectorAll('.portafolio-card[data-video]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const id = card.dataset.video;
    const url = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    document.getElementById('videoIframe').src = url;
    const modal = document.getElementById('videoModal');
    modal.style.display = 'flex';
  });
});

function cerrarVideo() {
  const iframe = document.getElementById('videoIframe');
  if (iframe) iframe.src = '';
  const modal = document.getElementById('videoModal');
  if (modal) modal.style.display = 'none';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarVideo();
});

document.getElementById('videoModal')?.addEventListener('click', function(e) {
  if (e.target === this) cerrarVideo();
});
