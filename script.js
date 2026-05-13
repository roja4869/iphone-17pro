// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Shared Global Functions
const initLoader = () => {
  const progress = document.getElementById("loader-progress");
  let width = 0;
  const interval = setInterval(() => {
    width += Math.random() * 30;
    if (width >= 100) {
      width = 100;
      clearInterval(interval);
      setTimeout(hideLoader, 500);
    }
    if (progress) progress.style.width = `${width}%`;
  }, 100);
};

const hideLoader = () => {
  gsap.to("#loader", {
    opacity: 0,
    duration: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
};

// Cinematic Video Engine (Canvas + GSAP)
const initHeroCanvas = () => {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const frameCount = 240;
  const images = [];
  const sequence = { frame: 0, zoom: 1 };

  // Set initial dimensions
  const setCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  setCanvasSize();

  // Load images
  let loadedCount = 0;
  const loadImages = () => {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, "0");
      img.src = `assets/iphone_frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (i === 1) render();
        if (loadedCount === frameCount) startCinematicLoop();
      };
      images.push(img);
    }
  };
  loadImages();

  const render = () => {
    const img = images[Math.floor(sequence.frame)];
    if (img && img.complete) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const baseScale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const finalScale = baseScale * sequence.zoom;
      const x = (canvas.width / 2) - (img.width / 2) * finalScale;
      const y = (canvas.height / 2) - (img.height / 2) * finalScale;
      context.drawImage(img, x, y, img.width * finalScale, img.height * finalScale);
    }
  };

  // Cinematic Autoplay Loop (The "Video" part)
  let loopTween;
  const startCinematicLoop = () => {
    loopTween = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Scene 1: Intro Fade/Zoom
    loopTween.to(sequence, { zoom: 1.1, duration: 4, ease: "power1.inOut", onUpdate: render });
    
    // Scene 2: Slow Rotation
    loopTween.to(sequence, { frame: 60, duration: 6, ease: "none", onUpdate: render }, "-=4");
  };

  // Scroll Sync (Transitions from Video to Scroll)
  gsap.to(sequence, {
    frame: frameCount - 1,
    zoom: 1.5, // Zoom in as we scroll
    ease: "none",
    scrollTrigger: {
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: () => {
        if (loopTween) loopTween.pause();
        render();
      }
    }
  });

  window.addEventListener("resize", () => {
    setCanvasSize();
    render();
  });
};

// Smooth Scroll with Lenis
const initSmoothScroll = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
};

// Feature Scroll Animations
const initScrollAnimations = () => {
  const sections = document.querySelectorAll(".feature-section");
  sections.forEach((section) => {
    const text = section.querySelector(".feature-text");
    const visual = section.querySelector(".feature-visual");

    if (text) {
      gsap.from(text, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    }

    if (visual) {
      gsap.from(visual, {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    }
  });

  // Parallax Images
  const parallaxImgs = document.querySelectorAll(".parallax-img");
  parallaxImgs.forEach(img => {
    gsap.to(img, {
      y: -50,
      scrollTrigger: {
        trigger: img,
        scrub: true
      }
    });
  });
};

// Cursor Glow
const initCursorGlow = () => {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;
  window.addEventListener("mousemove", (e) => {
    gsap.to(glow, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.6,
      ease: "power2.out"
    });
  });
};

// Page Transition Logic
const initPageTransitions = () => {
  const links = document.querySelectorAll(".nav-contact, .btn-primary");
  const overlay = document.querySelector(".page-transition-overlay");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.includes(".html")) {
        e.preventDefault();
        gsap.to(overlay, {
          y: "0%",
          duration: 0.5,
          ease: "power4.inOut",
          onComplete: () => {
            window.location.href = href;
          }
        });
      }
    });
  });

  // Fade in on load
  if (overlay) {
    gsap.to(overlay, {
      y: "-100%",
      duration: 0.8,
      delay: 0.5,
      ease: "power4.inOut"
    });
  }
};

// Configurator Toggle Logic (for Purchase Page)
const initConfigurator = () => {
  const options = document.querySelectorAll(".option-card, .payment-card");
  options.forEach(option => {
    option.addEventListener("click", () => {
      // Find the grid container to only clear siblings
      const grid = option.closest(".option-grid, .payment-grid");
      if (grid) {
        grid.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
        option.classList.add("active");
      }
    });
  });

  // Place Order Button
  const placeOrderBtn = document.querySelector(".order-summary .btn-primary");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      alert("Success! Your iPhone 17 Pro order has been received. You will receive a confirmation email shortly.");
    });
  }
};

// Initialize All with Safety Wrappers
document.addEventListener("DOMContentLoaded", () => {
  const safeInit = (fn) => {
    try { fn(); } catch (e) { console.warn(`Module failed: ${fn.name}`, e); }
  };

  safeInit(initLoader);
  safeInit(initSmoothScroll);
  safeInit(initCursorGlow);
  safeInit(initHeroCanvas);
  safeInit(initScrollAnimations);
  safeInit(initPageTransitions);
  safeInit(initConfigurator);

  // Place Order Button Final Fix
  const orderBtn = document.getElementById("place-order-btn");
  if (orderBtn) {
    orderBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Cinematic Success Animation
      gsap.to(orderBtn, {
        scale: 0.95,
        duration: 0.1,
        onComplete: () => {
          gsap.to(orderBtn, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        }
      });

      const successMsg = document.createElement("div");
      successMsg.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); z-index: 10001; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0;">
          <div style="width: 100px; height: 100px; background: #00ff88; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);">
            <span style="font-size: 3rem; color: #000;">✓</span>
          </div>
          <h1 style="font-size: 3rem; margin-bottom: 10px;">Order Placed!</h1>
          <p style="color: #a1a1a6; font-size: 1.2rem;">Your iPhone 17 Pro is on its way.</p>
          <button onclick="location.href='index.html'" class="btn-primary" style="margin-top: 40px;">Return Home</button>
        </div>
      `;
      document.body.appendChild(successMsg);
      gsap.to(successMsg.firstElementChild, { opacity: 1, duration: 0.8, ease: "power2.inOut" });
    });
  }

  // Fix Explore Button
  const exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      gsap.to(window, {
        duration: 1.5,
        scrollTo: "#camera",
        ease: "power3.inOut"
      });
    });
  }
});
