/**
 * =============================================================================
 * PHOTOBOOTH ARCHIVE — SMK YASBAM, TEKNIK JARINGAN KOMPUTER & TELEKOMUNIKASI (TJKT)
 * =============================================================================
 * Konfigurasi Master Data Arsip Acara (EVENTS)
 * -----------------------------------------------------------------------------
 * PANDUAN PENGELOLAAN / MENAMBAH / MENGUBAH ACARA:
 * 1. Setiap acara memiliki:
 *    - `id`         : ID unik huruf kecil/angka (contoh: 'perpisahan-2026')
 *    - `title`      : Judul nama acara
 *    - `date`       : Tanggal format 'YYYY-MM-DD' (menentukan urutan kalender terbaru)
 *    - `description`: Keterangan ringkas acara
 *    - `albums`     : Objek tautan album Google Photos:
 *        - `frame`    : Link Google Photos foto frame
 *        - `original` : Link Google Photos foto asli
 *        - `unclaimed`: Link Google Photos foto belum diambil
 *
 * CARA MENGHILANGKAN TOMBOL KATEGORI YANG BELUM ADA LINK-NYA:
 * - Cukup isi dengan string kosong `''` ATAU hapus barisnya.
 *   Contoh: `unclaimed: ''` -> Tombol Unclaimed otomatis TIDAK MUNCUL di website!
 * =============================================================================
 */

const EVENTS = [
  {
    id: 'pramuka-lkkp-2026',
    title: 'Acara Lomba Pramuka LKKP',
    date: '2026-10-17',
    description: 'Sesi foto photobooth peserta lomba pramuka dan para pembina gugus depan SMK YASBAM.',
    albums: {
      frame: 'https://photos.app.goo.gl/8iMcSdWG46wD2qX26',
      original: 'https://photos.app.goo.gl/zdg938AuwxseLjvC7',
      unclaimed: 'https://photos.app.goo.gl/f4MMyhuKi7GtzYB6A'
    }
  }
];

// =============================================================================
// VALIDASI & PENGURUTAN ACARA BERDASARKAN TANGGAL KALENDER TERBARU
// =============================================================================

function getValidatedEvents() {
  const seenIds = new Set();
  const list = [];

  EVENTS.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const id = (item.id || `event-${index}`).trim();
    if (seenIds.has(id)) {
      console.warn(`[Archive Warning] Duplikasi ID '${id}' pada entri ${index}. ID harus unik.`);
      return;
    }
    seenIds.add(id);

    const rawDate = item.date || '1970-01-01';
    const timestamp = new Date(rawDate).getTime();
    const safeTime = isNaN(timestamp) ? 0 : timestamp;

    const alb = (item.albums && typeof item.albums === 'object') ? item.albums : {};

    list.push({
      id: id,
      title: item.title || 'Acara Tanpa Judul',
      date: rawDate,
      timestamp: safeTime,
      year: rawDate.substring(0, 4),
      description: item.description || 'Tidak ada deskripsi tersedia.',
      albums: {
        frame: typeof alb.frame === 'string' ? alb.frame.trim() : '',
        original: typeof alb.original === 'string' ? alb.original.trim() : '',
        unclaimed: typeof alb.unclaimed === 'string' ? alb.unclaimed.trim() : ''
      }
    });
  });

  // Urutkan tanggal kalender descending (terbaru di atas)
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

const SORTED_EVENTS = getValidatedEvents();

// =============================================================================
// HELPER FORMATTING & UTILITIES
// =============================================================================

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day) && !isNaN(year)) {
    return `${day} ${months[monthIdx]} ${year}`;
  }
  return dateStr;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAvailableAlbums(albums) {
  const result = [];
  if (albums.frame) result.push({ key: 'frame', label: 'Frame', url: albums.frame });
  if (albums.original) result.push({ key: 'original', label: 'Original', url: albums.original });
  if (albums.unclaimed) result.push({ key: 'unclaimed', label: 'Unclaimed', url: albums.unclaimed });
  return result;
}

// =============================================================================
// RENDER KARTU ARSIP TERBARU (3 ACARA TERBARU)
// =============================================================================

