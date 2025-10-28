(function () {
  const POSTS_URL = '/blog.json';
  const PAGE_SIZE = 10;

  // Tag display rules
  const MIN_COUNT = 2;          // default-visible: tags used by >= 2 posts
  const INITIAL_LIMIT = 12;     // show top N (by count), rest collapsed under "More tags"

  // --- Query/state ---
  const qs = new URLSearchParams(location.search);
  const q = (qs.get('q') || '').trim();
  const category = (qs.get('category') || 'all').trim();
  const selectedTag = (qs.get('tag') || '').trim();
  const page = Math.max(1, parseInt(qs.get('page') || '1', 10));

  // --- Init UI state for category tabs + sidebar form ---
  markActiveTabs();
  fillSidebarForm();
  setResultsHeading(q, category, selectedTag);

  // --- Load posts + render ---
  load().catch(() => { /* quiet fail */ });

  // ----------------- helpers -----------------
  function markActiveTabs() {
    const tabs = document.querySelectorAll('.category-filter-bar .category-filter-button');
    tabs.forEach(a => {
      const c = a.getAttribute('data-category');
      const active = (category ? c === category : c === 'all');
      a.classList.toggle('active', active);
      a.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function fillSidebarForm() {
    const input = document.getElementById('sidebar-search');
    const select = document.getElementById('sidebar-category');
    if (input)  input.value = q;
    if (select) select.value = category === 'all' ? '' : category;
  }

  function setResultsHeading(q, category, tag) {
    const h = document.getElementById('resultsHeading');
    if (!h) return;
    const bits = [];
    if (q) bits.push(`“${q}”`);
    if (category && category !== 'all') bits.push(category);
    if (tag) bits.push(`#${tag}`);
    h.textContent = bits.length ? `Results: ${bits.join(' · ')}` : 'Recent Articles';
  }

  function parseDate(d) { return d ? new Date(d) : new Date(0); }
  function byDateDesc(a, b){ return parseDate(b.date) - parseDate(a.date); }
  function normalize(s){ return (s || '').toLowerCase(); }

  function matchesQuery(post, query) {
    if (!query) return true;
    const hay = [
      post.title, post.summary, post.category,
      ...(post.tags || [])
    ].map(normalize).join(' ');
    return hay.includes(normalize(query));
  }
  function matchesCategory(post, c) {
    if (!c || c === 'all') return true;
    return normalize(post.category) === normalize(c);
  }
  function matchesTag(post, t) {
    if (!t) return true;
    return (post.tags || []).map(normalize).includes(normalize(t));
  }

  function cardHTML(p) {
    const img = p.smallImage || p.image || '/images/blog/placeholder-small.png';
    const imgAlt = p.smallImageAlt || p.imageAlt || '';
    const safeDate = p.date ? new Date(p.date) : null;
    const niceDate = safeDate ? safeDate.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' }) : '';
    const tags = (p.tags || []).map(t => `<a class="tag-pill" href="/blog.html?tag=${encodeURIComponent(t)}">${t}</a>`).join('');
    return `
      <article class="article-card">
        <div class="post-thumbnail">
          <a href="${p.url}"><img src="${img}" alt="${imgAlt}"></a>
        </div>
        <div class="post-content">
          <h3><a href="${p.url}">${p.title}</a></h3>
          <p class="post-meta"><span>${niceDate}</span></p>
          <div class="post-tags">${tags}</div>
        </div>
      </article>`;
  }

  function featuredHTML(p) {
    const img = p.image || p.smallImage || '/images/blog/placeholder-large.jpg';
    const imgAlt = p.imageAlt || p.smallImageAlt || '';
    const safeDate = p.date ? new Date(p.date) : null;
    const niceDate = safeDate ? safeDate.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' }) : '';
    const tags = (p.tags || []).map(t => `<a class="tag-pill" href="/blog.html?tag=${encodeURIComponent(t)}">${t}</a>`).join('');
    return `
      <div class="post-thumbnail">
        <a href="${p.url}"><img src="${img}" alt="${imgAlt}"></a>
      </div>
      <div class="post-content">
        <h3><a href="${p.url}">${p.title}</a></h3>
        <p class="post-meta">
          <svg class="icon" viewBox="0 0 24 24"><path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path></svg>
          <span>${niceDate}</span>
        </p>
        <p>${p.summary || ''}</p>
        <div class="post-tags">${tags}</div>
        <a href="${p.url}" class="button-primary">Read More</a>
      </div>`;
  }

  function renderPagination(total, page, pageSize) {
    const el = document.getElementById('pagination');
    if (!el) return;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1) { el.hidden = true; el.innerHTML=''; return; }

    const mkHref = (n) => {
      const s = new URLSearchParams(location.search);
      s.set('page', String(n));
      return `${location.pathname}?${s.toString()}`;
    };

    let html = '';
    html += (page > 1)
      ? `<a href="${mkHref(page-1)}">&laquo;</a>`
      : `<a class="disabled" aria-disabled="true">&laquo;</a>`;

    for (let i=1; i<=pages; i++){
      html += (i === page)
        ? `<span class="current-page">${i}</span>`
        : `<a href="${mkHref(i)}">${i}</a>`;
    }

    html += (page < pages)
      ? `<a href="${mkHref(page+1)}">&raquo;</a>`
      : `<a class="disabled" aria-disabled="true">&raquo;</a>`;

    el.innerHTML = html;
    el.hidden = false;
  }

  // --- Tag bar (All tags + default top, with collapsible remainder) ---
  function renderTagBar(posts, currentTag) {
    // Skip tag bar entirely on small screens
    if (window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches) return;

    const mount = document.getElementById('tagFilter');
    if (!mount) return;

    // Count tags (normalize for key; keep original label for display)
    const counts = new Map();   // key: lower => { label, count }
    for (const p of posts) {
        const tags = Array.isArray(p.tags) ? p.tags : [];
        for (const tRaw of tags) {
        const label = String(tRaw).trim();
        if (!label) continue;
        const key = label.toLowerCase();
        const prev = counts.get(key);
        counts.set(key, { label: prev?.label || label, count: (prev?.count || 0) + 1 });
        }
    }

    if (counts.size === 0) { mount.innerHTML = ''; return; }

    // Sort by frequency desc, then alpha
    const allTags = [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    // Default-visible list: top N of tags where count >= MIN_COUNT
    const defaultVisible = allTags.filter(t => t.count >= MIN_COUNT);
    const INITIAL_LIMIT = 12; // keep your constant if defined above
    const top = defaultVisible.slice(0, INITIAL_LIMIT);

    // Hidden remainder = everything else (including single-use + overflow)
    const visibleKeys = new Set(top.map(t => t.label.toLowerCase()));
    const hidden = allTags.filter(t => !visibleKeys.has(t.label.toLowerCase()));

    // Helper: build href preserving q/category, resetting page
    const hrefWith = (updates) => {
        const s = new URLSearchParams(location.search);
        s.delete('page');
        Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === '') s.delete(k); else s.set(k, v);
        });
        return `${location.pathname}?${s.toString()}`;
    };

    // Updated pill function to fix URL (no count in query string)
    const pill = (label, isActive = false) =>
        `<a class="tag-pill${isActive ? ' active' : ''}" href="${
        isActive ? hrefWith({ tag: '' }) : hrefWith({ tag: label.replace(/^#/, '') })
        }">${label}</a>`;

    // Build HTML
    let html = '';
    // All tags pill first
    html += pill('All tags', !currentTag);

    // Default-visible pills
    html += top.map(t => pill(`#${t.label}`, t.label.toLowerCase() === currentTag.toLowerCase())).join('');

    // Toggle block if needed
    let moreId = '';
    if (hidden.length) {
        moreId = 'tag-more-' + Math.random().toString(36).slice(2);
        html += `
        <button class="tag-filter-toggle" type="button"
                id="toggleTags"
                aria-expanded="false"
                aria-controls="${moreId}">
            … more
        </button>
        <span id="${moreId}" class="tag-more-box" aria-hidden="true">
            ${hidden.map(t => pill(`#${t.label}`, t.label.toLowerCase() === currentTag.toLowerCase())).join('')}
            <button class="tag-filter-toggle" type="button"
                    data-close="1"
                    aria-expanded="true"
                    aria-controls="${moreId}">
            … less
            </button>
        </span>`;
    }

    mount.innerHTML = html;

    // Smooth expand/collapse
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const opener = document.getElementById('toggleTags');
    const box = moreId ? document.getElementById(moreId) : null;

    function openBox() {
        if (!box) return;
        if (reduceMotion) {
        box.style.maxHeight = 'none';
        box.classList.add('is-open');
        box.setAttribute('aria-hidden', 'false');
        opener && opener.setAttribute('aria-expanded', 'true');
        opener && (opener.textContent = '… less');
        return;
        }
        // measure -> set exact height for smooth animation
        box.style.maxHeight = '0px';
        box.classList.add('is-open');
        box.setAttribute('aria-hidden', 'false');
        // next frame to allow the class to apply
        requestAnimationFrame(() => {
        const h = box.scrollHeight;
        box.style.maxHeight = h + 'px';
        opener && opener.setAttribute('aria-expanded', 'true');
        opener && (opener.textContent = '… less');
        });
    }

    function closeBox() {
        if (!box) return;
        if (reduceMotion) {
        box.classList.remove('is-open');
        box.style.maxHeight = '0px';
        box.setAttribute('aria-hidden', 'true');
        opener && opener.setAttribute('aria-expanded', 'false');
        opener && (opener.textContent = '… more');
        return;
        }
        const h = box.scrollHeight;
        box.style.maxHeight = h + 'px'; // set current height first
        // next frame collapse
        requestAnimationFrame(() => {
        box.style.maxHeight = '0px';
        box.classList.remove('is-open');
        box.setAttribute('aria-hidden', 'true');
        opener && opener.setAttribute('aria-expanded', 'false');
        opener && (opener.textContent = '… more');
        });
    }

    if (opener && box) {
        opener.addEventListener('click', () => {
        const expanded = opener.getAttribute('aria-expanded') === 'true';
        expanded ? closeBox() : openBox();
        });

        mount.querySelectorAll('.tag-filter-toggle[data-close="1"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBox();
            opener && opener.focus();
        });
        });
    }
    }

  // ----------------- main load -----------------
  async function load() {
    let posts = [];
    try {
      const res = await fetch(POSTS_URL, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('no json');
      posts = (await res.json())
        .filter(p => p && p.title && p.url)
        .sort(byDateDesc);
    } catch {
      return;
    }

    // Render tag bar first
    renderTagBar(posts, selectedTag);

    // Filter
    let filtered = posts.filter(p =>
      matchesCategory(p, category) &&
      matchesTag(p, selectedTag) &&
      matchesQuery(p, q)
    );

    const featuredSection = document.getElementById('featuredSection');
    const featuredCard = document.getElementById('featuredCard');
    const grid = document.getElementById('resultsGrid');

    if (!filtered.length) {
      if (grid) grid.innerHTML = `<p>No articles matched your search. Showing recent posts instead.</p>`;
      filtered = posts.slice();
    }

    // Featured (prefer pinned within filtered)
    let featured = filtered.find(p => p.pinned) || filtered[0];
    if (featuredSection && featuredCard && featured) {
      featuredCard.innerHTML = featuredHTML(featured);
      featuredSection.hidden = false;
    }

    const rest = filtered.filter(p => p !== featured);

    // Pagination
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = rest.slice(start, start + PAGE_SIZE);
    renderPagination(rest.length, page, PAGE_SIZE);

    // Cards
    if (grid) {
      grid.innerHTML = pageItems.map(cardHTML).join('') || '<p>No more articles to show.</p>';
    }
  }
})();
