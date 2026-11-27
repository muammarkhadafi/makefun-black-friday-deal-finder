// HTML for each page, built from the deal data. Every value is escaped before it goes into the page.
// Verdicts: new-low (green), strong (amber), routine (grey). The discount is computed from the
// two prices, so the number on screen always matches them.

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, '')}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

const VERDICT_LABEL = { 'new-low': 'New low', strong: 'Strong deal', routine: 'Routine cut' };

export const categories = [...new Set([])];
export function allCategories(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}
export function allStores(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function verdictRank(d) {
  return d.verdict === 'new-low' ? 0 : d.verdict === 'strong' ? 1 : 2;
}

export function applyFilters(deals, f) {
  const q = (f.q || '').trim().toLowerCase();
  let out = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (f.cat && f.cat !== 'All' && d.category !== f.cat) return false;
    if (f.store && f.store !== 'All' && d.store !== f.store) return false;
    if (f.min && percentOff(d) < Number(f.min)) return false;
    return true;
  });
  const sort = f.sort || 'best';
  if (sort === 'discount') out = [...out].sort((a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a));
  else if (sort === 'price') out = [...out].sort((a, b) => a.price - b.price);
  else if (sort === 'savings') out = [...out].sort((a, b) => saved(b) - saved(a));
  else out = [...out].sort((a, b) => verdictRank(a) - verdictRank(b) || percentOff(b) - percentOff(a));
  return out;
}

function option(value, label, current) {
  return `<option value="${escape(value)}"${value === current ? ' selected' : ''}>${escape(label)}</option>`;
}

export function filterBar(deals, f) {
  const cats = allCategories(deals);
  const stores = allStores(deals);
  return `<form class="filters" id="filters">
  <label>Search <input type="search" name="q" value="${escape(f.q || '')}" placeholder="Product, store, category" aria-label="Search deals by product, store or category"></label>
  <label>Category <select name="cat" aria-label="Filter by category">${option('All', 'All categories', f.cat || 'All')}${cats.map((c) => option(c, c, f.cat || 'All')).join('')}</select></label>
  <label>Store <select name="store" aria-label="Filter by store">${option('All', 'All stores', f.store || 'All')}${stores.map((s) => option(s, s, f.store || 'All')).join('')}</select></label>
  <label>Discount <select name="min" aria-label="Filter by minimum discount">${option('', 'Any discount', f.min || '')}${option('25', '25% off or more', f.min || '')}${option('40', '40% off or more', f.min || '')}${option('50', '50% off or more', f.min || '')}</select></label>
  <label>Sort <select name="sort" aria-label="Sort deals">${option('best', 'Best deals first', f.sort || 'best')}${option('discount', 'Biggest % off', f.sort || 'best')}${option('savings', 'Biggest $ saved', f.sort || 'best')}${option('price', 'Lowest price', f.sort || 'best')}</select></label>
</form>`;
}

function card(d) {
  return `<li class="card">
  <a class="card-title" href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a>
  <p class="card-meta">${escape(d.store)} · ${escape(d.category)}</p>
  <p class="card-price"><b>${usd(d.price)}</b> <s>${usd(d.was)}</s> <span class="off">${percentOff(d)}% off</span></p>
  <p class="card-save">You save ${usd(saved(d))}</p>
  <p><span class="verdict v-${d.verdict}">${VERDICT_LABEL[d.verdict]}</span></p>
  <p class="card-checked">Checked ${day(d.checked)}</p>
  <p><a class="store-link" href="${escape(d.url)}" rel="noopener noreferrer">Find it at ${escape(d.store)} ↗</a></p>
</li>`;
}

export function rows(deals, f) {
  const shown = applyFilters(deals, f);
  if (shown.length === 0) return '<li class="empty">No deal matches. Try clearing a filter.</li>';
  return shown.map(card).join('');
}

export function list(deals, f) {
  const shown = applyFilters(deals, f);
  const newLows = deals.filter((d) => d.verdict === 'new-low').length;
  return `<h1>Black Friday deals, checked today</h1>
<p class="lede">${deals.length} real deals from ${allStores(deals).length} stores, each price read on 27 November 2026. ${newLows} are at their lowest price ever. Nothing here is invented: every deal names its store, its prices and where the price was read.</p>
${filterBar(deals, f)}
<p class="count">Showing <b>${shown.length}</b> of ${deals.length} deals</p>
<ul class="deals">${rows(deals, f)}</ul>`;
}

export function deal(d) {
  return `<p><a href="#/">&larr; All deals</a></p>
<h1>${escape(d.title)}</h1>
<p><span class="verdict v-${d.verdict}">${VERDICT_LABEL[d.verdict]}</span></p>
<dl>
  <dt>Store</dt><dd>${escape(d.store)}</dd>
  <dt>Category</dt><dd>${escape(d.category)}</dd>
  <dt>Price</dt><dd><b>${usd(d.price)}</b>, usually ${usd(d.was)} — ${percentOff(d)}% off, you save ${usd(saved(d))}</dd>
  <dt>Why this verdict</dt><dd>${escape(d.evidence)}</dd>
  <dt>Checked</dt><dd>${day(d.checked)}</dd>
  <dt>Read in</dt><dd>${escape(d.source)}</dd>
</dl>
<p><a class="store-link big" href="${escape(d.url)}" rel="noopener noreferrer">Find it at ${escape(d.store)} ↗</a></p>
<p class="note">Prices move fast on Black Friday. This price was read at the time above; check the store page before you buy.</p>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
