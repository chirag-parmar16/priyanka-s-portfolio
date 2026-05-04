document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Clock
    const clockElement = document.getElementById('live-clock');
    function updateClock() {
        const now = new Date();
        if (clockElement) clockElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('portfolio-theme', currentTheme);
        });
    }


    // ─────────────────────────────────────────────────────────
    // 1. Audio Preloading & Hover Sounds
    // ─────────────────────────────────────────────────────────
    const sounds = {
        nature: new Audio('Audio/nature.mp3'),
        sparkling: new Audio('Audio/sparkling.mp3'),
        bubble: new Audio('Audio/Bubble.mp3'),
        keyboard: new Audio('Audio/keyboard.mp3'),
        pageflip: new Audio('Audio/pageflip.mp3')
    };

    // Pre-configure audio for responsiveness
    Object.values(sounds).forEach(audio => {
        audio.preload = 'auto';
        audio.load(); // Force immediate load
    });

    // Unlock Audio Context on first interaction (Required by Browsers)
    const unlockAudio = () => {
        Object.values(sounds).forEach(audio => {
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(() => {});
        });
        window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);

    function playSound(name) {
        if (sounds[name]) {
            sounds[name].currentTime = 0;
            const playPromise = sounds[name].play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio playback prevented:", error);
                });
            }
        }
    }

    function stopSound(name) {
        if (sounds[name]) {
            sounds[name].pause();
            sounds[name].currentTime = 0;
        }
    }

    // ─────────────────────────────────────────────────────────
    // 3. Wavy Text Animation (GSAP)
    // ─────────────────────────────────────────────────────────
    document.querySelectorAll('.name, .tagline').forEach(el => {
        const text = el.textContent.trim();
        el.innerHTML = text.split('').map(char =>
            `<span class="wavy-char" style="display:inline-block;pointer-events:none">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        gsap.to(el.querySelectorAll('.wavy-char'), {
            y: -4, duration: 1.4, repeat: -1, yoyo: true,
            stagger: 0.07, ease: "sine.inOut"
        });
    });

    // ─────────────────────────────────────────────────────────
    // 4. Card Entrance Animation
    // ─────────────────────────────────────────────────────────
    gsap.from(".grid-card", {
        opacity: 0, y: 60, duration: 1,
        stagger: 0.12, ease: "power3.out",
        clearProps: "y"
    });

    // ─────────────────────────────────────────────────────────
    // 5. Card Hover — Background Animation + Ripple
    // ─────────────────────────────────────────────────────────
    document.querySelectorAll('.grid-card').forEach(card => {
        // Shimmer overlay
        const shimmer = document.createElement('div');
        shimmer.className = 'card-shimmer';
        card.appendChild(shimmer);

        // Ripple container
        const ripple = document.createElement('div');
        ripple.className = 'card-ripple';
        card.appendChild(ripple);

        // Track mouse inside card for radial glow direction + 3D Tilt
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const x = ((relX) / rect.width  * 100).toFixed(1) + '%';
            const y = ((relY)  / rect.height * 100).toFixed(1) + '%';
            card.style.setProperty('--mx', x);
            card.style.setProperty('--my', y);

        });

        card.addEventListener('mouseenter', () => {
            // Audio Feedback
            if (card.classList.contains('brownthought')) playSound('sparkling');
            if (card.classList.contains('guppy')) playSound('bubble');
            if (card.classList.contains('petals') || card.classList.contains('birthdays')) playSound('nature');
            if (card.classList.contains('connect-card') || card.classList.contains('status-card')) playSound('keyboard');
            if (card.classList.contains('resume-card')) playSound('pageflip');
            
            // Removed scale: 1.025 for stability
            // Shimmer sweep
            gsap.fromTo(shimmer,
                { opacity: 0, x: '-100%', skewX: -15 },
                { opacity: 1, x: '200%', skewX: -15, duration: 0.8, ease: "power2.inOut",
                  onComplete: () => gsap.set(shimmer, { opacity: 0 }) }
            );
        });

        card.addEventListener('mouseleave', () => {
            // Stop Audio Feedback
            if (card.classList.contains('brownthought')) stopSound('sparkling');
            if (card.classList.contains('guppy')) stopSound('bubble');
            if (card.classList.contains('petals') || card.classList.contains('birthdays')) stopSound('nature');
            if (card.classList.contains('connect-card') || card.classList.contains('status-card')) stopSound('keyboard');
            if (card.classList.contains('resume-card')) stopSound('pageflip');

            gsap.to(card, { 
                duration: 0.6, 
                ease: "power2.out" 
            });
        });

        // Typewriter Effect for Card 8 (Status)
        if (card.classList.contains('status-card')) {
            const revealEl = card.querySelector('.status-reveal');
            const fullText = revealEl.dataset.text;
            let typeInterval = null;

            card.addEventListener('mouseenter', () => {
                let charIndex = 0;
                revealEl.textContent = '';
                
                clearInterval(typeInterval);
                typeInterval = setInterval(() => {
                    if (charIndex < fullText.length) {
                        revealEl.textContent += fullText[charIndex];
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 50); // Speed of typing

                // Animate blinking cursor
                gsap.to(revealEl, { borderRightColor: 'transparent', repeat: -1, duration: 0.5, yoyo: true });
            });

            card.addEventListener('mouseleave', () => {
                clearInterval(typeInterval);
                revealEl.textContent = '';
                gsap.killTweensOf(revealEl);
                revealEl.style.borderRightColor = 'transparent';
        });
    }

    // ─────────────────────────────────────────────────────────
    // Connect Card Typewriter
    // ─────────────────────────────────────────────────────────
    const connectCard = document.querySelector('.connect-card');
    const connectHandle = document.querySelector('.connect-handle');
    if (connectCard && connectHandle) {
        const handleText = connectHandle.getAttribute('data-text');
        let connectInterval;

        connectCard.addEventListener('mouseenter', () => {
            clearInterval(connectInterval);
            let charIdx = 0;
            connectHandle.textContent = '';
            
            connectInterval = setInterval(() => {
                if (charIdx < handleText.length) {
                    connectHandle.textContent = handleText.substring(0, charIdx + 1);
                    charIdx++;
                } else {
                    clearInterval(connectInterval);
                }
            }, 35);
            
            gsap.to(connectHandle, { borderRightColor: 'transparent', repeat: -1, duration: 0.5, yoyo: true });
        });

        connectCard.addEventListener('mouseleave', () => {
            clearInterval(connectInterval);
            connectHandle.textContent = '';
            gsap.killTweensOf(connectHandle);
            connectHandle.style.borderRightColor = 'transparent';
        });
    }

    // ─────────────────────────────────────────────────────────
    // 7. Contextual Card Follower
    // ─────────────────────────────────────────────────────────
    const cardFollower = document.getElementById('card-follower');
    const heroCard = document.querySelector('.hero-card');
    const portraitCard = document.querySelector('.image-card');

    if (cardFollower) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cardFollower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: 'power2.out'
            });
        });

        // Hero Card Hover -> About Pill
        if (heroCard) {
            heroCard.addEventListener('mouseenter', () => {
                playSound('nature');
                cardFollower.innerHTML = `<div class="about-pill">about &rarr;</div>`;
                cardFollower.classList.add('active');
            });
            heroCard.addEventListener('mouseleave', () => {
                stopSound('nature');
                cardFollower.classList.remove('active');
            });
        }

        // Portrait Card Hover -> Thought Bubble SVG
        if (portraitCard) {
            portraitCard.addEventListener('mouseenter', () => {
                playSound('nature');
                cardFollower.innerHTML = `
                    <div class="cloud-cursor">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Main Bubble -->
                            <path d="M19 11C19 14.3137 15.866 17 12 17C10.7412 17 9.56684 16.7118 8.5532 16.2081C7.88607 16.5912 6.84067 17.0662 5 17.5C5.83681 16.6632 6.25 15.625 6.25 14.75C6.25 14.5492 6.23072 14.3541 6.19391 14.1672C5.44857 13.3105 5 12.2132 5 11C5 7.68629 8.13401 5 12 5C15.866 5 19 7.68629 19 11Z" fill="white" fill-opacity="0.95"/>
                            <!-- Small Dots (Thought Bubbles) -->
                            <circle cx="6" cy="19" r="1.2" fill="white" fill-opacity="0.8"/>
                            <circle cx="4" cy="20.5" r="0.8" fill="white" fill-opacity="0.6"/>
                        </svg>
                    </div>`;
                cardFollower.classList.add('active');
            });
            portraitCard.addEventListener('mouseleave', () => {
                stopSound('nature');
                cardFollower.classList.remove('active');
            });
        }
    }

        // Ripple on click
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const dot = document.createElement('span');
            dot.className = 'ripple-dot';
            dot.style.left = (e.clientX - rect.left) + 'px';
            dot.style.top  = (e.clientY - rect.top)  + 'px';
            ripple.appendChild(dot);
            gsap.fromTo(dot,
                { scale: 0, opacity: 0.5 },
                { scale: 4, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => dot.remove() }
            );
        });
    });

    // ─────────────────────────────────────────────────────────
    // 6. Star Generator for Brownthought Card (Card 3)
    // ─────────────────────────────────────────────────────────
    function generateStars() {
        const starryContainers = document.querySelectorAll('.bt-starry-bg');
        if (!starryContainers.length) return;

        starryContainers.forEach(container => {
            const starCount = 40; 
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star-dot';

                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const size = 1 + Math.random() * 2;
                const duration = 1.5 + Math.random() * 2.5;
                const delay = Math.random() * 3;

                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.setProperty('--duration', `${duration}s`);
                star.style.setProperty('--delay', `${delay}s`);

                container.appendChild(star);
            }
        });
    }

    generateStars();

  // --- Card 4: Falling Petals Animation ---
  function generatePetals() {
    const container = document.querySelector(".petals-container");
    if (!container) return;

    for (let i = 0; i < 40; i++) {
      const petal = document.createElement("div");
      petal.className = "petal";

      // Full-width randomized spawning for background coverage
      const size = Math.random() * 12 + 8 + "px";
      const left = Math.random() * 100 + "%";
      const duration = Math.random() * 4 + 4 + "s";
      const delay = Math.random() * 8 + "s";

      petal.style.width = size;
      petal.style.height = size;
      petal.style.left = left;
      petal.style.animationDuration = duration;
      petal.style.animationDelay = delay;
      // Random initial rotation
      petal.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(petal);
    }
  }
  generatePetals();

  // --- Card 5: Bubble Pop Animation ---
  function generateBubbles() {
    const container = document.querySelector(".bubbles-container");
    if (!container) return;

    for (let i = 0; i < 12; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // Solid, randomized bubbles with reduced amount
      const size = Math.random() * 15 + 8 + "px";
      const left = Math.random() * 100 + "%";
      const duration = Math.random() * 3 + 3 + "s";
      const delay = Math.random() * 6 + "s";

      bubble.style.width = size;
      bubble.style.height = size;
      bubble.style.left = left;
      bubble.style.animationDuration = duration;
      bubble.style.animationDelay = delay;

      container.appendChild(bubble);
    }
  }
  generateBubbles();
});
