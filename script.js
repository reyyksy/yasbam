/**
 * =============================================================================
 * PHOTOBOOTH ARCHIVE — SMK YASBAM, TEKNIK JARINGAN KOMPUTER & TELEKOMUNIKASI (TJKT)
 * =============================================================================
 * Konfigurasi Master Data Arsip Acara (EVENTS)
 * -----------------------------------------------------------------------------
 * PANDUAN MENAMBAHKAN ACARA BARU:
 * 1. Salin satu blok objek acara di bawah ini.
 * 2. Ubah `id`, `title`, `date` (format YYYY-MM-DD), `description`, dan `albums`.
 * 3. Kategori yang belum memiliki link Google Photos cukup diisi string kosong `''`.
 *    Sistem otomatis menyembunyikan tombolnya di halaman detail.
 * 4. Urutan tampilan otomatis dihitung berdasarkan tanggal terbaru (descending).
 *    3 acara teratas otomatis tampil di "Arsip Terbaru".
 *    Semua acara tanpa terkecuali dapat dilihat di tab/halaman "Semua Arsip Acara".
 * =============================================================================
 */

const EVENTS = [
  {
    id: 'perpisahan-yasbam-2026',
    title: 'Perpisahan Siswa SMK YASBAM Tahun Pelajaran 2025/2026',
    date: '2026-05-16',
    description: 'Dokumentasi softfile resmi photobooth pelepasan dan perpisahan siswa-siswi SMK YASBAM Tahun Pelajaran 2025/2026.',
    albums: {
      frame: 'https://photos.app.goo.gl/FCh7VjUT4iimDLWv5',
      original: 'https://photos.app.goo.gl/tF99rKhdWnQ6izgK9',
    }
  },
  {
    id: 'pramuka-lkkp-2026',
    title: 'Acara Lomba Pramuka LKKP',
    date: '2026-10-17',
    description: 'Sesi foto peserta lomba dan pembina',
    albums: {
      frame: 'https://photos.app.goo.gl/8iMcSdWG46wD2qX26',
      original: 'https://photos.app.goo.gl/example-hariguru2025-original',
      unclaimed: 'https://photos.app.goo.gl/f4MMyhuKi7GtzYB6A'
    }
  }
];

// =============================================================================
// VALIDASI & PENGURUTAN ACARA
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

  // Urutkan kalender descending (terbaru di atas)
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
  if (albums.frame) result.push({ key: 'frame', label: 'Frame' });
  if (albums.original) result.push({ key: 'original', label: 'Original' });
  if (albums.unclaimed) result.push({ key: 'unclaimed', label: 'Unclaimed' });
  return result;
}

// =============================================================================
// KOMPONEN RENDER (CARD & DIRECTORY ITEM)
// =============================================================================

/**
 * Render Kartu Acara (Beranda & Pencarian)
 */
function createEventCard(event, isRecent = false) {
  const card = document.createElement('article');
  card.className = 'event-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Buka arsip ${event.title}`);

  const activeAlbums = getAvailableAlbums(event.albums);
  const albumCountLabel = activeAlbums.length > 0 
    ? `${activeAlbums.length} Kategori Album` 
    : 'Album Segera Hadir';

  card.innerHTML = `
    <div class="event-card-top">
      <div class="event-card-header-meta">
        <span class="meta-date-chip">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <time datetime="${event.date}">${formatDateIndo(event.date)}</time>
        </span>
        ${isRecent ? '<span class="badge-tag badge-tag-recent">Terbaru</span>' : ''}
      </div>
      <h3 class="event-card-title">${escapeHTML(event.title)}</h3>
    </div>
    <p class="event-card-desc">${escapeHTML(event.description)}</p>
    <div class="event-card-bottom">
      <span class="album-count-tag">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        ${albumCountLabel}
      </span>
      <span class="action-trigger-label">
        Buka Arsip
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </div>
  `;

  const onOpen = () => navigateToEvent(event.id);
  card.addEventListener('click', onOpen);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  });

  return card;
}

