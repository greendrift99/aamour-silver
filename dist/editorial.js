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
