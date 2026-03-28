document.addEventListener("DOMContentLoaded", function () {
  if (!window.BIKERSHOOD_DATA || !window.Bikershood) {
    return;
  }

  const galleryEl = document.getElementById("communityGallery");
  const eventsEl = document.getElementById("communityEvents");

  if (galleryEl) {
    galleryEl.innerHTML = window.BIKERSHOOD_DATA.communityGallery
      .map(
        (item) => `
          <article class="gallery-card">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="gallery-meta">
              <strong>${item.title}</strong>
              <p>${item.by}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  if (eventsEl) {
    eventsEl.innerHTML = window.BIKERSHOOD_DATA.events
      .map(
        (event) => `
          <article class="event-card">
            <h4>${event.title}</h4>
            <p class="event-meta">${event.date} | ${event.location}</p>
            <p>${event.description}</p>
          </article>
        `
      )
      .join("");
  }

  window.Bikershood.renderInstagram("communityInstaFeed", 4);
});
