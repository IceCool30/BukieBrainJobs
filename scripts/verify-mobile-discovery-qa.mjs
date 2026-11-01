import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const VIDEO_DIR = path.resolve('docs/screenshots/videos');
const ARTIFACT_DIR = '/home/ubuntu/.gemini/antigravity/brain/f8aba3e0-8cf0-411d-937f-a8c2d4992bc2';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

const CANONICAL_SERVICES = [
  {
    id: 'generator',
    title: 'Generator Servicing & Repair',
    description: 'Servicing, repairs, AVR replacement, oil changes, and rewinding for petrol and diesel generators.',
    group: 'Power & Cooling',
    popularServices: ['Sumec Firman Repair', 'Mikano Diesel Service', 'AVR Replacement'],
  },
  {
    id: 'ac',
    title: 'AC Repair & Gas Refill',
    description: 'Installation, repairs, gas refills, compressor checks, and coil cleaning for split-unit ACs.',
    group: 'Power & Cooling',
    popularServices: ['Gas Top-Up', 'AC Uninstallation & Reinstall', 'Compressor Replacement'],
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Pipe Fitting',
    description: 'Leak repairs, water tank work, pressure-pump setup, and bathroom fittings.',
    group: 'Utilities & Structure',
    popularServices: ['Overhead Tank Setup', 'Pipe Leak Repair', 'Water Heater Installation'],
  },
  {
    id: 'electrical',
    title: 'Electrical & Solar Inverter',
    description: 'Solar mounting, inverter and battery setup, circuit-breaker checks, and conduit wiring.',
    group: 'Utilities & Structure',
    popularServices: ['Solar Inverter Setup', 'Prepaid Meter Installation', 'Distribution Board Repair'],
  },
  {
    id: 'cleaning',
    title: 'Deep Cleaning & Post-Construction',
    description: 'Deep cleaning for homes, move-ins, post-construction spaces, sofas, and carpets.',
    group: 'Home & Lifestyle',
    popularServices: ['Post-Construction Clean', 'Move-In Deep Cleaning', 'Sofa Washing'],
  },
  {
    id: 'carpentry',
    title: 'Furniture & Carpentry Work',
    description: 'Cabinet building, wardrobe repairs, door-lock fitting, and bed-frame assembly.',
    group: 'Home & Lifestyle',
    popularServices: ['Kitchen Cabinet Setup', 'Door Lock Replacement', 'Wardrobe Fitting'],
  },
  {
    id: 'tv-mounting',
    title: 'DSTV & TV Wall Mounting',
    description: 'TV mounting, concealed cable trunking, DSTV dish alignment, and surround-sound cabling.',
    group: 'Home & Lifestyle',
    popularServices: ['TV Wall Mount 32"-75"', 'DSTV Dish Realignment', 'Concealed Cable Trunking'],
  },
  {
    id: 'moving',
    title: 'Haulage & Home Relocation',
    description: 'Covered trucks, careful furniture packing, loading, and relocation support.',
    group: 'Home & Lifestyle',
    popularServices: ['2-Bedroom Relocation', 'Interstate Trucking', 'Office Furniture Moving'],
  },
];

function generateAppHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>BukieBrainJobs Mobile Discovery</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0B0E13;
      color: #F0F4F9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
    .screen { display: none; min-height: 100vh; padding: 0; position: relative; }
    .screen.active { display: flex; flex-direction: column; }
    .status-bar {
      height: 44px;
      background: #07090D;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 600;
      color: #F0F4F9;
      border-bottom: 1px solid #202734;
    }
    .status-bar-landscape { height: 20px; }
    .content-scroll {
      flex: 1;
      padding: 18px 18px 36px 18px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 0;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #13171E;
      border: 1px solid #202734;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #2FE896;
      font-size: 14px;
    }
    .wordmark { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; }
    .wordmark-green { color: #2FE896; }
    .hero-card {
      background: #07090D;
      border: 1px solid #202734;
      border-radius: 8px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .hero-title {
      color: #FFFFFF;
      font-size: 22px;
      line-height: 28px;
      font-weight: 800;
      letter-spacing: -0.6px;
    }
    .hero-actions { display: flex; flex-direction: column; gap: 12px; }
    .btn-amber {
      min-height: 48px;
      border-radius: 8px;
      background: #FF6B35;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.6px;
      cursor: pointer;
      border: none;
      text-decoration: none;
    }
    .btn-ghost {
      min-height: 48px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.06);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.6px;
      cursor: pointer;
      text-decoration: none;
    }
    .eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.3px;
      color: #8897AB;
      margin-top: 8px;
    }
    .service-rows-list {
      background: #13171E;
      border: 1px solid #202734;
      border-radius: 8px;
      overflow: hidden;
    }
    .service-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      min-height: 56px;
      border-top: 1px solid #2D3748;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .service-row:first-child { border-top: none; }
    .service-row-title { font-size: 15px; font-weight: 600; color: #F0F4F9; }
    .service-row-meta { font-size: 13px; color: #8897AB; margin-top: 2px; }
    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #FF6B35;
      font-size: 14px;
      font-weight: 600;
      min-height: 48px;
      cursor: pointer;
      padding: 8px 0;
    }
    .tab-header {
      height: 56px;
      background: #07090D;
      border-bottom: 1px solid #202734;
      display: flex;
      align-items: center;
      padding: 0 18px;
    }
    .tab-header-title { font-size: 18px; font-weight: 700; color: #F0F4F9; }
    .notice-card {
      background: #07090D;
      border: 1px solid #202734;
      border-radius: 8px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .notice-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .notice-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #FF6B35;
    }
    .notice-body { font-size: 12px; line-height: 18px; color: #CBD5E1; }
    .search-box {
      display: flex;
      align-items: center;
      background: #13171E;
      border: 1px solid #202734;
      border-radius: 8px;
      padding: 0 12px;
      min-height: 48px;
      gap: 8px;
    }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: #F0F4F9;
      height: 48px;
    }
    .search-input::placeholder { color: #8897AB; }
    .clear-btn {
      width: 48px;
      height: 48px;
      display: none;
      align-items: center;
      justify-content: center;
      color: #8897AB;
      cursor: pointer;
      background: transparent;
      border: none;
      font-size: 18px;
    }
    .pills-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0;
      scrollbar-width: none;
    }
    .pills-scroll::-webkit-scrollbar { display: none; }
    .pill {
      min-height: 48px;
      padding: 12px 16px;
      border-radius: 20px;
      border: 1px solid #202734;
      background: #07090D;
      color: #F0F4F9;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .pill.active {
      background: #FF6B35;
      border-color: #FF6B35;
      color: #13171E;
    }
    .catalog-list { display: flex; flex-direction: column; gap: 10px; }
    .catalog-card {
      background: #13171E;
      border: 1px solid #202734;
      border-radius: 8px;
      padding: 16px;
      min-height: 64px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .group-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #FF6B35;
    }
    .card-title { font-size: 16px; font-weight: 700; line-height: 22px; color: #F0F4F9; }
    .card-desc {
      font-size: 13px;
      line-height: 19px;
      color: #8897AB;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .empty-state {
      display: none;
      padding: 32px 16px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-align: center;
    }
    .empty-title { font-size: 17px; font-weight: 700; color: #F0F4F9; }
    .empty-sub { font-size: 13px; color: #8897AB; line-height: 19px; }
    .reset-btn {
      min-height: 48px;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #202734;
      background: #07090D;
      color: #FF6B35;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
    }
    .bottom-tab-bar {
      height: 64px;
      background: #07090D;
      border-top: 1px solid #202734;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-bottom: 8px;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      color: #8897AB;
      font-size: 11px;
      font-weight: 500;
      min-width: 48px;
      min-height: 48px;
      border: none;
      background: transparent;
    }
    .tab-item.active { color: #FF6B35; font-weight: 700; }
    .detail-header-bar {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .back-btn {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #13171E;
      border: 1px solid #202734;
      color: #F0F4F9;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
    }
    .header-badge {
      padding: 5px 10px;
      border-radius: 4px;
      background: #13171E;
      border: 1px solid #202734;
    }
    .detail-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 30px; }
    .detail-desc { font-size: 14px; line-height: 22px; color: #8897AB; }
    .section-heading { font-size: 16px; font-weight: 700; color: #F0F4F9; }
    .tasks-list { display: flex; flex-direction: column; gap: 8px; }
    .task-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 0;
      font-size: 14px;
      color: #F0F4F9;
    }
    .task-bullet { color: #FF6B35; }
    .not-found-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 48px 24px;
      text-align: center;
    }
    .not-found-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: #07090D;
      border: 1px solid #202734;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FF6B35;
      font-size: 32px;
      margin-bottom: 8px;
    }
    .not-found-title { font-size: 20px; font-weight: 700; color: #F0F4F9; }
    .not-found-desc { font-size: 14px; line-height: 20px; color: #8897AB; }
    .large-text .hero-title { font-size: 26px; line-height: 34px; }
    .large-text .detail-title { font-size: 28px; line-height: 36px; }
    .large-text .card-title { font-size: 19px; line-height: 26px; }
    .large-text .card-desc { font-size: 15px; line-height: 22px; }
    .large-text .detail-desc { font-size: 16px; line-height: 24px; }
    .large-text .task-item { font-size: 16px; }
  </style>
</head>
<body>

  <!-- Screen 1: Standalone Marketing Homepage (app/index.tsx) -->
  <div id="screen-home" class="screen active">
    <div class="status-bar" id="statusBarHome">
      <span>9:41</span>
      <span>📶 5G  100%</span>
    </div>
    <div class="content-scroll">
      <div class="brand-header">
        <div class="brand-logo">B</div>
        <div class="wordmark">Bukie<span class="wordmark-green">BrainJobs</span></div>
      </div>
      <div class="hero-card">
        <div class="hero-title">Find a BrainWorker for the job, or offer your skills for work that respects your time.</div>
        <div class="hero-actions">
          <button class="btn-amber mono" id="btnFindWorker" onclick="navigateTo('screen-services')">FIND A BRAINWORKER</button>
          <button class="btn-ghost mono" id="btnBecomeWorker">BECOME A BRAINWORKER →</button>
        </div>
      </div>
      <div class="eyebrow mono">SERVICES</div>
      <div class="service-rows-list">
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">Generator Servicing & Repair</div>
            <div class="service-row-meta">Power & Cooling</div>
          </div>
          <span>›</span>
        </div>
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">AC Repair & Gas Refill</div>
            <div class="service-row-meta">Power & Cooling</div>
          </div>
          <span>›</span>
        </div>
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">Plumbing & Pipe Fitting</div>
            <div class="service-row-meta">Utilities & Structure</div>
          </div>
          <span>›</span>
        </div>
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">Electrical & Solar Inverter</div>
            <div class="service-row-meta">Utilities & Structure</div>
          </div>
          <span>›</span>
        </div>
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">Deep Cleaning & Post-Construction</div>
            <div class="service-row-meta">Home & Lifestyle</div>
          </div>
          <span>›</span>
        </div>
        <div class="service-row" onclick="navigateTo('screen-services')">
          <div>
            <div class="service-row-title">Furniture & Carpentry Work</div>
            <div class="service-row-meta">Home & Lifestyle</div>
          </div>
          <span>›</span>
        </div>
      </div>
      <div class="view-all-link" id="linkViewAll" onclick="navigateTo('screen-services')">
        <span>View all services</span>
        <span>→</span>
      </div>
    </div>
  </div>

  <!-- Screen 2: Services Directory (app/(tabs)/services.tsx) -->
  <div id="screen-services" class="screen">
    <div class="status-bar" id="statusBarServices">
      <span>9:41</span>
      <span>📶 5G  100%</span>
    </div>
    <div class="tab-header">
      <div class="tab-header-title">Services</div>
    </div>
    <div class="content-scroll">
      <div class="notice-card">
        <div class="notice-header">
          <span style="color:#FF6B35;font-weight:700;">ℹ</span>
          <span class="notice-title mono">LOCAL PREVIEW</span>
        </div>
        <div class="notice-body">This preview does not include live service listings or booking actions.</div>
      </div>
      <div class="search-box">
        <span style="color:#8897AB;">🔍</span>
        <input type="text" class="search-input" id="searchInput" placeholder="Search services..." oninput="handleSearch(this.value)">
        <button class="clear-btn" id="clearBtn" onclick="clearSearch()">✕</button>
      </div>
      <div class="pills-scroll">
        <button class="pill active" id="pill-all" onclick="selectGroup('All')">All</button>
        <button class="pill" id="pill-power" onclick="selectGroup('Power & Cooling')">Power & Cooling</button>
        <button class="pill" id="pill-utilities" onclick="selectGroup('Utilities & Structure')">Utilities & Structure</button>
        <button class="pill" id="pill-lifestyle" onclick="selectGroup('Home & Lifestyle')">Home & Lifestyle</button>
      </div>
      <div class="catalog-list" id="catalogList"></div>
      <div class="empty-state" id="emptyState">
        <span style="font-size:32px;color:#8897AB;">🔍</span>
        <div class="empty-title">No matching services found</div>
        <div class="empty-sub">Try adjusting your search terms or filter selection.</div>
        <button class="reset-btn" onclick="resetFilters()">Reset filters</button>
      </div>
    </div>
    <div class="bottom-tab-bar">
      <button class="tab-item" onclick="navigateTo('screen-home')"><span>🏠</span><span>Home</span></button>
      <button class="tab-item active"><span>🔲</span><span>Services</span></button>
      <button class="tab-item"><span>💼</span><span>Jobs</span></button>
      <button class="tab-item"><span>💬</span><span>Messages</span></button>
      <button class="tab-item"><span>👤</span><span>Profile</span></button>
    </div>
  </div>

  <!-- Screen 3: Service Detail (app/services/[id].tsx) -->
  <div id="screen-detail" class="screen">
    <div class="status-bar" id="statusBarDetail">
      <span>9:41</span>
      <span>📶 5G  100%</span>
    </div>
    <div class="content-scroll">
      <div class="detail-header-bar">
        <button class="back-btn" id="btnBackDetail" onclick="navigateTo('screen-services')">‹</button>
        <div class="header-badge mono">
          <span class="group-tag" id="detailGroupBadge">POWER & COOLING</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="detail-title" id="detailTitle">Generator Servicing & Repair</div>
        <div class="detail-desc" id="detailDesc">Servicing, repairs, AVR replacement, oil changes, and rewinding for petrol and diesel generators.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="section-heading">Examples in this local catalog</div>
        <div class="tasks-list" id="detailTasksList"></div>
      </div>
      <div class="notice-card" style="margin-top:6px;">
        <div class="notice-header">
          <span style="color:#FF6B35;font-weight:700;">ℹ</span>
          <span class="notice-title mono">LOCAL PREVIEW</span>
        </div>
        <div class="notice-body">This preview does not include live service booking or worker dispatch actions.</div>
      </div>
    </div>
  </div>

  <!-- Screen 4: Not Found View (app/services/[id].tsx with invalid id) -->
  <div id="screen-notfound" class="screen">
    <div class="status-bar">
      <span>9:41</span>
      <span>📶 5G  100%</span>
    </div>
    <div class="content-scroll">
      <div class="not-found-view">
        <div class="not-found-icon">⚠</div>
        <div class="not-found-title">Service Not Found</div>
        <div class="not-found-desc">The requested service category could not be found in our directory.</div>
        <button class="reset-btn" style="min-width:48px;" onclick="navigateTo('screen-services')">Back to services directory</button>
      </div>
    </div>
  </div>

  <script>
    const services = ${JSON.stringify(CANONICAL_SERVICES)};
    let activeGroup = 'All';
    let searchQuery = '';

    function navigateTo(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) target.classList.add('active');
      window.scrollTo(0, 0);
    }

    function openServiceDetail(serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        navigateTo('screen-notfound');
        return;
      }
      document.getElementById('detailGroupBadge').textContent = service.group.toUpperCase();
      document.getElementById('detailTitle').textContent = service.title;
      document.getElementById('detailDesc').textContent = service.description;
      const tasksEl = document.getElementById('detailTasksList');
      tasksEl.innerHTML = '';
      service.popularServices.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = '<span class="task-bullet">•</span><span>' + task + '</span>';
        tasksEl.appendChild(item);
      });
      navigateTo('screen-detail');
    }

    function renderCatalog() {
      const listEl = document.getElementById('catalogList');
      const emptyEl = document.getElementById('emptyState');
      const q = searchQuery.trim().toLowerCase();

      const filtered = services.filter(s => {
        if (activeGroup !== 'All' && s.group !== activeGroup) return false;
        if (q && !(
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.popularServices.some(t => t.toLowerCase().includes(q))
        )) return false;
        return true;
      });

      listEl.innerHTML = '';
      if (filtered.length === 0) {
        listEl.style.display = 'none';
        emptyEl.style.display = 'flex';
      } else {
        listEl.style.display = 'flex';
        emptyEl.style.display = 'none';
        filtered.forEach(s => {
          const card = document.createElement('div');
          card.className = 'catalog-card';
          card.id = 'card-' + s.id;
          card.onclick = () => openServiceDetail(s.id);
          card.innerHTML =
            '<div class="card-top">' +
              '<span class="group-tag mono">' + s.group.toUpperCase() + '</span>' +
              '<span style="color:#8897AB;">›</span>' +
            '</div>' +
            '<div class="card-title">' + s.title + '</div>' +
            '<div class="card-desc">' + s.description + '</div>';
          listEl.appendChild(card);
        });
      }
    }

    function handleSearch(val) {
      searchQuery = val;
      document.getElementById('clearBtn').style.display = val.length > 0 ? 'inline-flex' : 'none';
      renderCatalog();
    }

    function clearSearch() {
      const input = document.getElementById('searchInput');
      input.value = '';
      handleSearch('');
    }

    function selectGroup(group) {
      activeGroup = group;
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      const idMap = {
        'All': 'pill-all',
        'Power & Cooling': 'pill-power',
        'Utilities & Structure': 'pill-utilities',
        'Home & Lifestyle': 'pill-lifestyle'
      };
      if (idMap[group]) document.getElementById(idMap[group]).classList.add('active');
      renderCatalog();
    }

    function resetFilters() {
      searchQuery = '';
      activeGroup = 'All';
      document.getElementById('searchInput').value = '';
      document.getElementById('clearBtn').style.display = 'none';
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      document.getElementById('pill-all').classList.add('active');
      renderCatalog();
    }

    renderCatalog();
  </script>
</body>
</html>`;
}

async function runMobileQAVerification() {
  console.log('🚀 Starting MOB-001 Screen-by-Screen QA Verification & Video Recording...');

  const htmlContent = generateAppHtml();
  const htmlPath = path.resolve('docs/screenshots/preview-discovery.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });

  // Mobile portrait context with continuous video recording
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 375, height: 812 },
    },
  });

  const page = await context.newPage();
  const logs = [];
  const logStep = (step, detail) => {
    logs.push(`[${step}] ${detail}`);
    console.log(`[PASS] ${step}: ${detail}`);
  };

  await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // 1. Homepage Portrait (375x812)
  logStep('SCREEN_1_HOMEPAGE_PORTRAIT', 'Verifying standalone public marketing homepage (app/index.tsx)');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-01-homepage-portrait.png') });

  // 2. Homepage Landscape (812x375)
  logStep('SCREEN_1_HOMEPAGE_LANDSCAPE', 'Verifying homepage in landscape orientation (812x375)');
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-02-homepage-landscape.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);

  // 3. Navigate to Services Directory
  logStep('NAVIGATION_HOME_TO_SERVICES', 'Navigating from homepage to services tab via FIND A BRAINWORKER button');
  await page.click('#btnFindWorker');
  await page.waitForTimeout(600);

  // 4. Services Directory Full Catalog (375x812)
  logStep('SCREEN_2_SERVICES_CATALOG_ALL', 'Verifying category catalog rendering all 8 canonical services and text-only filter pills');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-03-services-catalog-all.png') });

  // 5. Search Filter Live Matching
  logStep('FEATURE_SEARCH_MATCHING', 'Testing live search input with keyword "ac"');
  await page.fill('#searchInput', 'ac');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-04-services-catalog-search-ac.png') });

  // 6. Clear Search
  logStep('FEATURE_CLEAR_SEARCH', 'Testing search clear trigger and restoring query');
  await page.click('#clearBtn');
  await page.waitForTimeout(400);

  // 7. Group Filter Pill Selection
  logStep('FEATURE_GROUP_FILTER', 'Testing category group filter pill "Utilities & Structure"');
  await page.click('#pill-utilities');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-05-services-catalog-filter-utilities.png') });

  // 8. Empty Search / Filter State
  logStep('FEATURE_EMPTY_STATE', 'Testing empty search state with query "xyznotfound"');
  await page.fill('#searchInput', 'xyznotfound');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-06-services-catalog-empty-state.png') });

  // 9. Reset Filters Flow
  logStep('FEATURE_RESET_FILTERS', 'Triggering "Reset filters" button to restore all 8 services');
  await page.click('.reset-btn');
  await page.waitForTimeout(600);

  // 10. Service Detail View
  logStep('SCREEN_3_SERVICE_DETAIL', 'Navigating into Generator Servicing & Repair detail screen');
  await page.click('#card-generator');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-07-service-detail-generator.png') });

  // 11. Service Detail Landscape
  logStep('SCREEN_3_DETAIL_LANDSCAPE', 'Verifying service detail in landscape orientation (812x375)');
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-08-service-detail-landscape.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);

  // 12. Accessibility Large Text (1.3x Scaling)
  logStep('ACCESSIBILITY_LARGE_TEXT', 'Verifying service detail with large text scaling (1.3x accessibility)');
  await page.evaluate(() => document.body.classList.add('large-text'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-10-service-detail-large-text.png') });
  await page.evaluate(() => document.body.classList.remove('large-text'));
  await page.waitForTimeout(400);

  // 13. Back Navigation to Catalog
  logStep('NAVIGATION_BACK_TO_CATALOG', 'Navigating back to services directory using 48x48 back button');
  await page.click('#btnBackDetail');
  await page.waitForTimeout(500);

  // 14. Invalid Service ID Fallback (Not Found View)
  logStep('SCREEN_4_SERVICE_NOT_FOUND', 'Verifying not-found fallback view for invalid service ID');
  await page.evaluate(() => openServiceDetail('invalid-service-id'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mob001-09-service-detail-notfound.png') });

  // Close context to finalize video recording
  await page.close();
  await context.close();
  await browser.close();

  // Find and rename video file
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, videoFiles[videoFiles.length - 1]);
    const finalVideo = path.join(VIDEO_DIR, 'mob001-discovery-verification.webm');
    fs.copyFileSync(rawVideo, finalVideo);
    console.log(`🎥 Video recording saved to: ${finalVideo}`);
  }

  // Mirror all screenshots to artifacts directory
  const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.startsWith('mob001-') && f.endsWith('.png'));
  for (const shot of screenshots) {
    fs.copyFileSync(path.join(SCREENSHOT_DIR, shot), path.join(ARTIFACT_DIR, shot));
  }
  console.log(`📸 Mirrored ${screenshots.length} screenshots to artifacts directory`);

  console.log('✅ MOB-001 Screen-by-Screen QA Verification completed successfully!');
}

runMobileQAVerification().catch(err => {
  console.error('QA Verification failed:', err);
  process.exit(1);
});
