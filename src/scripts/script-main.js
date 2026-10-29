const search = document.querySelector('[data-search]');
const filters = [...document.querySelectorAll('[data-filter]')];
let category = 'All';
function filterItems() {
  const query = (search?.value || '').trim().toLowerCase();
  let count = 0;
  document.querySelectorAll('[data-item]').forEach(item => {
    const visible = (category === 'All' || item.dataset.category === category) && item.textContent.toLowerCase().includes(query);
    item.hidden = !visible;
    if (visible) count++;
  });
  const status = document.querySelector('[data-results]');
  if (status) status.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
  const empty = document.querySelector('[data-empty]');
  if (empty) empty.hidden = count > 0;
}
search?.addEventListener('input', filterItems);
filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  filterItems();
}));
document.querySelector('[data-reset]')?.addEventListener('click', () => {
  search.value = ''; category = 'All';
  filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === 'All')));
  filterItems(); search.focus();
});
if (search) filterItems();
