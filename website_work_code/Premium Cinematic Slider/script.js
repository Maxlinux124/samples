const cards = document.querySelectorAll(".card");
const track = document.getElementById("cardTrack");

// Dual background layers for zero-flash blending
const bgLayer1 = document.getElementById("bgLayer1");
const bgLayer2 = document.getElementById("bgLayer2");

const metaTitle = document.getElementById("metaTitle");
const metaDesc = document.getElementById("metaDesc");
const metaCategory = document.getElementById("metaCategory");

const progressBar = document.getElementById("timelineProgress");
const timeDisplay = document.getElementById("timeDisplay");
const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");

// 10 Curated Premium Destinations
const destinations = [
  { title: "SAINT<br>ANTÖNIEN", desc: "Discover the hidden gem of the Swiss Alps, where dramatic peaks meet serene alpine valleys in an untouched winter paradise.", cat: "SWITZERLAND ALPS" },
  { title: "NAGANO<br>PREFECTURE", desc: "Experience the winter sanctuary of Yamanouchi, famous for its majestic snow monkeys and historic natural hot springs.", cat: "JAPAN ALPS" },
  { title: "MARRAKECH<br>MERZOUGA", desc: "Journey into the golden heart of the Sahara, where towering sand dunes shift gracefully under endless starlit skies.", cat: "SAHARA DESERT" },
  { title: "YOSEMITE<br>NATIONAL", desc: "Stand in awe of giant ancient sequoias, sheer granite monoliths like El Capitan, and soaring, thundering waterfalls.", cat: "YOSEMITE VALLEY" },
  { title: "VAL DI<br>FUNES", desc: "Lose yourself in the pristine alpine meadows nestled beneath the jagged, iconic spires of the Italian Dolomites.", cat: "ITALY ALPS" },
  { title: "POSITANO<br>SCENIC", desc: "Marvel at cliffside pastel villages cascading down to pristine blue Mediterranean shores along the world-renowned Amalfi coast.", cat: "AMALFI COAST" },
  { title: "OIA<br>CALDERA", desc: "Capture whitewashed cliffside structures topped by stunning blue domes against a vibrant Aegean sunset canvas.", cat: "SANTORINI GREECE" },
  { title: "HA LONG<br>BAY", desc: "Sail among thousands of towering limestone karsts shrouded in emerald waters and timeless mystical mist.", cat: "VIETNAM ECO" },
  { title: "PORTLAND<br>FORESTS", desc: "Wander through deep wilderness paths under layers of emerald moss in the pacific northwest's quiet woodlands.", cat: "DEEP WOODLANDS" },
  { title: "REYKJAVIK<br>PLAINS", desc: "Chase the ethereal neon curtains of aurora borealis lighting up frozen landscapes and geothermal spring plains.", cat: "ICELAND AURORA" }
];

let activeIndex = 0;
let isPlaying = true;
const slideDuration = 5; 
let elapsedSeconds = 0;
let timerInterval = null;
let currentBgLayer = 1;

function updateSlider() {
  // 1. Update Card State Elements
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === activeIndex);
  });

  // 2. Cross-Fade Background Engine (Solves black-flashing completely)
  const activeCardImg = cards[activeIndex].querySelector("img").src;
  if (currentBgLayer === 1) {
    bgLayer2.style.backgroundImage = `url('${activeCardImg}')`;
    bgLayer2.classList.add("active");
    bgLayer1.classList.remove("active");
    currentBgLayer = 2;
  } else {
    bgLayer1.style.backgroundImage = `url('${activeCardImg}')`;
    bgLayer1.classList.add("active");
    bgLayer2.classList.remove("active");
    currentBgLayer = 1;
  }

  // 3. Fluid Text Fade Transitions
  metaTitle.style.opacity = 0;
  metaDesc.style.opacity = 0;
  metaCategory.style.opacity = 0;

  setTimeout(() => {
    metaTitle.innerHTML = destinations[activeIndex].title;
    metaDesc.innerText = destinations[activeIndex].desc;
    metaCategory.innerText = destinations[activeIndex].cat;
    
    metaTitle.style.opacity = 1;
    metaDesc.style.opacity = 1;
    metaCategory.style.opacity = 1;
  }, 350);

  // 4. Track Transform Computation
  const cardWidth = cards[0].offsetWidth + 25; 
  const trackOffset = -activeIndex * cardWidth;
  track.style.transform = `translateX(${trackOffset}px)`;
  
  elapsedSeconds = 0;
}

function nextSlide() {
  activeIndex = (activeIndex + 1) % destinations.length;
  updateSlider();
}

function prevSlide() {
  activeIndex = (activeIndex - 1 + destinations.length) % destinations.length;
  updateSlider();
}

// 5-Second High Resolution Progression Loop
function startTimelineEngine() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (isPlaying) {
      elapsedSeconds += 0.05; 
      
      if (elapsedSeconds >= slideDuration) {
        elapsedSeconds = 0;
        nextSlide();
      }
      
      const percentage = (elapsedSeconds / slideDuration) * 100;
      progressBar.style.width = `${percentage}%`;
      
      timeDisplay.innerText = `0:${formatTimeUnits(elapsedSeconds)} / 0:0${slideDuration}`;
    }
  }, 50);
}

function formatTimeUnits(time) {
  const rounded = Math.floor(time);
  return rounded < 10 ? `0${rounded}` : rounded;
}

// Global Event Handlers
document.getElementById("nextBtn").onclick = nextSlide;
document.getElementById("prevBtn").onclick = prevSlide;

cards.forEach((card, index) => {
  card.onclick = () => {
    activeIndex = index;
    updateSlider();
  };
});

playPauseBtn.onclick = () => {
  isPlaying = !isPlaying;
  playIcon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
};

// Initial Execution
const initialImg = cards[0].querySelector("img").src;
bgLayer1.style.backgroundImage = `url('${initialImg}')`;
updateSlider();
startTimelineEngine();