/**
 * Render Kartu Direktori (Semua Arsip) — Mobile-First Friendly
 */
function createDirectoryItem(event) {
  const card = document.createElement('div');
  card.className = 'directory-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Lihat arsip ${event.title}`);

  const activeAlbums = getAvailableAlbums(event.albums);
  const chipsHtml = activeAlbums.length > 0
    ? activeAlbums.map(a => `<span class="chip-badge chip-${a.key}">${a.label}</span>`).join('')
    : '<span class="chip-badge chip-none">Segera</span>';

  card.innerHTML = `
    <div class="dir-card-date-row">
      <time datetime="${event.date}" class="dir-date-text">${formatDateIndo(event.date)}</time>
      <span class="dir-date-code">${event.date}</span>
    </div>
    <div class="dir-card-main-col">
      <h3 class="dir-card-heading">${escapeHTML(event.title)}</h3>
      <p class="dir-card-details">${escapeHTML(event.description)}</p>
      <div class="dir-card-chips">
        ${chipsHtml}
      </div>
    </div>
    <div class="dir-card-footer">
      <span class="btn-open-dir">
        <span>Buka Arsip</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </div>
  `;

  const onOpen = () => navigateToEvent(event.id);
  card.addEventListener('click', onOpen);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  });

  return card;
}

// =============================================================================
// NAVIGASI VIEW & STATE (Beranda, Semua Arsip, Detail Acara)
// =============================================================================

