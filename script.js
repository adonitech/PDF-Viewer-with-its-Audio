"use strict";
// Set PDF.js worker path for offline use
pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdfjs/pdf.worker.min.js";

// Get DOM elements
const pdfCanvas = document.getElementById("pdfCanvas");
const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const rewindBtn = document.getElementById("rewindBtn");
const forwardBtn = document.getElementById("forwardBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomSlider = document.getElementById("zoomSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const audioProgress = document.getElementById("audioProgress");
const audioTimestamp = document.getElementById("audioTimestamp");
const chapterSelect = document.getElementById("chapterSelect");
const sectionContainer = document.querySelector(".section-lists");
const app = document.getElementById("app");
const back = document.getElementById("back");

let pdfDoc = null;
let currentPage = 1;
let isPlaying = false;
let scale = 1.5;
let isFullscreen = false;

const audioFiles = [
  // "assets/chapter1.mp3",
  // "assets/chapter2.mp3",
  // "assets/chapter3.mp3",
  // "assets/chapter4.mp3",
  // "assets/chapter5.mp3",
  // "assets/chapter6.mp3",
  // "assets/chapter7.mp3",
  // "assets/chapter8.mp3",
  // "assets/chapter9.mp3",
  // Add more chapters as needed
];
// Creating AudioFiles
for (let i = 1; i <= 21; i++) {
  audioFiles.push(`assets/AChapter${i}.mp3`);
}

async function renderPage(pageNum) {
  if (!pdfDoc) return;
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale });
    const context = pdfCanvas.getContext("2d");

    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    updatePageInfo();

    // Center the canvas after rendering
    // centerCanvas();
  } catch (error) {
    console.error("Error rendering page:", error);
  }
}

// Load PDF and first audio on page load
window.addEventListener("load", async () => {
  try {
    pdfDoc = await pdfjsLib.getDocument("assets/book.pdf").promise;
    currentPage = 1;
    renderPage(currentPage);
    updatePageInfo();
  } catch (error) {
    console.error("Error loading PDF:", error);
    alert("Failed to load PDF.");
  }

  // Load first audio
  audioPlayer.src = audioFiles[0];
  playPauseBtn.style.display = "block";
  updateAudioProgress();
});

// Audio progress and timestamp
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor(seconds % 60);
  return `${hours ? hours + ":" : ""}${mins.toString().padStart(2, 0)}:${
    secs < 10 ? "0" : ""
  }${secs}`;
}

function updateAudioProgress() {
  if (audioPlayer.src) {
    audioProgress.max = audioPlayer.duration || 100;
    audioProgress.value = audioPlayer.currentTime;
    audioTimestamp.textContent = `${formatTime(
      audioPlayer.currentTime
    )} / ${formatTime(audioPlayer.duration || 0)}`;
  }
}

audioPlayer.addEventListener("timeupdate", updateAudioProgress);
audioPlayer.addEventListener("loadedmetadata", updateAudioProgress);

audioProgress.addEventListener("input", () => {
  audioPlayer.currentTime = audioProgress.value;
  updateAudioProgress();
});

