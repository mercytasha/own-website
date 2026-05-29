// Minimal script to inject CONTENT into the page and wire interactions
(function () {
  const C = window.CONTENT || {};

  // Set theme color if provided
  try {
    if (C.theme && C.theme.primaryColor) {
      document.documentElement.style.setProperty('--primary', C.theme.primaryColor);
    }
  } catch (e){}

  // Header / brand
  document.getElementById('siteName').textContent = C.siteName || 'The Logic Church';
  document.getElementById('siteTagline').textContent = C.tagline || '';

  // Nav - build items
  const navList = document.getElementById('navList');
  navList.innerHTML = '';
  (C.nav || []).forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.textContent = item.label || 'Link';
    li.appendChild(a);
    navList.appendChild(li);
  });
  // Ensure Give appears as a regular nav item (so it lives inside the nav/hamburger)
  try {
    // Only add if not present already
    if (!(C.give && C.give.button)) {
      // If no give config, skip
    } else {
      const exists = Array.from(navList.querySelectorAll('a')).some(a => a.textContent.trim().toLowerCase() === (C.give.button || 'give').toLowerCase());
      if (!exists) {
        const giveLi = document.createElement('li');
        giveLi.className = 'nav-give';
        const giveA = document.createElement('a');
        giveA.href = C.give.link || '#give';
        giveA.textContent = C.give.button || 'Give';
        giveA.className = 'give-link';
        giveLi.appendChild(giveA);
        navList.appendChild(giveLi);
      }
    }
  } catch (e) {}
  

  // Give button
  const giveBtn = document.getElementById('giveBtn');
  const giveItem = C.nav && C.nav.find(n=>n.label.toLowerCase()==='give');
  giveBtn.textContent = (giveItem && giveItem.label) || 'Give';
  giveBtn.href = C.give?.link || '#give';

  // Hero
  // NOTE: Hero text is now in carousel slides, don't overwrite it
  // document.getElementById('heroHeading').textContent = C.hero?.heading || '';
  // document.getElementById('heroSub').textContent = C.hero?.subheading || '';
  const heroCta = document.getElementById('heroCta');
  heroCta.textContent = C.hero?.ctaText || 'Plan Your Visit';
  heroCta.href = C.hero?.ctaHref || '#plan-visit';
  // Wire "Watch Online" buttons to the configured watch URL or the provided YouTube link
  try {
    const watchUrl = (C.watchUrl && C.watchUrl.trim()) || 'https://youtube.com/@apostleochemichael?si=FBamJeOV1yj4YryF';
    document.querySelectorAll('.watch-link').forEach(a => {
      a.href = watchUrl;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  } catch (e) {}
  // document.getElementById('heroAddress').textContent = C.contact?.address || '';

  // About
  document.getElementById('aboutHeading').textContent = C.about?.heading || 'About';
  // Highlight the organization name in the about paragraph by wrapping it in a span.accent
  try {
    const aboutEl = document.getElementById('aboutText');
    const raw = C.about?.paragraph || '';
    // Replace occurrences of 'True Light Global Ministry' (case-insensitive) but leave a leading 'the' unwrapped
    const highlighted = raw.replace(/(?:the\s+)?(true\s+light\s+global\s+ministry)/gi, function(match, p1){
      // If the full match contains a prefix (e.g., 'the '), preserve it and only wrap the captured name
      if (match.length > p1.length) {
        const prefix = match.slice(0, match.length - p1.length);
        const name = match.slice(match.length - p1.length);
        return prefix + '<span class="accent">' + name + '</span>';
      }
      return '<span class="accent">' + p1 + '</span>';
    });
    aboutEl.innerHTML = highlighted;
  } catch (e) {
    try { document.getElementById('aboutText').textContent = C.about?.paragraph || ''; } catch (err) {}
  }

  // Ministries grid
  const mg = document.getElementById('ministriesGrid');
  mg.innerHTML = '';
  (C.ministries || []).forEach(m=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${m.title}</h3><p class="muted small">${m.desc}</p>`;
    mg.appendChild(div);
  });

  // Sermons
  const sg = document.getElementById('sermonGrid');
  sg.innerHTML = '';
  (C.sermons || []).forEach(s=>{
    const art = document.createElement('article');
    art.className = 'card';
    art.innerHTML = `
      <div class="sermon-thumb">${s.series}</div>
      <h3>${s.title}</h3>
      <div class="muted small">${s.speaker} • ${s.date} • ${s.length}</div>
      <p class="muted small">${s.excerpt}</p>
      <div style="margin-top:10px">
        <button class="btn" data-sermon="${s.id}" onclick="openSermon(event)">Play</button>
        <a class="btn" href="#notes-${s.id}" style="margin-left:8px;background:transparent;border:1px solid rgba(255,255,255,0.04)">Notes</a>
      </div>
    `;
    sg.appendChild(art);
  });

  // Events
  const evList = document.getElementById('eventsList');
  evList.innerHTML = '';
  (C.events || []).forEach(ev=>{
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <div class="event-date">
        <div style="font-weight:700">${ev.date}</div>
        <div class="muted small">${ev.time}</div>
      </div>
      <div>
        <div style="font-weight:700">${ev.title}</div>
        <div class="muted small">${ev.desc}</div>
      </div>
    `;
    evList.appendChild(div);
  });

  // Populate hero next-service from events (shows first upcoming event)
  try {
    const nextSpanList = document.querySelectorAll('.next-service');
    let nextText = '';
    if (C.events && C.events.length) {
      const e = C.events[0];
      function formatDateShort(dstr){
        try {
          const d = new Date(dstr + 'T00:00:00');
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (err) { return dstr; }
      }
      nextText = `Next: ${e.title} — ${formatDateShort(e.date)} • ${e.time}`;
    } else {
      nextText = 'Join us this Sunday — 10:00 AM';
    }
    nextSpanList.forEach(el => el.textContent = nextText);
  } catch (e) { /* ignore */ }

  // Give area
  document.getElementById('giveHeading').textContent = C.give?.heading || 'Give';
  document.getElementById('giveText').textContent = C.give?.paragraph || '';
  const giveLink = document.getElementById('giveLink');
  giveLink.textContent = C.give?.button || 'Give Now';
  giveLink.href = C.give?.link || '#';

  // Contact info
  const emailEl = document.getElementById('contactEmail');
  const phoneEl = document.getElementById('contactPhone');
  const addressEl = document.getElementById('contactAddress');
  if (emailEl) { emailEl.textContent = C.contact?.email || ''; emailEl.href = 'mailto:' + (C.contact?.email || ''); }
  if (phoneEl) phoneEl.textContent = C.contact?.phone || '';
  if (addressEl) addressEl.textContent = C.contact?.address || '';

  // Footer
  document.getElementById('footerText').textContent = C.footer || '';

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    const list = document.getElementById('navList');
    const show = list.style.display === 'flex';
    list.style.display = show ? 'none' : 'flex';
    list.style.flexDirection = show ? '' : 'column';
    this.setAttribute('aria-expanded', String(!show));
  });

  // Contact form demo submit
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Message sent (demo). Replace with real backend/API.');
      contactForm.reset();
    });
  }

  // Sermon open stub (replace with actual embed)
  window.openSermon = function (evt) {
    const btn = evt.currentTarget;
    const id = btn.getAttribute('data-sermon');
    alert('Open sermon player for: ' + id + ' (replace this with real embed).');
  };

})();

