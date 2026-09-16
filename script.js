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
  

  // Give button (navbar)
  const giveBtn = document.getElementById('giveBtn');
  const giveItem = C.nav && C.nav.find(n=>n.label.toLowerCase()==='give');
  giveBtn.textContent = (giveItem && giveItem.label) || 'Give';
  giveBtn.href = '#';
  
  // Find the give link in the nav
  const navGiveLink = document.querySelector('.give-link');
  if (navGiveLink) {
    navGiveLink.href = '#';
    
    // Create accounts container for nav give link
    let navAccountContainer = document.createElement('div');
    navAccountContainer.id = 'giveAccountsNav';
    navAccountContainer.style.display = 'none';
    navAccountContainer.style.position = 'absolute';
    navAccountContainer.style.top = '100%';
    navAccountContainer.style.right = '0'; // Changed from left to right
    navAccountContainer.style.zIndex = '1000';
    navAccountContainer.style.maxWidth = '300px'; // Add max width
    navGiveLink.parentNode.style.position = 'relative';
    navGiveLink.parentNode.appendChild(navAccountContainer);
    
    navGiveLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const accounts = C.give?.accounts;
      if (accounts && accounts.length) {
        if (navAccountContainer.style.display === 'none') {
          navAccountContainer.innerHTML = '';
          accounts.forEach(acc => {
            const a = document.createElement('a');
            a.href = acc.url || '#';
            a.className = 'account-link';
            a.textContent = acc.text || acc;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            navAccountContainer.appendChild(a);
          });
          
          // Position the dropdown to stay within viewport
          navAccountContainer.style.display = 'block';
          const rect = navAccountContainer.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          // If dropdown goes off the right edge, position it to the left
          if (rect.right > viewportWidth) {
            navAccountContainer.style.right = 'auto';
            navAccountContainer.style.left = '0';
          }
          
          // If dropdown goes off the left edge, position it to the right
          if (rect.left < 0) {
            navAccountContainer.style.left = 'auto';
            navAccountContainer.style.right = '0';
          }
          
        } else {
          navAccountContainer.style.display = 'none';
        }
      }
      return false;
    });
    
    // Close accounts container when clicking outside
    document.addEventListener('click', function(e) {
      if (!navGiveLink.contains(e.target) && !navAccountContainer.contains(e.target)) {
        navAccountContainer.style.display = 'none';
      }
    });
  }

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
    aboutEl.innerHTML = highlighted.replace(/\n\s*\n/g, '<br><br>');
  } catch (e) {
    try { document.getElementById('aboutText').textContent = C.about?.paragraph || ''; } catch (err) {}
  }

  // Ministries grid
  const mg = document.getElementById('ministriesGrid');
  const iconMap = {
    'Victory Over Darkness': '💫',
    'Let God Use You': '🙌',
    'Accelerate': '🚀',
    'Shift': '👶'
  };
  const programSermons = {
    'victory over darkness': [
      { label: 'Sermon', url: 'https://drive.google.com/file/d/1IXg0pl4xIkJSSdpIPLuFHZPokm4dBG4f/view?usp=drive_link' }
    ],
    'let god use you': [
      { label: 'Sermon', url: 'https://drive.google.com/file/d/1vaab8ZAVFWn5t_kP4SZTWiWLeBFqqhnf/view?usp=drive_link' }
    ],
    'accelerate': [
      { label: 'Sermon', url: 'https://drive.google.com/file/d/1bJCx8YW5QaTK7rmz3F9nk4-py1ys2P28/view?usp=drive_link' }
    ],
    'shift': [
      { label: 'Shift Day 1', url: 'https://drive.google.com/file/d/1zMUkRMB0qtUe-MYgI02ETIR5-5GWEkw1/view?usp=drive_link' },
      { label: 'Shift Day 2', url: 'https://drive.google.com/file/d/1AcN5KCPgWp89CoZKHdNfCxivbn_XNgdk/view?usp=drive_link' },
      { label: 'Shift Day 3', url: 'https://drive.google.com/file/d/1YgMY745loZNJty-yGVOAvOg7DJQt1K_A/view?usp=drive_link' }
    ]
  };
  mg.innerHTML = '';
  (C.ministries || []).forEach((m, idx)=>{
    const div = document.createElement('div');
    div.className = 'card ministry-card';
    div.setAttribute('data-icon', idx);

    let iconHtml = `<div class="ministry-icon">${iconMap[m.title] || '✨'}</div>`;
    if (m.title.toLowerCase() === 'victory over darkness') {
      iconHtml = `<div class="ministry-icon ministry-icon-vod"><img src="images/VOD.png" alt="Victory Over Darkness" class="ministry-image ministry-logo-bold"></div>`;
    } else if (m.title.toLowerCase() === 'let god use you') {
      iconHtml = `<div class="ministry-icon ministry-icon-lguy"><img src="images/LGUY.png" alt="Let God Use You" class="ministry-image ministry-logo-bold"></div>`;
    } else if (m.title.toLowerCase() === 'accelerate') {
      iconHtml = `<div class="ministry-icon ministry-icon-accelerate"><img src="images/slidea.png" alt="Accelerate" class="ministry-image ministry-logo-bold"></div>`;
    } else if (m.title.toLowerCase() === 'shift') {
      iconHtml = `<div class="ministry-icon"><img src="images/slideY.png" alt="Shift" class="ministry-image"></div>`;
    }

    let sermonHtml = '';
    const sermonsForProgram = programSermons[m.title.toLowerCase()];
    if (sermonsForProgram && sermonsForProgram.length) {
      const sermonLinks = sermonsForProgram.map((s) =>
        `<a class="btn primary" href="${s.url}" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; margin-bottom:8px; text-align:center;">${s.label}</a>`
      ).join('');
      sermonHtml = `<div style="margin-top:14px;">${sermonLinks}</div>`;
    }

    div.innerHTML = `
      ${iconHtml}
      <p class="muted small">${m.desc}</p>
      ${sermonHtml}
    `;
    mg.appendChild(div);
  });

  // Sermons
  const sg = document.getElementById('sermonGrid');
  sg.innerHTML = '';
  (C.sermons || []).forEach(s=>{
    const art = document.createElement('article');
    art.className = 'card';
    // store links for this sermon so the selector can show them
    window.SERMON_LINKS = window.SERMON_LINKS || {};
    window.SERMON_LINKS[s.id] = { primary: s.url, extra: Array.isArray(s.extra) ? s.extra : [] };
    const excerptHtml = s.excerpt ? `<p class="muted small">${s.excerpt}</p>` : '';
    const speakerText = s.speaker && s.speaker.trim() ? `${s.speaker} • ` : '';
    const imageHtml = s.image ? `<img src="${s.image}" alt="${s.title}" style="width:100%; height:420px; object-fit:cover; object-position:center top; border-radius:8px; margin-bottom:12px; display:block;">` : '';
    const seriesHtml = s.series && s.series.trim() ? `<div class="sermon-thumb">${s.series}</div>` : '';
    let playButton = '';
    if (s.url || (s.extra && s.extra.length)) {
      playButton = `<button class="btn" onclick="showSermonOptions('${s.id}')">Play</button>`;
    } else {
      playButton = `<button class="btn" data-sermon="${s.id}" onclick="openSermon(event)">Play</button>`;
    }
    art.innerHTML = `
      ${imageHtml}
      ${seriesHtml}
      <h3>${s.title}</h3>
      ${excerptHtml}
      <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        ${playButton}
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
      <div class="event-content">
        <div class="event-title">${ev.title}</div>
        <div class="event-desc">${ev.desc}</div>
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

  // Contact form submit - open WhatsApp
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // gather form values
      const name = (document.getElementById('name') || {}).value || '';
      const message = (document.getElementById('message') || {}).value || '';
      const phone = '2348039939305'; // WhatsApp number without leading plus
      let text = '';
      if (name) text += 'Name: ' + name + '%0A';
      if (message) text += 'Message: ' + message;
      const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
      // open WhatsApp link in new tab
      window.open(url, '_blank');
      contactForm.reset();
    });
  }

  // Sermon open stub (replace with actual embed)
  window.openSermon = function (evt) {
    const btn = evt.currentTarget;
    const id = btn.getAttribute('data-sermon');
    alert('Open sermon player for: ' + id + ' (replace this with real embed).');
  };

  // Toggle notes display
  window.toggleNotes = function (evt, sermonId) {
    evt.preventDefault();
    evt.stopPropagation();
    const notesEl = document.getElementById('notes-' + sermonId);
    if (notesEl) {
      const isHidden = notesEl.style.display === 'none';
      notesEl.style.display = isHidden ? 'block' : 'none';
    }
  };

  // Show a modal to choose which sermon link to play (primary or extras)
  window.showSermonOptions = function (sermonId) {
    const data = window.SERMON_LINKS && window.SERMON_LINKS[sermonId];
    if (!data) return;

    // create modal container if not present
    let modal = document.getElementById('sermonLinkModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sermonLinkModal';
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0,0,0,0.5)';
      modal.style.zIndex = '2000';
      document.body.appendChild(modal);
    }

    // build content
    modal.innerHTML = '';
    const box = document.createElement('div');
    box.style.background = '#0f1115';
    box.style.padding = '20px';
    box.style.borderRadius = '10px';
    box.style.minWidth = '280px';
    box.style.maxWidth = '90%';
    box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';

    const title = document.createElement('h3');
    title.textContent = 'Choose link to play';
    title.style.marginTop = '0';
    title.style.marginBottom = '12px';
    box.appendChild(title);

    // primary link
    if (data.primary) {
      const a = document.createElement('a');
      a.className = 'btn primary';
      a.href = data.primary;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Primary';
      a.style.display = 'block';
      a.style.marginBottom = '8px';
      box.appendChild(a);
    }

    // extra links
    if (Array.isArray(data.extra) && data.extra.length) {
      data.extra.forEach(function(e) {
        const b = document.createElement('a');
        b.className = 'btn secondary';
        b.href = e.url;
        b.target = '_blank';
        b.rel = 'noopener noreferrer';
        b.textContent = e.label || 'Link';
        b.style.display = 'block';
        b.style.marginBottom = '8px';
        box.appendChild(b);
      });
    }

    const close = document.createElement('button');
    close.className = 'btn';
    close.textContent = 'Close';
    close.style.marginTop = '8px';
    close.addEventListener('click', function() { modal.style.display = 'none'; });
    box.appendChild(close);

    modal.appendChild(box);
    modal.style.display = 'flex';
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