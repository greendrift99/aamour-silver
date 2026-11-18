const campaigns = [
  {image:'refraction',alt:'A sculptural ring on champagne satin',name:'The Rarefind Collection',href:'#shop',group:'Rarefind'},
  {image:'hero',alt:'Gold jewellery worn in profile',name:'The Aamour Edit',href:'#shop',group:'Her'},
  {image:'kai',alt:'Gold-framed dendritic agate pendant',name:'Las Vegas KAI',href:'#kai'}
];
const campaign = document.querySelector('.gallery');
if (campaign) {
  let selected = 0;
  const pages = document.getElementById('campaign-pages');
  const image = document.getElementById('campaign-image');
  const title = document.getElementById('campaign-name');
  const link = document.getElementById('campaign-link');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function showCampaign(index) {
    selected = (index + campaigns.length) % campaigns.length;
    const {image: file,alt,name,href,group} = campaigns[selected];
    image.src = 'assets/' + file + '.webp';
    image.alt = alt;
    title.textContent = name;
    link.href = href;
    if (group) link.dataset.group = group;
    else delete link.dataset.group;
    link.setAttribute('aria-label', 'Explore ' + name);
    [...pages.children].forEach((button, position) => button.setAttribute('aria-pressed', position === selected));
    if (!motion.matches) image.animate([{opacity:.65,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:420,easing:'ease-out'});
  }
  campaigns.forEach(({name}, index) => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-pressed', index === selected);
    button.onclick = () => showCampaign(index);
    pages.append(button);
  });
  document.getElementById('campaign-prev').onclick = () => showCampaign(selected-1);
  document.getElementById('campaign-next').onclick = () => showCampaign(selected+1);
  campaign.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    showCampaign(selected + (event.key === 'ArrowRight' ? 1 : -1));
  });
}
const kidFilters = document.getElementById('kid-filters');
kidFilters?.addEventListener('click', event => {
  const control = event.target.closest('[data-kid]');
  if (!control) return;
  const category = document.getElementById('category');
  category.value = control.dataset.kid;
  category.dispatchEvent(new Event('change'));
  [...kidFilters.children].forEach(button => button.setAttribute('aria-pressed', button === control));
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.little-card').forEach((card,index) => card.animate?.(
      [{opacity:0,transform:'translateY(13px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],
      {duration:360,delay:index*55,easing:'cubic-bezier(.2,.7,.25,1)',fill:'backwards'}
    ));
  }
});
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if (!isIntersecting) return;
      target.classList.remove('reveal-pending');
      observer.unobserve(target);
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-pending');
    observer.observe(element);
  });
}

