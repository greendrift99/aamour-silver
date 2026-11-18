const catalog = [
  {id:'hoops',name:'Sculpture Hoops',groups:['Her','Rarefind'],category:'Earrings',metal:'Gold',weight:2.8,craft:9800,image:'hoops',story:'Sculptural ridges catch the light with every turn.'},
  {id:'signet',name:'Contour Signet',groups:['Him'],category:'Rings',metal:'Silver',weight:10,craft:4100,image:'him',story:'A clean, softly rounded silhouette in polished silver.'},
  {id:'star',name:'Little Star Bracelet',groups:['Kids'],category:'Bracelets',metal:'Gold',weight:1.4,craft:5600,image:'kids',story:'A small star to mark a big moment.'},
  {id:'dew',name:'Dewdrop Pendant',groups:['Her','Rarefind'],category:'Necklaces',metal:'Gold',weight:2.1,craft:15900,image:'dew',story:'A pale green stone suspended from a fine gold chain.'},
  {id:'landscape',name:'KAI Landscape Pendant',groups:['KAI','Rarefind'],category:'Necklaces',metal:'Gold',weight:8,craft:218000,image:'kai',story:'A dendritic agate landscape framed in gold. Designed by Krishna Soni and Jyoti Kaushal.'},
  {id:'anklet',name:'Starlight Anklet',groups:['Kids','Her'],category:'Anklets',metal:'Gold',weight:1.8,craft:6900,image:'anklet',story:'A delicate ankle chain with celestial details.'},
  {id:'chain',name:'Silver Horizon Chain',groups:['Him'],category:'Necklaces',metal:'Silver',weight:19,craft:6600,image:'chain',story:'A silver chain with flat links and a quiet gleam.'},
  {id:'stud',name:'Little Sun Studs',groups:['Kids','Her'],category:'Earrings',metal:'Gold',weight:1.1,craft:4300,image:'stud',story:'Tiny gold sunbursts with softly rounded edges.'}
];
const groups = ['All','Her','Him','Kids','Rarefind','KAI'];
const defaultRates = {Gold:8900,Silver:106};
const $ = (id) => document.getElementById(id);
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem('aamou.' + key)) ?? fallback; }
  catch { return fallback; }
}
const save = (key, value) => localStorage.setItem('aamou.' + key, JSON.stringify(value));
let rates = load('rates', defaultRates);
let bag = load('bag', {});
let saved = new Set(load('saved', []));
const kidsStore = document.body.dataset.store === 'kids';
const kidsPiece = Boolean($('piece')) && new URLSearchParams(location.search).get('from')==='kids';
if (kidsPiece) document.body.classList.add('little');
const requestedGroup = new URLSearchParams(location.search).get('collection');
let group = kidsStore ? 'Kids' : groups.includes(requestedGroup) ? requestedGroup : 'All';
let camera;
let photo;
let installPrompt;
let toastTimer;
const money = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
const price = (p) => Math.round(p.craft + p.weight * rates[p.metal]);
const total = () => catalog.reduce((sum,p) => sum + (bag[p.id] || 0)*price(p),0);
const find = (id) => catalog.find((p) => p.id === id);
const action = (label, type, id = '', style = 'dark') => '<button class="button '+style+'" data-action="'+type+'" data-id="'+id+'">'+label+'</button>';
const heading = (value) => '<h2>'+value+'</h2>';
function notify(value) {
  $('toast').textContent = value;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').textContent = '', 3200);
}
const featuredIds = ['dew','hoops','star','landscape'];
const pieceLink = (p) => 'piece.html?id='+p.id+((kidsStore || kidsPiece) && p.groups.includes('Kids') ? '&from=kids' : '');
const packshot = (p) => '<img src="assets/pack-'+p.id+'.webp" alt="'+p.name+'" loading="lazy">';
const glyphs = {
  eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Zm4 2V6a3 3 0 0 1 6 0v4"/></svg>'
};
function card(p, lifestyle = false) {
  if (kidsStore) {
    const theme = {star:'peach',anklet:'lilac',stud:'mint'}[p.id];
    return '<article class="product little-card little-'+theme+'"><a class="product-photo" href="'+pieceLink(p)+'" aria-label="View '+p.name+'">'+packshot(p)+'</a><div class="little-card-copy"><span class="little-card-kind">'+p.category+'</span><h3><a href="'+pieceLink(p)+'">'+p.name+'</a></h3><p>'+money.format(price(p))+'</p><button class="little-card-view" data-action="product" data-id="'+p.id+'">Quick view ↗</button></div><button class="round-control heart" data-action="save" data-id="'+p.id+'" aria-label="Save '+p.name+'" aria-pressed="'+saved.has(p.id)+'">'+(saved.has(p.id)?'♥':'♡')+'</button></article>';
  }
  return '<article class="product"><div class="product-visual"><a class="product-photo" href="'+pieceLink(p)+'" aria-label="View '+p.name+'">'+(lifestyle ? '<img src="assets/kids.webp" alt="Little Star Bracelet on silk" loading="lazy">' : packshot(p))+'</a>'+
    '<div class="card-tools"><button class="round-control quick-view" data-action="product" data-id="'+p.id+'" aria-label="Quick view '+p.name+'">'+glyphs.eye+'</button><button class="round-control heart" data-action="save" data-id="'+p.id+'" aria-label="Save '+p.name+'" aria-pressed="'+saved.has(p.id)+'">'+(saved.has(p.id)?'♥':'♡')+'</button></div>'+
    '<button class="round-control quick-bag" data-action="add" data-id="'+p.id+'" aria-label="Add '+p.name+' to bag">'+glyphs.bag+'</button></div><h3><a href="'+pieceLink(p)+'">'+p.name+'</a></h3><p>'+money.format(price(p))+'</p></article>';
}
function render() {
  const bagCount = Object.values(bag).reduce((sum,n) => sum+n,0);
  $('count').textContent = bagCount;
  $('mobile-count').textContent = bagCount;
  $('mobile-count').parentElement.setAttribute('aria-label','Open your bag, '+bagCount+' items');
  if ($('featured-products')) $('featured-products').innerHTML = featuredIds.map(id => card(find(id), id==='star')).join('');
  if (!$('products')) return;
  $('groups').innerHTML = groups.map((g) => (g==='Kids' ? '<a class="pill" href="kids.html">Kids</a>' : '<button class="pill" data-group="'+g+'" aria-pressed="'+(group===g)+'">'+g+'</button>')).join('');
  $('shop-title').textContent = ({All:'Shop jewellery',Her:'Jewellery for her',Him:'Jewellery for him',Kids:'Shop Little Aamour',Rarefind:'The Rarefind collection',KAI:'Las Vegas KAI'})[group];
  const maximum = Math.ceil(Math.max(...catalog.map(price))/1000)*1000;
  const range = $('max-price');
  if (range && Number(range.max)!==maximum) {
    const atMaximum = !range.max || range.value===range.max;
    range.max = maximum;
    if (atMaximum) range.value = maximum;
  }
  const limit = range ? Number(range.value) : Infinity;
  if (range) $('price-limit').textContent = money.format(limit);
  const category = $('category').value;
  const metal = $('metal').value;
  const filtered = catalog.filter(p => (group==='All'||p.groups.includes(group)) && (category==='All'||p.category===category) && (metal==='All'||p.metal===metal) && price(p)<=limit);
  const sorting = {low:(a,b)=>price(a)-price(b),high:(a,b)=>price(b)-price(a),name:(a,b)=>a.name.localeCompare(b.name)};
  const compare = sorting[$('sort')?.value];
  if (compare) filtered.sort(compare);
  if ($('product-count')) $('product-count').textContent = filtered.length+' '+(filtered.length===1?'piece':'pieces');
  $('products').innerHTML = filtered.map(p => card(p)).join('') || '<p class="no-pieces">No pieces match these filters.</p>';
}
function renderPiece() {
  if (!$('piece')) return;
  const params = new URLSearchParams(location.search);
  const p = find(params.get('id'));
  const back = params.get('from')==='kids' ? 'kids.html#shop' : 'index.html#shop';
  if (!p) {
    $('piece').innerHTML = '<h1>Piece unavailable</h1><a class="under" href="'+back+'">Browse jewellery ↗</a>';
    return;
  }
  document.title = p.name+' — Aamour';
  $('piece').innerHTML = '<a class="under piece-back" href="'+back+'">← Back to jewellery</a><div class="piece-layout"><div class="piece-image"><img src="assets/pack-'+p.id+'.webp" alt="'+p.name+'"><button class="round-control" data-action="zoom" data-id="'+p.id+'" aria-label="Enlarge product photograph">⤢</button></div><div class="piece-info"><div class="eyebrow"><span class="metal-dot" data-metal="'+p.metal+'"></span>'+p.category+' · '+p.metal+'</div><div class="piece-title"><h1>'+p.name+'</h1><button class="round-control piece-save" data-action="save" data-id="'+p.id+'" aria-label="Save '+p.name+'" aria-pressed="'+saved.has(p.id)+'">'+(saved.has(p.id)?'♥':'♡')+'</button></div><p class="piece-price">'+money.format(price(p))+'</p><p>'+p.story+'</p><label class="qty-label" for="piece-quantity">Quantity</label><div class="quantity"><button data-step="-1" aria-label="Decrease quantity">−</button><input id="piece-quantity" type="number" min="1" max="99" value="1"><button data-step="1" aria-label="Increase quantity">+</button></div><div class="piece-actions">'+action('Add to bag','add',p.id)+action('Preview on you','try',p.id,'light')+'</div><details open><summary>Piece details</summary><p>'+p.metal+' · '+p.weight+' g sample metal weight</p></details></div></div>';
}
function readQuantity() {
  return Math.min(99, Math.max(1, Math.trunc(Number($('piece-quantity')?.value)) || 1));
}
function releaseMedia() {
  camera?.getTracks().forEach((track) => track.stop());
  camera = undefined;
  if (photo) URL.revokeObjectURL(photo);
  photo = undefined;
}
function display(html) {
  releaseMedia();
  $('panel').innerHTML = html;
  if (!$('modal').open) $('modal').showModal();
  $('modal').scrollTop = 0;
}
function product(id) {
  const p = find(id);
  display(heading(p.name)+packshot(p)+'<p>'+p.story+'</p><p><strong>'+money.format(price(p))+'</strong> · '+p.metal+' · '+p.weight+' g sample metal weight</p>'+action('Add to bag','add',id)+action('Preview on you','try',id,'light')+'<p><a class="under" href="'+pieceLink(p)+'">Full product details ↗</a></p>');
}
function results(items) {
  return items.map((p) => '<div class="row"><button data-action="product" data-id="'+p.id+'">'+p.name+'</button><span>'+money.format(price(p))+'</span></div>').join('') || '<p>No pieces found.</p>';
}
function show(type) {
  const views = {
    search: () => { display(heading('Find jewellery')+'<label>Search the collection<input id="query" type="search" placeholder="Try silver or pendant"></label><div id="matches">'+results(kidsStore ? catalog.filter((p) => p.groups.includes('Kids')) : catalog)+'</div>'); $('query').focus(); },
    saved: () => display(heading('Your saved pieces')+(saved.size ? results(catalog.filter((p) => saved.has(p.id))) : '<p>Tap a heart to save a piece.</p>')),
    bag: () => {
      const lines = catalog.filter((p) => bag[p.id]).map((p) => '<div class="row"><div>'+p.name+'<br><small>'+money.format(price(p))+' each</small></div><div><button data-action="minus" data-id="'+p.id+'" aria-label="Decrease '+p.name+'">−</button> '+bag[p.id]+' <button data-action="plus" data-id="'+p.id+'" aria-label="Increase '+p.name+'">+</button></div></div>').join('');
      display(heading('Your bag')+(lines ? lines+'<p><strong>Subtotal '+money.format(total())+'</strong></p>'+action('Preview checkout','checkout') : '<p>Your bag is empty.</p>'));
    },
    rates: () => display(heading('Metal rates')+'<p>Change the sample rates in ₹ per gram to see how prices recalculate for the catalogue and bag.</p><form id="rate-form"><label>Gold (₹/g)<input name="Gold" type="number" min="1" max="1000000" step="0.01" required value="'+rates.Gold+'"></label><label>Silver (₹/g)<input name="Silver" type="number" min="1" max="1000000" step="0.01" required value="'+rates.Silver+'"></label><button class="button dark">Update demo rates</button></form>'),
    bespoke: () => display(heading('Your bespoke brief')+'<p>Sketch out what you’d like to make with our karigars. Save a copy on this device.</p><form id="brief-form"><label>Piece or occasion<input name="occasion" required maxlength="120"></label><label>Design notes<textarea name="brief" required maxlength="2000"></textarea></label><button class="button dark">Save brief on this device</button></form>'),
    stylist: () => display(heading('Jewellery finder')+'<p>Choose a collection and budget to find matching pieces.</p><form id="finder-form"><label>Shopping for<select name="group">'+groups.map((g) => '<option>'+g+'</option>').join('')+'</select></label><label>Budget up to (₹)<input name="budget" type="number" min="1" value="50000" required></label><button class="button dark">Find pieces</button></form><div id="recommendations"></div>'),
    checkout: () => display(heading('Checkout preview')+'<p>'+Object.values(bag).reduce((a,b) => a+b,0)+' item(s) · Subtotal '+money.format(total())+'</p><p>This preview uses sample products and prices. Payment and shipping are pending setup.</p>'+action('Return to bag','bag'))
  };
  views[type]?.();
}
const icons = {
  Earrings:'<ellipse cx="45" cy="35" rx="19" ry="29" fill="none" stroke-width="9"/>',
  Rings:'<ellipse cx="45" cy="46" rx="27" ry="18" fill="none" stroke-width="7"/>',
  Necklaces:'<path d="M5 8Q34 54 45 48Q56 54 85 8" fill="none" stroke-width="3"/><ellipse cx="45" cy="55" rx="10" ry="14" fill="#b1a783" stroke-width="4"/>',
  Bracelets:'<ellipse cx="45" cy="35" rx="37" ry="17" fill="none" stroke-width="5"/>',
  Anklets:'<ellipse cx="45" cy="35" rx="37" ry="17" fill="none" stroke-width="3"/><circle cx="45" cy="54" r="5" fill="currentColor"/>'
};
function tryOn(p) {
  display(heading('Preview on you')+'<p>Use your camera or a photo. Tap to place the illustration and adjust its size. Images stay in this browser session.</p><div class="stage" id="stage"><video id="camera" autoplay muted playsinline hidden></video><img id="photo-preview" alt="Your try-on photo" hidden><svg class="jewel" id="overlay" viewBox="0 0 90 70" aria-hidden="true" style="color:'+(p.metal==='Silver'?'#d3d1cc':'#d6a248')+'"><g stroke="currentColor">'+icons[p.category]+'</g></svg></div><label>Size<input id="overlay-size" type="range" min="22" max="220" value="78"></label><button class="button dark" id="start-camera">Use camera</button><label>Use a photo<input id="upload-photo" type="file" accept="image/*"></label>');
  const stage = $('stage');
  stage.onclick = (event) => {
    const bounds = stage.getBoundingClientRect();
    $('overlay').style.left = (event.clientX-bounds.left)+'px';
    $('overlay').style.top = (event.clientY-bounds.top)+'px';
  };
  $('overlay-size').oninput = (event) => $('overlay').style.width = event.target.value+'px';
  $('upload-photo').onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    releaseMedia();
    photo = URL.createObjectURL(file);
    $('camera').hidden = true;
    $('photo-preview').src = photo;
    $('photo-preview').hidden = false;
  };
  $('start-camera').onclick = async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
      if (!$('modal').open || !stage.isConnected) { stream.getTracks().forEach((track) => track.stop()); return; }
      releaseMedia();
      camera = stream;
      $('photo-preview').hidden = true;
      $('camera').style.setProperty('--mirror','-1');
      $('camera').srcObject = stream;
      $('camera').hidden = false;
    } catch { notify('Camera unavailable. You can use a photo.'); }
    finally { button.disabled = false; }
  };
}
document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-group],[data-panel],[data-action]');
  if (!control) return;
  const {group: selected,panel,action: type,id} = control.dataset;
  if (selected && !kidsStore && $('products')) {
    group = selected;
    $('category').value = $('metal').value = 'All';
    if ($('max-price')) $('max-price').value = $('max-price').max;
    render();
  }
  if (panel) {
    if (control.closest('.mobile-menu')) control.closest('.mobile-menu').open = false;
    show(panel);
    if (panel==='bespoke') {
      const brief = load('brief', {});
      $('brief-form').elements.occasion.value = brief.occasion || '';
      $('brief-form').elements.brief.value = brief.brief || '';
    }
  }
  if (type==='product') product(id);
  if (type==='zoom') display('<div class="piece-zoom">'+packshot(find(id))+'</div>');
  if (type==='try') tryOn(find(id));
  if (type==='save') {
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    save('saved',[...saved]);
    if (control.classList.contains('piece-save')) {
      control.setAttribute('aria-pressed', saved.has(id));
      control.textContent = saved.has(id) ? '♥' : '♡';
    }
    render();
    document.querySelector('[data-action="save"][data-id="'+id+'"]')?.focus();
    notify(saved.has(id)?'Piece saved':'Piece removed from saved');
  }
  if (['add','minus','plus'].includes(type)) {
    const isDetail = Boolean(control.closest('.piece-actions'));
    bag[id] = (bag[id] || 0) + (type==='minus' ? -1 : isDetail ? readQuantity() : 1);
    if (bag[id]<1) delete bag[id];
    save('bag',bag);
    render();
    if (type!=='add') show('bag');
    else if (control.closest('.product')) {
      document.querySelector('.quick-bag[data-id="'+id+'"]')?.focus();
      notify('Added to your bag');
    } else if ($('modal').open) show('bag');
    else notify('Added to your bag');
  }
  if (['checkout','bag'].includes(type)) show(type);
});
document.addEventListener('input',(event) => {
  if (event.target.id==='query') {
    const query = event.target.value.trim().toLowerCase();
    $('matches').innerHTML = results(catalog.filter((p) => (!kidsStore || p.groups.includes('Kids')) && [p.name,p.metal,p.category,...p.groups].join(' ').toLowerCase().includes(query)));
  }
});
document.addEventListener('submit',(event) => {
  event.preventDefault();
  const {id} = event.target;
  const data = new FormData(event.target);
  if (id==='rate-form') {
    rates = {Gold:Number(data.get('Gold')),Silver:Number(data.get('Silver'))};
    save('rates',rates);
    render();
    $('modal').close();
    notify('Demo rates updated');
  }
  if (id==='brief-form') {
    const brief = Object.fromEntries(data);
    save('brief',brief);
    const file = URL.createObjectURL(new Blob(['Aamour bespoke brief\n\n'+brief.occasion+'\n\n'+brief.brief],{type:'text/plain'}));
    const link = document.createElement('a');
    link.href = file;
    link.download = 'aamou-bespoke-brief.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(file),1000);
    $('modal').close();
    notify('Bespoke brief saved');
  }
  if (id==='finder-form') $('recommendations').innerHTML = results(catalog.filter((p) => (data.get('group')==='All'||p.groups.includes(data.get('group'))) && price(p)<=Number(data.get('budget'))).sort((a,b) => price(a)-price(b)));
});
for (const id of ['category','metal','sort']) $(id)?.addEventListener('change',render);
$('max-price')?.addEventListener('input',render);
$('reset-filters')?.addEventListener('click', () => {
  $('category').value = $('metal').value = 'All';
  $('max-price').value = $('max-price').max;
  render();
});
$('density')?.addEventListener('click', event => {
  const button = event.target.closest('[data-columns]');
  if (!button) return;
  $('products').dataset.columns = button.dataset.columns;
  for (const child of $('density').children) child.setAttribute('aria-pressed', child===button);
});
$('category-rail')?.addEventListener('click', event => {
  const link = event.target.closest('[data-category]');
  if (!link) return;
  group = 'All';
  $('category').value = link.dataset.category;
  $('metal').value = 'All';
  $('max-price').value = $('max-price').max;
  render();
});
if ($('category-rail')) {
  const categories = [['Rings','him'],['Earrings','her'],['Necklaces','dew'],['Bracelets','kids'],['Anklets','anklet']];
  $('category-rail').innerHTML = categories.map(([category,image]) => '<a href="#shop" data-category="'+category+'"><img src="assets/'+image+'.webp" alt="" loading="lazy"><span>'+category+'</span></a>').join('')+'<a href="kids.html"><img src="assets/little.webp" alt="" loading="lazy"><span>Little Aamour</span></a>';
}
$('piece')?.addEventListener('click', event => {
  const step = event.target.closest('[data-step]');
  if (step) $('piece-quantity').value = Math.min(99,Math.max(1,readQuantity()+Number(step.dataset.step)));
});
if ($('filter-box') && window.matchMedia('(max-width: 710px)').matches) $('filter-box').open = false;
const mobileMenu = document.querySelector('.mobile-menu');
mobileMenu?.addEventListener('click', event => {
  if (event.target.closest('a')) mobileMenu.open = false;
});
document.addEventListener('click', event => {
  if (mobileMenu?.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobileMenu?.open) return;
  mobileMenu.open = false;
  mobileMenu.querySelector('summary').focus();
});
renderPiece();
$('close').onclick = () => $('modal').close();
$('modal').addEventListener('close',releaseMedia);
window.addEventListener('beforeinstallprompt',(event) => { event.preventDefault(); installPrompt = event; });
$('install').onclick = async () => {
  if (installPrompt) { await installPrompt.prompt(); installPrompt = undefined; }
  else display(heading('Install Aamour')+'<p>Open your browser menu and choose Install app or Add to Home Screen where supported. On iPhone, use Safari’s Share menu.</p>');
};
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
render();
