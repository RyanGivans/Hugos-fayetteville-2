const reviews = [
  { name: 'Local Guest', text: 'Best burger in Fayetteville. No question.' },
  { name: 'Regular', text: 'The basement atmosphere is half the reason you go.' },
  { name: 'Hugo\'s Fan', text: 'Beer cheese soup, fries, and a burger. Perfect.' },
  { name: 'Visitor', text: 'Feels like a Fayetteville tradition the second you walk in.' }
];

const drinks = {
  'Beer Specials': [
    { name: 'Summerfest', style: 'Pilsner - German', meta: 'Sierra Nevada Brewing Co. • 5% ABV • 28 IBU' },
    { name: 'Hoppy Wheat', style: 'American Pale Wheat', meta: 'Fossil Cove Brewing Co. • 5.5% ABV • 55 IBU' }
  ],
  'Local Draft': [
    { name: 'Hazy & Hoppy', style: 'IPA - American', meta: 'Hawk Moth Brewery & Beer Parlor • Bentonville' },
    { name: 'American Pale Ale', style: 'Pale Ale - American', meta: 'Ozark Beer Company • Rogers' },
    { name: 'La Brea Brown', style: 'Brown Ale - Belgian', meta: 'Fossil Cove Brewing Co. • Fayetteville' }
  ],
  'Local Cans': [
    { name: 'Sun Kissed', style: 'Imperial IPA', meta: 'Gotahold Brewing • Eureka Springs' },
    { name: 'Czech Pilsner', style: 'Pilsner - Czech', meta: 'Natural State Beer Company • Rogers' },
    { name: 'Session IPA', style: 'IPA - Session', meta: 'Fossil Cove Brewing Co. • Fayetteville' },
    { name: 'Bluewing Berry Wheat', style: 'Wheat Beer - Fruited', meta: 'Flyway Brewing • Little Rock' }
  ],
  'Wine': [
    { name: 'Cabernet Sauvignon', style: 'House Wine', meta: 'Robert Mondavi Woodbridge' },
    { name: 'Sauvignon Blanc', style: 'House Wine', meta: 'Robert Mondavi Woodbridge' },
    { name: 'Malbec', style: 'Red Wine', meta: 'Tercos • Argentina' },
    { name: 'Rosé', style: 'White / Rosé', meta: 'Gerard Bertrand Cote Des Roses • France' }
  ],
  'Non-Alcoholic': [
    { name: 'Run Wild IPA', style: 'Non-Alcoholic IPA', meta: 'Athletic Brewing Company' },
    { name: 'Heineken 0.0', style: 'Non-Alcoholic Lager', meta: 'Heineken' }
  ]
};

const instagramCards = [
  { label: 'Basement nights', image: 'https://hugosfayetteville.com/wp-content/uploads/2020/01/hugos-outside-1.jpg' },
  { label: 'Burgers since 1977', image: 'https://hugosfayetteville.com/wp-content/uploads/2020/01/hugos-logo-3.jpg' },
  { label: 'Local taps', image: 'https://hugosfayetteville.com/wp-content/uploads/2020/01/hugos-outside-1-863x1024.jpg' },
  { label: 'Fayetteville favorite', image: 'https://hugosfayetteville.com/wp-content/uploads/2020/01/cropped-hugos-logo-1-1-1-192x192.jpg' }
];

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });
document.querySelectorAll('.section-reveal').forEach(section => revealObserver.observe(section));

function renderReviews() {
  const container = document.getElementById('reviewMarquee');
  if (!container) return;
  const doubled = [...reviews, ...reviews];
  container.innerHTML = doubled.map(review => `
    <article class="review-card">
      <div class="stars">★★★★★</div>
      <p>“${review.text}”</p>
      <span>${review.name}</span>
    </article>
  `).join('');
}

let allMenu = [];
let activeCategory = 'All';

async function loadMenu() {
  try {
    const response = await fetch('menu.json');
    allMenu = await response.json();
    renderFilters();
    renderMenu();
  } catch (error) {
    document.getElementById('menuGrid').innerHTML = '<p>Menu could not load. Check menu.json.</p>';
  }
}

function renderFilters() {
  const filters = document.getElementById('menuFilters');
  const categories = ['All', ...new Set(allMenu.map(item => item.category))];
  filters.innerHTML = categories.map(cat => `<button class="pill ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>`).join('');
  filters.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    activeCategory = btn.dataset.cat;
    renderFilters();
    renderMenu();
  }));
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const search = document.getElementById('menuSearch').value.toLowerCase();
  const filtered = allMenu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  grid.innerHTML = filtered.map(item => `
    <article class="menu-card ${item.category === 'Famous' ? 'famous' : ''}">
      <div class="menu-card-top">
        <span>${item.category}</span>
        <em>${item.tag}</em>
      </div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    </article>
  `).join('') || '<p>No matching menu items found.</p>';
}

document.getElementById('menuSearch')?.addEventListener('input', renderMenu);

let currentDrinkTab = Object.keys(drinks)[0];
function renderDrinkTabs() {
  const tabs = document.getElementById('drinkTabs');
  tabs.innerHTML = Object.keys(drinks).map(tab => `<button class="drink-tab ${tab === currentDrinkTab ? 'active' : ''}" data-tab="${tab}">${tab}</button>`).join('');
  tabs.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    currentDrinkTab = btn.dataset.tab;
    renderDrinkTabs();
    renderDrinks();
  }));
}
function renderDrinks() {
  const list = document.getElementById('drinkList');
  list.innerHTML = drinks[currentDrinkTab].map(item => `
    <article class="drink-item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.style}</p>
        <small>${item.meta}</small>
      </div>
      <span class="pour-rating" aria-hidden="true">● ● ● ● ○</span>
    </article>
  `).join('');
}

document.getElementById('shuffleDrink')?.addEventListener('click', () => {
  const tabs = Object.keys(drinks);
  currentDrinkTab = tabs[Math.floor(Math.random() * tabs.length)];
  renderDrinkTabs();
  renderDrinks();
});

function renderInstagram() {
  const grid = document.getElementById('instagramGrid');
  grid.innerHTML = instagramCards.map(card => `
    <a class="insta-card" href="https://www.instagram.com/hugosfayetteville/" target="_blank" rel="noopener">
      <img src="${card.image}" alt="${card.label}">
      <span>${card.label}</span>
    </a>
  `).join('');
}

renderReviews();
loadMenu();
renderDrinkTabs();
renderDrinks();
renderInstagram();