function createRecentCard(event) {
  const card = document.createElement('article');
  const activeAlbums = getAvailableAlbums(event.albums);
  const categoriesStr = activeAlbums.map(a => a.key).join(' ');

  card.className = 'album-card';
  card.dataset.category = categoriesStr;
  card.dataset.title = `${event.title} ${event.description} ${event.date}`.toLowerCase();

  // Badges di header kartu
  const badgesHtml = activeAlbums.map(a => `<span class="album-card-badge badge-${a.key}">${a.label}</span>`).join('');
  const countLabel = activeAlbums.length > 0 ? `${activeAlbums.length} Kategori Album` : 'Album Segera';

  // Tombol aksi langsung ke Google Photos tanpa preview
  const buttonsHtml = activeAlbums.map(a => {
    let btnClass = 'btn-card-outline';
    if (a.key === 'frame') btnClass = 'btn-card-primary';
    else if (a.key === 'original') btnClass = 'btn-card-green';
    else if (a.key === 'unclaimed') btnClass = 'btn-card-amber';

    return `
      <a href="${escapeHTML(a.url)}" class="btn-card ${btnClass}" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>
        </svg>
        <span>Buka ${a.label}</span>
      </a>
    `;
  }).join('');

  card.innerHTML = `
    <div class="album-card-body">
      <div class="album-card-meta">
        <span class="album-card-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
          </svg>
          <time datetime="${event.date}">${formatDateIndo(event.date)}</time>
        </span>
        <span class="album-card-count">${countLabel}</span>
      </div>
      <div class="album-card-badges-row" style="display:flex; gap:6px; margin-bottom:10px;">
        ${badgesHtml}
      </div>
      <h3 class="album-card-title">${escapeHTML(event.title)}</h3>
      <p class="album-card-desc">${escapeHTML(event.description)}</p>
      <div class="album-card-actions">
        ${buttonsHtml || '<span style="font-size:0.8rem;color:#94a3b8;">Tautan album sedang dipersiapkan</span>'}
      </div>
    </div>
  `;

  return card;
}

/**
 * Render Baris Direktori untuk Bagian "Semua Arsip Acara"
 */
function createAllEventRow(event) {
  const row = document.createElement('div');
  row.className = 'all-event-row';
  const activeAlbums = getAvailableAlbums(event.albums);

  const chipsHtml = activeAlbums.length > 0
    ? activeAlbums.map(a => `<span class="album-card-badge badge-${a.key}">${a.label}</span>`).join('')
    : '<span style="font-size:0.75rem;color:#94a3b8;">Belum ada album</span>';

  const buttonsHtml = activeAlbums.map(a => {
    let btnClass = 'btn-card-outline';
    if (a.key === 'frame') btnClass = 'btn-card-primary';
    else if (a.key === 'original') btnClass = 'btn-card-green';
    else if (a.key === 'unclaimed') btnClass = 'btn-card-amber';

    return `
      <a href="${escapeHTML(a.url)}" class="btn-card ${btnClass}" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>
        </svg>
        <span>${a.label}</span>
      </a>
    `;
  }).join('');

  row.innerHTML = `
    <div class="all-event-date-col">
      <span class="all-event-date-formatted">${formatDateIndo(event.date)}</span>
      <span class="all-event-date-iso">${event.date}</span>
    </div>
    <div class="all-event-main-col">
      <h3 class="all-event-title">${escapeHTML(event.title)}</h3>
      <p class="all-event-desc">${escapeHTML(event.description)}</p>
      <div class="all-event-chips">
        ${chipsHtml}
      </div>
    </div>
    <div class="all-event-actions-col">
      ${buttonsHtml || '<span style="font-size:0.8rem;color:#94a3b8;">Segera</span>'}
    </div>
  `;

  return row;
}

// =============================================================================
// INISIALISASI & INTERAKSI
// =============================================================================

