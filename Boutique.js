// Navbar toggle
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar && nav) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  });
}

if (close && nav) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  });
}
