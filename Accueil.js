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

// Hero Image Animation
const leftImg = document.getElementById("left-img");
const rightImg = document.getElementById("right-img");

const images = [
  ["amande-hero.png", "arachide-hero.png"],
  ["chocolat-hero.png", "olive-hero.png"],
  ["argan-hero.png", "zaefran-hero.png"]
];

let index = 0;

function cycleImages() {
  if (!leftImg || !rightImg) return;

  leftImg.style.opacity = 0;
  rightImg.style.opacity = 0;
  leftImg.style.transform = "translateY(-50%) scale(0.95)";
  rightImg.style.transform = "translateY(-50%) scale(0.95)";

  setTimeout(() => {
    leftImg.src = images[index][0];
    rightImg.src = images[index][1];

    leftImg.style.opacity = 1;
    rightImg.style.opacity = 1;
    leftImg.style.transform = "translateY(-50%) scale(1)";
    rightImg.style.transform = "translateY(-50%) scale(1)";

    index = (index + 1) % images.length;
  }, 400);
}

setInterval(cycleImages, 3500);
cycleImages();

// Star Rating Logic
document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".star-rating i");
  const ratingValue = document.getElementById("rating-value");
  const sendButton = document.getElementById("send-rating");
  const thankYouMessage = document.getElementById("thank-you");

  if (!stars || !ratingValue || !sendButton || !thankYouMessage) return;

  let currentRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      currentRating = index + 1;
      ratingValue.textContent = `Note : ${currentRating}/5`;

      stars.forEach((s, i) => {
        s.classList.toggle("selected", i < currentRating);
      });
    });
  });

  sendButton.addEventListener("click", () => {
    if (currentRating > 0) {
      thankYouMessage.textContent = "Merci pour votre évaluation !";
      sendButton.disabled = true;
    } else {
      thankYouMessage.textContent = "Veuillez sélectionner une note avant d'envoyer.";
    }
  });
});

// Horizontal Product Scroll
const scrollContainer = document.getElementById('productScroll');
const leftBtn = document.querySelector('.scroll-btn.left');
const rightBtn = document.querySelector('.scroll-btn.right');
const scrollAmount = 300;

if (scrollContainer && leftBtn && rightBtn) {
  leftBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}