function showView(viewName) {
  const mainView = document.getElementById('mainView');
  const allEventsView = document.getElementById('allEventsView');
  const detailView = document.getElementById('detailView');

  const navHomeBtn = document.getElementById('navHomeBtn');
  const navAllEventsBtn = document.getElementById('navAllEventsBtn');

  // Sembunyikan semua tampilan
  if (mainView) mainView.hidden = true;
  if (allEventsView) allEventsView.hidden = true;
  if (detailView) detailView.hidden = true;

  // Reset tab aktif
  if (navHomeBtn) navHomeBtn.classList.remove('active');
  if (navAllEventsBtn) navAllEventsBtn.classList.remove('active');

  if (viewName === 'all') {
    if (allEventsView) allEventsView.hidden = false;
    if (navAllEventsBtn) navAllEventsBtn.classList.add('active');
    renderAllEventsDirectory();
  } else if (viewName === 'detail') {
    if (detailView) detailView.hidden = false;
  } else {
    // Default: 'home'
    if (mainView) mainView.hidden = false;
    if (navHomeBtn) navHomeBtn.classList.add('active');
    renderRecentEvents();
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigateToHome() {
  window.location.hash = '';
  showView('home');
}

function navigateToAllEvents() {
  window.location.hash = 'all-events';
  showView('all');
}

function navigateToEvent(eventId) {
  window.location.hash = `event=${encodeURIComponent(eventId)}`;
  renderEventDetail(eventId);
}

// =============================================================================
// RENDER HALAMAN
// =============================================================================

/**
 * Render 3 Acara Terbaru
 */
function renderRecentEvents() {
  const container = document.getElementById('recentEventsList');
  if (!container) return;

  container.innerHTML = '';
  const topThree = SORTED_EVENTS.slice(0, 3);

  if (topThree.length === 0) {
    container.innerHTML = '<div class="empty-notice-card"><p>Belum ada arsip acara.</p></div>';
    return;
  }

  topThree.forEach((event) => {
    container.appendChild(createEventCard(event, true));
  });
}

/**
 * Render Halaman Direktori Semua Acara dengan Filter Tahun
 */
let currentYearFilter = 'all';

function renderAllEventsDirectory() {
  const container = document.getElementById('directoryList');
  const countBadge = document.getElementById('totalEventsBadge');
  const yearFilterContainer = document.getElementById('yearFilterButtons');
  if (!container) return;

  // Bangun tombol tahun jika belum ada
  const years = Array.from(new Set(SORTED_EVENTS.map(e => e.year))).filter(Boolean);

  if (yearFilterContainer && yearFilterContainer.children.length === 0) {
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'Semua Tahun';
    allBtn.addEventListener('click', () => {
      setYearFilter('all', allBtn);
    });
    yearFilterContainer.appendChild(allBtn);

    years.forEach(yr => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.textContent = `Tahun ${yr}`;
      btn.addEventListener('click', () => {
        setYearFilter(yr, btn);
      });
      yearFilterContainer.appendChild(btn);
    });
  }

  // Filter berdasarkan tahun
  const filtered = currentYearFilter === 'all'
    ? SORTED_EVENTS
    : SORTED_EVENTS.filter(e => e.year === currentYearFilter);

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Acara`;
  }

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-notice-card"><p>Tidak ada arsip untuk tahun yang dipilih.</p></div>';
    return;
  }

  filtered.forEach(event => {
    container.appendChild(createDirectoryItem(event));
  });
}

function setYearFilter(year, activeBtn) {
  currentYearFilter = year;
  const yearFilterContainer = document.getElementById('yearFilterButtons');
  if (yearFilterContainer) {
    Array.from(yearFilterContainer.children).forEach(btn => btn.classList.remove('active'));
  }
  if (activeBtn) activeBtn.classList.add('active');
  renderAllEventsDirectory();
}

/**
 * Render Detail Acara
 */
function renderEventDetail(eventId) {
  const event = SORTED_EVENTS.find(e => e.id === eventId);
  if (!event) {
    console.error(`Acara '${eventId}' tidak ditemukan.`);
    navigateToHome();
    return;
  }

  showView('detail');

  const titleEl = document.getElementById('detailTitle');
  const dateEl = document.getElementById('detailDate');
  const descEl = document.getElementById('detailDesc');
  const albumsContainer = document.getElementById('detailAlbumsList');
  const emptyAlbumsNotice = document.getElementById('emptyAlbumsNotice');

  if (titleEl) titleEl.textContent = event.title;
  if (dateEl) {
    dateEl.textContent = formatDateIndo(event.date);
    dateEl.setAttribute('datetime', event.date);
  }
  if (descEl) descEl.textContent = event.description;

  if (albumsContainer) {
    albumsContainer.innerHTML = '';
    let renderedCount = 0;

    // 1. FRAME
    if (event.albums.frame) {
      renderedCount++;
      albumsContainer.appendChild(createAlbumActionCard({
        category: 'frame',
        title: 'Foto Frame Resmi',
        badge: 'Edited with Frame',
        desc: 'Softfile hasil foto photobooth yang telah dilengkapi bingkai grafis resmi acara siap dibagikan.',
        url: event.albums.frame,
        btnLabel: 'Buka Album Frame'
      }));
    }

    // 2. ORIGINAL
    if (event.albums.original) {
      renderedCount++;
      albumsContainer.appendChild(createAlbumActionCard({
        category: 'original',
        title: 'Foto Original (Asli)',
        badge: 'High-Res Unedited',
        desc: 'File jepretan asli resolusi penuh langsung dari kamera stan tanpa modifikasi bingkai.',
        url: event.albums.original,
        btnLabel: 'Buka Album Original'
      }));
    }

    // 3. UNCLAIMED
    if (event.albums.unclaimed) {
      renderedCount++;
      albumsContainer.appendChild(createAlbumActionCard({
        category: 'unclaimed',
        title: 'Foto Belum Terklaim',
        badge: 'Unclaimed Photos',
        desc: 'Kumpulan softfile yang belum sempat dicetak atau belum diambil pemiliknya selama acara berlangsung.',
        url: event.albums.unclaimed,
        btnLabel: 'Buka Album Unclaimed'
      }));
    }

    if (emptyAlbumsNotice) {
      emptyAlbumsNotice.hidden = renderedCount > 0;
    }
  }
}

/**
 * Membuat Kartu Aksi Album Foto pada Detail Acara
 */
function createAlbumActionCard({ category, title, badge, desc, url, btnLabel }) {
  const card = document.createElement('div');
  card.className = `album-selection-card card-cat-${category}`;

  let iconSvg = '';
  if (category === 'frame') {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="7" y="7" width="10" height="10"></rect>
      </svg>`;
  } else if (category === 'original') {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>`;
  } else {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;
  }

  card.innerHTML = `
    <div class="album-card-header">
      <div class="album-icon-circle">${iconSvg}</div>
      <div class="album-header-text">
        <span class="chip-badge chip-${category}">${badge}</span>
        <h4 class="album-category-name">${title}</h4>
      </div>
    </div>
    <p class="album-desc-note">${desc}</p>
    <a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="btn-album-touch">
      <span>${btnLabel}</span>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  `;

  return card;
}

// =============================================================================
// FITUR PENCARIAN
// =============================================================================

function searchEvents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SORTED_EVENTS.filter(e => {
    return e.title.toLowerCase().includes(q) ||
           e.description.toLowerCase().includes(q) ||
           e.date.includes(q);
  });
}

function handleSearch(query) {
  const searchSection = document.getElementById('searchResultsSection');
  const resultsContainer = document.getElementById('searchResultsList');
  const countBadge = document.getElementById('resultsCount');
  const emptyState = document.getElementById('searchEmptyState');
  const emptyKeyword = document.getElementById('emptyQueryKeyword');

  const trimmed = query.trim();
  if (!trimmed) {
    if (searchSection) searchSection.hidden = true;
    if (resultsContainer) resultsContainer.innerHTML = '';
    return;
  }

  const results = searchEvents(trimmed);
  if (searchSection) searchSection.hidden = false;
  if (resultsContainer) resultsContainer.innerHTML = '';

  if (results.length === 0) {
    if (emptyState) emptyState.hidden = false;
    if (emptyKeyword) emptyKeyword.textContent = `"${trimmed}"`;
    if (countBadge) countBadge.textContent = '0 acara';
  } else {
    if (emptyState) emptyState.hidden = true;
    if (countBadge) countBadge.textContent = `${results.length} acara ditemukan`;
    results.forEach(event => {
      resultsContainer.appendChild(createEventCard(event, false));
    });
  }
}

// =============================================================================
// ROUTER HASH & INITIALIZATION
// =============================================================================

function routeFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#event=')) {
    const eventId = decodeURIComponent(hash.replace('#event=', ''));
    if (eventId) {
      renderEventDetail(eventId);
      return;
    }
  } else if (hash === '#all-events') {
    showView('all');
    return;
  }
  showView('home');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Pasang navigasi tab bar
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navAllEventsBtn = document.getElementById('navAllEventsBtn');
  const brandHomeLink = document.getElementById('brandHomeLink');
  const seeAllEventsLink = document.getElementById('seeAllEventsLink');
  const backToMainBtn = document.getElementById('backToMainBtn');

  if (navHomeBtn) {
    navHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToHome();
    });
  }

  if (navAllEventsBtn) {
    navAllEventsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToAllEvents();
    });
  }

  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToHome();
    });
  }

  if (seeAllEventsLink) {
    seeAllEventsLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToAllEvents();
    });
  }

  if (backToMainBtn) {
    backToMainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.length > 1 ? window.history.back() : navigateToHome();
    });
  }

  // 2. Input pencarian dengan debouncing
  const searchInput = document.getElementById('eventSearchInput');
  const searchForm = document.getElementById('eventSearchForm');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      const val = e.target.value;
      if (clearBtn) clearBtn.hidden = val.trim().length === 0;
      timer = setTimeout(() => {
        handleSearch(val);
      }, 150);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        clearBtn.hidden = true;
        handleSearch('');
        searchInput.focus();
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (searchInput) handleSearch(searchInput.value);
    });
  }

  // 3. Listener hash router
  window.addEventListener('popstate', routeFromHash);

  // 4. Initial route load
  routeFromHash();
});
