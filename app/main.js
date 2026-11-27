// Bargain Radar: a deal finder that runs from static files, no network. Routes:
//   #/                          the list, with search, category, store and discount filters
//   #/?cat=Audio&store=Best+Buy&min=40&sort=discount&q=sony
//                               the list with filters applied (shareable, and how the filtered
//                               screenshot is taken)
//   #/deal/<id>                one deal
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { deals } from './data.js';
import { applyFilters, deal, filterBar, list, missing, rows } from './views.js';

const app = document.getElementById('app');

function parseFilters() {
  const hash = location.hash || '#/';
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return {
    q: params.get('q') || '',
    cat: params.get('cat') || 'All',
    store: params.get('store') || 'All',
    min: params.get('min') || '',
    sort: params.get('sort') || 'best',
  };
}

function writeFilters(f) {
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  if (f.cat && f.cat !== 'All') params.set('cat', f.cat);
  if (f.store && f.store !== 'All') params.set('store', f.store);
  if (f.min) params.set('min', f.min);
  if (f.sort && f.sort !== 'best') params.set('sort', f.sort);
  const query = params.toString();
  const next = '#/' + (query ? '?' + query : '');
  if (location.hash !== next) history.replaceState(null, '', next);
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Bargain Radar`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    const f = parseFilters();
    document.title = 'Bargain Radar — Black Friday deals, checked today';
    app.innerHTML = list(deals, f);
    const form = app.querySelector('#filters');
    const shown = app.querySelector('.deals');
    const count = app.querySelector('.count');
    const update = () => {
      const data = new FormData(form);
      const nf = {
        q: data.get('q') || '',
        cat: data.get('cat') || 'All',
        store: data.get('store') || 'All',
        min: data.get('min') || '',
        sort: data.get('sort') || 'best',
      };
      writeFilters(nf);
      shown.innerHTML = rows(deals, nf);
      count.innerHTML = `Showing <b>${applyFilters(deals, nf).length}</b> of ${deals.length} deals`;
    };
    form.addEventListener('input', update);
    form.addEventListener('submit', (e) => e.preventDefault());
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