// Hero Carousel
window.addEventListener('load', function() {
  console.log('Carousel load event fired');

  // Ensure main content is pushed below the fixed header so header stays stationed
  try {
    function adjustMainPadding() {
      const hdr = document.querySelector('.site-header');
      const main = document.querySelector('main');
      if (hdr && main) {
        const h = hdr.offsetHeight;
        main.style.paddingTop = h + 'px';
      }
    }
    adjustMainPadding();
    window.addEventListener('resize', adjustMainPadding);
  } catch (e) { console.warn('Could not adjust main padding for fixed header', e); }
  
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  
  console.log('Found slides:', slides.length);
  console.log('Found dots:', dots.length);
  
  if (slides.length === 0) {
    console.error('No carousel slides found!');
    return;
  }

  let currentSlide = 0;
  // Removed overlay for single-fade effect

  function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    if (slides[n]) slides[n].classList.add('active');
    if (dots[n]) dots[n].classList.add('active');
  }

  // Show first slide
  showSlide(0);

  function fadeToSlide(next) {
    // Single-fade: fade out current, fade in next
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.remove('active');
      }
    });
    setTimeout(function() {
      showSlide(next);
    }, 1200); // Wait for CSS fade transition (1.2s) to complete
  }

  // Auto rotate every 5 seconds
  setInterval(function() {
    let nextSlide = (currentSlide + 1) % slides.length;
    fadeToSlide(nextSlide);
    currentSlide = nextSlide;
  }, 5000);

  // Dot click handlers
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      fadeToSlide(index);
      currentSlide = index;
    });
  });
});