const world = document.querySelector('.world-scene');
if (world) {
  const scenes = {
    star: {name:'Little Star Bracelet', file:'storybook', alt:'Gold star bracelet in a miniature meadow'},
    stud: {name:'Little Sun Studs', file:'pack-stud', alt:'Two gold sunburst stud earrings'},
    anklet: {name:'Starlight Anklet', file:'pack-anklet', alt:'A gold anklet with star and moon charms'}
  };
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const art = document.getElementById('world-art');
  const image = document.getElementById('world-image');
  const controls = [...world.querySelectorAll('[data-world-piece]')];
  let transition;
  let frame;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;

  function positionLayers() {
    frame = undefined;
    if (!visible || motionPreference.matches) return;
    const bounds = art.getBoundingClientRect();
    const progress = Math.max(-1,Math.min(1,(innerHeight / 2 - bounds.top - bounds.height / 2) / innerHeight));
    art.style.setProperty('--world-x', pointerX * 11 + 'px');
    art.style.setProperty('--world-y', pointerY * 8 + progress * 15 + 'px');
  }
  function scheduleLayers() {
    if (frame === undefined && !motionPreference.matches && visible) frame = requestAnimationFrame(positionLayers);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) scheduleLayers();
    }).observe(art);
  }
  window.addEventListener('scroll',scheduleLayers,{passive:true});
  window.addEventListener('resize',scheduleLayers);
  art.addEventListener('pointermove',event => {
    if (!finePointer.matches || motionPreference.matches) return;
    const rect = art.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    scheduleLayers();
  });
  art.addEventListener('pointerleave',() => {
    pointerX = pointerY = 0;
    scheduleLayers();
  });
  controls.forEach(button => button.addEventListener('click',() => {
    const id = button.dataset.worldPiece;
    if (id===world.dataset.world) return;
    const {name,file,alt} = scenes[id];
    world.dataset.world = id;
    image.src = 'assets/'+file+'.webp';
    image.alt = alt;
    document.getElementById('world-piece').href = 'piece.html?id='+id+'&from=kids';
    document.getElementById('world-name').textContent = name;
    document.getElementById('world-status').textContent = name;
    controls.forEach(control => control.setAttribute('aria-pressed',control===button));
    transition?.cancel();
    if (!motionPreference.matches && image.animate) transition = image.animate(
      [{opacity:.25,scale:1.09,clipPath:'inset(0 0 18% 0 round 24px)'},{opacity:1,scale:1,clipPath:'inset(0 0 0 0 round 24px)'}],
      {duration:560,easing:'cubic-bezier(.18,.72,.23,1)'}
    );
  }));
  world.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key) || !controls.includes(event.target)) return;
    event.preventDefault();
    const index = controls.indexOf(event.target);
    const next = controls[(index + controls.length + (event.key==='ArrowRight' ? 1 : -1)) % controls.length];
    next.focus();
    next.click();
  });
}

const quest = document.getElementById('space-quest');
if (quest) {
  const tokens = [...quest.querySelectorAll('[data-token]')];
  const trails = [...quest.querySelectorAll('[data-trail]')];
  const progress = document.getElementById('quest-progress');
  const reset = document.getElementById('quest-reset');
  function updateQuest() {
    const collected = tokens.map(token => token.getAttribute('aria-pressed')==='true');
    const count = collected.filter(Boolean).length;
    trails.forEach((trail,index) => trail.classList.toggle('lit',collected[index] && collected[(index+1)%tokens.length]));
    quest.classList.toggle('quest-complete',count===tokens.length);
    progress.textContent = count===tokens.length ? 'Constellation complete!' : count+' of '+tokens.length+' collected';
    reset.hidden = count===0;
  }
  tokens.forEach(token => token.addEventListener('click',() => {
    token.setAttribute('aria-pressed','true');
    updateQuest();
  }));
  reset.addEventListener('click',() => {
    tokens.forEach(token => token.setAttribute('aria-pressed','false'));
    tokens[0].focus();
    updateQuest();
  });

  const wornDescriptions = {
    star:'Styled photo of a child wearing the star bracelet',
    anklet:'Styled photo of a child wearing the moon and star anklet',
    stud:'Styled photo of a child wearing a sunburst stud'
  };
  const gallery = document.getElementById('products');
  gallery.addEventListener('click',event => {
    const button = event.target.closest('[data-view]');
    if (!button || button.getAttribute('aria-pressed')==='true') return;
    const controls = button.closest('.little-views');
    const card = controls.closest('.little-card');
    const image = card.querySelector('.product-photo img');
    const id = controls.dataset.photoId;
    const view = button.dataset.view;
    const name = card.querySelector('h3').textContent;
    const url = 'assets/little-'+id+(view==='front' ? '' : '-'+view)+'.webp';
    image.src = url;
    image.alt = view==='worn' ? wornDescriptions[id] : name+(view==='detail' ? ' shown at an angle' : ', front view');
    card.dataset.photoView = view;
    [...controls.children].forEach(control => control.setAttribute('aria-pressed',control===button));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      image.getAnimations?.().forEach(animation => animation.cancel());
      image.animate?.([{opacity:.2,transform:'translateX(12px) scale(.97)'},{opacity:1,transform:'translateX(0) scale(1)'}],
        {duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  });
}
