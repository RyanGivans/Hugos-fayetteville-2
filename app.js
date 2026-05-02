const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const navToggle = $('.nav-toggle');
const nav = $('.nav');
navToggle?.addEventListener('click', () => nav.classList.toggle('open'));
$$('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

document.addEventListener('mousemove', e => {
  const glow = $('.cursor-glow');
  if (glow) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .14 });
$$('.reveal').forEach(el => observer.observe(el));

function setOpenStatus(){
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes()/60;
  const open = day !== 0 && hour >= 11 && hour < 22;
  const status = $('#openStatus');
  const dot = $('.status-dot');
  if (!status || !dot) return;
  status.textContent = open ? 'Open right now' : (day === 0 ? 'Closed today' : 'Closed right now');
  dot.style.background = open ? '#39d98a' : '#e34b3f';
  dot.style.boxShadow = open ? '0 0 22px #39d98a' : '0 0 22px #e34b3f';
}
setOpenStatus();

function setupFilteredList({ jsonUrl, buttonsEl, gridEl, inputEl, itemClass, categoryClass, renderItem }){
  let data = null;
  let activeCategory = 'all';
  let query = '';

  function itemMatches(item){
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return Object.values(item).join(' ').toLowerCase().includes(q);
  }

  function renderButtons(){
    const wrap = $(buttonsEl);
    if (!wrap || !data) return;
    const buttons = [{id:'all', name:'All'}, ...data.categories.map(c => ({id:c.id, name:c.name}))];
    wrap.innerHTML = buttons.map(b => `<button class="${b.id === activeCategory ? 'active' : ''}" data-cat="${b.id}">${b.name}</button>`).join('');
    $$('button', wrap).forEach(btn => btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderList();
      renderButtons();
    }));
  }

  function renderList(){
    const grid = $(gridEl);
    if (!grid || !data) return;
    const cats = activeCategory === 'all' ? data.categories : data.categories.filter(c => c.id === activeCategory);
    let html = '';
    cats.forEach(cat => {
      const items = cat.items.filter(itemMatches);
      if (!items.length) return;
      html += `<h3 class="${categoryClass}">${cat.name}</h3>`;
      items.forEach(item => html += renderItem(item));
    });
    grid.innerHTML = html || `<p class="menu-note">No items found. Try a different search.</p>`;
  }

  fetch(jsonUrl)
    .then(res => res.json())
    .then(json => {
      data = json;
      renderButtons();
      renderList();
    })
    .catch(() => {
      const grid = $(gridEl);
      if (grid) grid.innerHTML = `<p class="menu-note">Unable to load ${jsonUrl}. Make sure it is uploaded beside index.html.</p>`;
    });

  $(inputEl)?.addEventListener('input', e => {
    query = e.target.value;
    renderList();
  });
}

setupFilteredList({
  jsonUrl: 'menu.json',
  buttonsEl: '#categoryButtons',
  gridEl: '#menuGrid',
  inputEl: '#menuSearch',
  categoryClass: 'menu-category',
  renderItem: item => `
    <article class="menu-item">
      <span class="price">${item.price || ''}</span>
      <h3>${item.name}</h3>
      ${item.desc ? `<p>${item.desc}</p>` : ''}
      <div class="tags">${(item.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
    </article>`
});

setupFilteredList({
  jsonUrl: 'drinks.json',
  buttonsEl: '#drinkButtons',
  gridEl: '#drinksGrid',
  inputEl: '#drinkSearch',
  categoryClass: 'drink-category',
  renderItem: item => `
    <article class="drink-item">
      <h3>${item.name}</h3>
      <div class="drink-meta">${[item.style, item.maker, item.origin].filter(Boolean).join(' · ')}</div>
      ${item.notes ? `<p>${item.notes}</p>` : ''}
    </article>`
});