function updatePageInfo() {
  if (pdfDoc) {
    pageInfo.textContent = `Page ${currentPage} of ${pdfDoc.numPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
  }
}

function togglePlayPause() {
  if (isPlaying) {
    audioPlayer.pause();
    playPauseBtn.textContent = "Play";
  } else {
    audioPlayer.play().catch((error) => {
      console.error("Error playing audio:", error);
      alert("Failed to play audio.");
    });
    playPauseBtn.textContent = "Pause";
  }
  isPlaying = !isPlaying;
}

// Fullscreen Function
function fullscreen(e) {
  if (!isFullscreen) {
    if (app.requestFullscreen) {
      app.requestFullscreen();
    } else if (app.webkitRequestFullscreen) {
      app.webkitRequestFullscreen();
    } else if (app.msRequestFullscreen) {
      app.msRequestFullscreen();
    }
    app.classList.add("fullscreen");
    fullscreenBtn.textContent = "Exit Fullscreen";
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    app.classList.remove("fullscreen");
    fullscreenBtn.textContent = "Fullscreen";
  }
  isFullscreen = !isFullscreen;
}

// Previous and Next Page Functions
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
}
function nextPage() {
  if (pdfDoc && currentPage < pdfDoc.numPages) {
    currentPage++;
    renderPage(currentPage);
  }
}

// Rewind and Forward Buttons and functions
function rewindBtnFunction() {
  audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
  updateAudioProgress();
}
function forwardBtnFunction() {
  audioPlayer.currentTime = Math.min(
    audioPlayer.duration,
    audioPlayer.currentTime + 5
  );
  updateAudioProgress();
}

// Back button function
function backBtnFunction() {
  if (app.classList.contains("hidden")) return;

  // e.preventDefault();
  if (isPlaying) {
    audioPlayer.pause();
    playPauseBtn.textContent = "Play";
  }
  audioPlayer.src = "";
  isFullscreen = false;
  updatePageInfo();

  sectionContainer.classList.remove("hidden");
  app.classList.add("hidden");
  back.style.display = "none";
}

// Zoom Function
function updateZoom(newScale) {
  if (+newScale < 50) return;
  scale = newScale / 100;
  zoomSlider.value = newScale;
  if (pdfDoc) {
    renderPage(currentPage);
  }
}
// as the app starts the zoom will be 80
updateZoom(80);

// RESET Everything
if (app.classList.contains("hidden")) {
  back.style.display = "none";
}
back.addEventListener("click", backBtnFunction);

//////////////////////////////////

// Define chapter-to-page mapping
const chapterPageMap = {
  1: 7,
  2: 30,
  3: 41,
  4: 53,
  5: 60,
  6: 70,
  7: 79,
  8: 85,
  9: 95,
  10: 104,
  11: 113,
  12: 120,
  13: 129,
  14: 137,
  15: 145,
  16: 155,
  17: 163,
  18: 170,
  19: 180,
  20: 187,
  21: 197,
};

// Function to update UI
const updateUI = () => {
  back.style.display = "block";
  app.classList.remove("hidden");
  sectionContainer.classList.add("hidden");
};

// Function to play audio
const playAudio = (chapterIndex) => {
  const audioSrc = audioFiles[chapterIndex - 1];
  if (!audioSrc) {
    console.error(`Audio file not found for chapter ${chapterIndex}`);
    return false;
  }
  audioPlayer.src = audioSrc;
  setTimeout(() => {
    audioPlayer
      .play()
      .then(() => {
        playPauseBtn.textContent = "Pause";
        updateAudioProgress();
      })
      .catch((error) => {
        console.error("Audio playback failed:", error);
      });
  }, 2000); // Configurable delay
  return true;
};

// Event listener
sectionContainer.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.nodeName !== "A") return;

  const chapter = parseInt(e.target.dataset.chapter, 10);
  if (!chapter || !chapterPageMap[chapter]) {
    console.error(`Invalid or unmapped chapter: ${chapter}`);
    return;
  }

  // Update page
  currentPage = chapterPageMap[chapter];
  renderPage(currentPage);
  updatePageInfo();

  // Play audio and update UI
  if (playAudio(chapter)) {
    isPlaying = true; // Only set to true if playback starts
    updateUI();
  }
});

//////////////////////////////////////////////////////////
//Event listners
playPauseBtn.addEventListener("click", togglePlayPause);

prevPageBtn.addEventListener("click", prevPage);
nextPageBtn.addEventListener("click", nextPage);

rewindBtn.addEventListener("click", rewindBtnFunction);
forwardBtn.addEventListener("click", forwardBtnFunction);

zoomInBtn.addEventListener("click", () => {
  const newScale = Math.min(300, parseInt(zoomSlider.value) + 10);
  updateZoom(newScale);
});

zoomOutBtn.addEventListener("click", () => {
  const newScale = Math.max(50, parseInt(zoomSlider.value) - 10);
  updateZoom(newScale);
});

zoomSlider.addEventListener("input", (e) => {
  updateZoom(parseInt(e.target.value));
});

fullscreenBtn.addEventListener("click", fullscreen);

// Double-click on the canvas will result in zooming
let zoomed = 0;
pdfCanvas.addEventListener("dblclick", function (e) {
  e.preventDefault();
  if (+zoomSlider.value !== 50 && !zoomed) {
    updateZoom(50);
    return;
  }
  zoomed++;

  const phase = ((zoomed - 1) % 6) + 1;

  if (phase <= 3) {
    updateZoom(+zoomSlider.value + 50);
  } else {
    updateZoom(+zoomSlider.value - 50);
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    app.classList.remove("fullscreen");
    fullscreenBtn.textContent = "Fullscreen";
    isFullscreen = false;
  }
});

// keydown events here READ READ READ
document.addEventListener("keydown", (e) => {
  console.log(e);
  if (e.key === "f" || (e.shiftKey === true && e.key === "F")) {
    fullscreen(e);
  }
  if (e.key === "r" || (e.shiftKey === true && e.key === "R")) {
    rewindBtnFunction();
  }
  if (e.key === "t" || (e.shiftKey === true && e.key === "T")) {
    forwardBtnFunction();
  }

  if (e.key === "Escape") {
    backBtnFunction();
  }

  if (e.key === "=") {
    updateZoom(+zoomSlider.value + 10);
  }

  if (e.key === "-") {
    updateZoom(+zoomSlider.value - 10);
  }

  if (e.key === "ArrowLeft") {
    prevPage();
  }
  if (e.key === "ArrowRight") {
    nextPage();
  }
  if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    togglePlayPause();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("Service Worker registered:", registration);
      },
      (error) => {
        console.error("Service Worker registration failed:", error);
      }
    );
  });
}

// let touchStartX = 0;
// let touchEndX = 0;

// pdfCanvas.addEventListener("touchstart", (e) => {
//   touchStartX = e.changedTouches[0].screenX;
// });

// pdfCanvas.addEventListener("touchend", (e) => {
//   touchEndX = e.changedTouches[0].screenX;
//   const swipeDistance = touchStartX - touchEndX;
//   const minSwipeDistance = 50;
//   if (swipeDistance > minSwipeDistance) {
//     nextPage();
//   } else if (swipeDistance < -minSwipeDistance) {
//     prevPage();
//   }
// });

/*
      function centerCanvas() {

        // Ensure canvas is centered within pdf-section
        const canvasWidth = pdfCanvas.width;
        const canvasHeight = pdfCanvas.height;
        const sectionWidth = pdfSection.clientWidth;
        const sectionHeight = pdfSection.clientHeight;

        // Add padding to allow scrolling to all edges
        pdfSection.style.paddingLeft = `${Math.max(
          0,
          (sectionWidth - canvasWidth) / 2
        )}px`;
        pdfSection.style.paddingRight = `${Math.max(
          0,
          (sectionWidth - canvasWidth) / 2
        )}px`;
        pdfSection.style.paddingTop = `${Math.max(
          0,
          (sectionHeight - canvasHeight) / 2
        )}px`;
        pdfSection.style.paddingBottom = `${Math.max(
          0,
          (sectionHeight - canvasHeight) / 2
        )}px`;

        // Scroll to center
        pdfSection.scrollLeft =
          (canvasWidth + pdfSection.offsetWidth - sectionWidth) / 2;
        pdfSection.scrollTop =
          (canvasHeight + pdfSection.offsetHeight - sectionHeight) / 2;
      }
      */
// Swipe and Pinch-to-Zoom Handling

// let initialPinchDistance = null;
// let initialScale = scale;

// pdfCanvas.addEventListener("touchstart", (e) => {
//   if (e.touches.length === 1) {
//     // Single touch for swipe
//     touchStartX = e.touches[0].screenX;
//   } else if (e.touches.length === 2) {
//     // Two touches for pinch
//     e.preventDefault();
//     const touch1 = e.touches[0];
//     const touch2 = e.touches[1];
//     initialPinchDistance = Math.hypot(
//       touch1.pageX - touch2.pageX,
//       touch1.pageY - touch2.pageY
//     );
//     initialScale = scale;
//   }
// });
// pdfCanvas.addEventListener("touchmove", (e) => {
//   if (e.touches.length === 2) {
//     // Handle pinch zoom
//     e.preventDefault();
//     const touch1 = e.touches[0];
//     const touch2 = e.touches[1];
//     const currentPinchDistance = Math.hypot(
//       touch1.pageX - touch2.pageX,
//       touch1.pageY - touch2.pageY
//     );
//     if (initialPinchDistance) {
//       const pinchScale = currentPinchDistance / initialPinchDistance;
//       const newScale = initialScale * pinchScale;
//       updateZoom(newScale);
//     }
//   }
// });

// pdfCanvas.addEventListener("touchend", (e) => {
//   if (e.changedTouches.length === 1) {
//     // Handle swipe
//     touchEndX = e.changedTouches[0].screenX;
//     const swipeDistance = touchStartX - touchEndX;
//     const minSwipeDistance = 50;
//     if (swipeDistance > minSwipeDistance) {
//       nextPage();
//     } else if (swipeDistance < -minSwipeDistance) {
//       prevPage();
//     }
//   }
//   initialPinchDistance = null; // Reset pinch
// });