(function() {
  'use strict';

  // 1. Render Tepat 3 Acara Terbaru pada Bagian #arsip
  function renderRecentSection() {
    const grid = document.getElementById('albumGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Ambil tepat 3 acara terbaru
    const topThree = SORTED_EVENTS.slice(0, 3);
    topThree.forEach(event => {
      grid.appendChild(createRecentCard(event));
    });
  }

  // 2. Render Bagian Semua Arsip Acara dengan Filter Tahun
  let currentYear = 'all';

  function renderAllEventsSection() {
    const listContainer = document.getElementById('allEventsList');
    const badge = document.getElementById('allEventsCountBadge');
    const yearContainer = document.getElementById('yearFilterTabs');
    if (!listContainer) return;

    const years = Array.from(new Set(SORTED_EVENTS.map(e => e.year))).filter(Boolean);

    // Bangun filter tahun jika belum ada
    if (yearContainer && yearContainer.children.length === 0) {
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'year-chip active';
      allBtn.textContent = 'Semua Tahun';
      allBtn.addEventListener('click', () => {
        currentYear = 'all';
        updateYearTabs(allBtn);
        renderAllEventsSection();
      });
      yearContainer.appendChild(allBtn);

      years.forEach(yr => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'year-chip';
        btn.textContent = `Tahun ${yr}`;
        btn.addEventListener('click', () => {
          currentYear = yr;
          updateYearTabs(btn);
          renderAllEventsSection();
        });
        yearContainer.appendChild(btn);
      });
    }

    const filtered = currentYear === 'all'
      ? SORTED_EVENTS
      : SORTED_EVENTS.filter(e => e.year === currentYear);

    if (badge) {
      badge.textContent = `${filtered.length} Acara`;
    }

    listContainer.innerHTML = '';
    filtered.forEach(event => {
      listContainer.appendChild(createAllEventRow(event));
    });
  }

  function updateYearTabs(activeBtn) {
    const yearContainer = document.getElementById('yearFilterTabs');
    if (yearContainer) {
      Array.from(yearContainer.children).forEach(btn => btn.classList.remove('active'));
    }
    if (activeBtn) activeBtn.classList.add('active');
  }

  // 3. Navbar scroll & active link
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (navbar) {
      if (scrollY > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }

    if (backToTop) {
      if (scrollY > 500) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }

    // Active nav link highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let currentId = '';

    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (window.scrollY >= secTop) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Mobile Menu Toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // 5. Fitur Pencarian Dinamis (Mencari di Seluruh Arsip Acara)
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchChips = document.querySelectorAll('.search-chip');
  const emptyState = document.getElementById('emptyState');
  const resetFilterBtn = document.getElementById('resetFilter');

  let currentCategoryFilter = 'all';

  function filterAlbums() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const grid = document.getElementById('albumGrid');
    if (!grid) return;

    grid.innerHTML = '';
    let matches = [];

    // Jika sedang ada pencarian, cari dari SEMUA arsip yang cocok!
    const pool = searchTerm !== '' ? SORTED_EVENTS : SORTED_EVENTS.slice(0, 3);

    pool.forEach(event => {
      const activeAlbums = getAvailableAlbums(event.albums);
      const categoriesStr = activeAlbums.map(a => a.key).join(' ');
      const searchTarget = `${event.title} ${event.description} ${event.date}`.toLowerCase();

      const matchesSearch = searchTerm === '' || searchTarget.includes(searchTerm);
      const matchesCategory = currentCategoryFilter === 'all' || categoriesStr.includes(currentCategoryFilter);

      if (matchesSearch && matchesCategory) {
        matches.push(event);
      }
    });

    if (matches.length > 0) {
      if (emptyState) emptyState.style.display = 'none';
      matches.forEach(event => {
        grid.appendChild(createRecentCard(event));
      });
    } else {
      if (emptyState) emptyState.style.display = 'block';
    }

    if (searchClear) {
      searchClear.style.display = searchTerm !== '' ? 'flex' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterAlbums);
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        filterAlbums();
        searchInput.focus();
      }
    });
  }

  searchChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = chip.dataset.search;
        filterAlbums();
        // Scroll halus ke bagian arsip
        const arsipEl = document.getElementById('arsip');
        if (arsipEl) {
          window.scrollTo({ top: arsipEl.offsetTop - 80, behavior: 'smooth' });
        }
      }
    });
  });

  // Filter Tabs Kategori (All, Frame, Original, Unclaimed)
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategoryFilter = tab.dataset.filter;
      filterAlbums();
    });
  });

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentCategoryFilter = 'all';
      filterTabs.forEach(t => t.classList.remove('active'));
      const allTab = document.querySelector('[data-filter="all"]');
      if (allTab) allTab.classList.add('active');
      filterAlbums();
    });
  }

  // Footer Filter Links
  document.querySelectorAll('[data-filter-link]').forEach(link => {
    link.addEventListener('click', () => {
      const cat = link.dataset.filterLink;
      currentCategoryFilter = cat;
      filterTabs.forEach(t => {
        t.classList.remove('active');
        if (t.dataset.filter === cat) t.classList.add('active');
      });
      filterAlbums();
    });
  });

  // Animasi Counter Angka di Hero
  function animateCounter(element, target, duration = 1200) {
    if (!element) return;
    let start = 0;
    const increment = target / (duration / 16);

    function update() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }
    update();
  }

  const totalAlbumEl = document.getElementById('totalAlbum');
  if (totalAlbumEl) {
    animateCounter(totalAlbumEl, SORTED_EVENTS.length);
  }

  // Initial render
  renderRecentSection();
  renderAllEventsSection();
  handleScroll();

})();
