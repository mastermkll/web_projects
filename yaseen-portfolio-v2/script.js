const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const tiltEl = document.querySelector('[data-tilt]');
if (tiltEl && window.matchMedia('(min-width: 900px)').matches) {
  tiltEl.addEventListener('mousemove', (event) => {
    const rect = tiltEl.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;

    tiltEl.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  tiltEl.addEventListener('mouseleave', () => {
    tiltEl.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
}
