// Affinity Carousel functionality
const images = [
  "../assets/misspoppinsapp/image3.svg",
  "../assets/misspoppinsapp/image4.svg",
  "../assets/misspoppinsapp/image5.svg",
  "../assets/misspoppinsapp/image6.svg",
  "../assets/misspoppinsapp/image7.svg",
  "../assets/misspoppinsapp/image8.svg",
  "../assets/misspoppinsapp/image9.svg",
  "../assets/misspoppinsapp/image10.svg",
];

let currentIndex = 0;

// Get DOM elements
const carouselImage = document.getElementById('carouselImage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Handle previous button click
function handlePrev() {
  currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  updateCarousel();
}

// Handle next button click
function handleNext() {
  currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
  updateCarousel();
}

// Update carousel image
function updateCarousel() {
  carouselImage.src = images[currentIndex];
  carouselImage.alt = `Affinity image ${currentIndex + 3}`;
}

// Add event listeners
if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', handlePrev);
  nextBtn.addEventListener('click', handleNext);
}

// Optional: Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    handlePrev();
  } else if (e.key === 'ArrowRight') {
    handleNext();
  }
});

// Optional: Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (carouselImage) {
  carouselImage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  carouselImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  if (touchEndX < touchStartX - 50) {
    // Swipe left
    handleNext();
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe right
    handlePrev();
  }
}

// Initialize
console.log('MissPoppins App loaded successfully');