const images = [
  "../assets/misspoppinsdesktop/affinity1.svg",
  "../assets/misspoppinsdesktop/affinity2.svg",
  "../assets/misspoppinsdesktop/affinity3.svg"
];


let currentIndex = 0;
const imageElement = document.getElementById("affinityImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  imageElement.style.opacity = 0;
  setTimeout(() => {
    imageElement.src = images[currentIndex];
    imageElement.style.opacity = 1;
  }, 200);
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  imageElement.style.opacity = 0;
  setTimeout(() => {
    imageElement.src = images[currentIndex];
    imageElement.style.opacity = 1;
  }, 200);
});