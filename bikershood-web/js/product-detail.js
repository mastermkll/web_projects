document.addEventListener("DOMContentLoaded", function () {
  if (!window.BIKERSHOOD_DATA || !window.Bikershood) {
    return;
  }

  const requestedId = window.Bikershood.getUrlParam("id") || window.BIKERSHOOD_DATA.products[0].id;
  const product = window.Bikershood.getProductById(requestedId) || window.BIKERSHOOD_DATA.products[0];

  const mainImageWrap = document.getElementById("detailMainImage");
  const thumbsWrap = document.getElementById("detailThumbs");
  const brandEl = document.getElementById("detailBrand");
  const titleEl = document.getElementById("detailTitle");
  const descriptionEl = document.getElementById("detailDescription");
  const priceEl = document.getElementById("detailPrice");
  const compatList = document.getElementById("compatList");
  const featuresList = document.getElementById("featureList");
  const addBtn = document.getElementById("addDetailCart");
  const waBtn = document.getElementById("detailWhatsapp");
  const compatibleText = document.getElementById("detailCompatibleText");
  const relatedGrid = document.getElementById("relatedGrid");

  let activeImage = product.images[0] || product.heroImage;

  function renderGallery() {
    if (mainImageWrap) {
      mainImageWrap.innerHTML = `<img src="${activeImage}" alt="${product.name}" loading="eager" />`;
    }

    if (thumbsWrap) {
      thumbsWrap.innerHTML = product.images
        .map(
          (image) => `
            <button class="thumb-btn ${image === activeImage ? "active" : ""}" type="button" data-thumb="${image}">
              <img src="${image}" alt="${product.name} thumbnail" loading="lazy" />
            </button>
          `
        )
        .join("");

      thumbsWrap.querySelectorAll("[data-thumb]").forEach((button) => {
        button.addEventListener("click", function () {
          activeImage = this.getAttribute("data-thumb");
          renderGallery();
        });
      });
    }
  }

  if (brandEl) {
    brandEl.textContent = product.brand;
  }

  if (titleEl) {
    titleEl.textContent = product.name;
  }

  if (descriptionEl) {
    descriptionEl.textContent = product.description;
  }

  if (priceEl) {
    priceEl.innerHTML =
      window.Bikershood.formatCurrency(product.price) +
      ` <small style="font-size:1rem;color:#90909a;text-decoration:line-through;">${window.Bikershood.formatCurrency(
        product.originalPrice
      )}</small>`;
  }

  if (compatibleText) {
    compatibleText.textContent = "Compatible with: " + product.bikeModels.join(", ");
  }

  if (compatList) {
    compatList.innerHTML = product.bikeModels.map((bike) => `<span class="tag">${bike}</span>`).join("");
  }

  if (featuresList) {
    featuresList.innerHTML = product.features.map((feature) => `<li>${feature}</li>`).join("");
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      window.Bikershood.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.heroImage,
        source: product.brand,
        itemType: "product",
        meta: "Compatible with: " + product.bikeModels.slice(0, 3).join(", ")
      });
    });
  }

  if (waBtn) {
    waBtn.setAttribute(
      "href",
      window.Bikershood.getWhatsAppLink(
        `Hi Bikershood, I want to order ${product.name}. Bike compatibility: ${product.bikeModels.join(
          ", "
        )}`
      )
    );
  }

  if (relatedGrid) {
    const relatedProducts = window.BIKERSHOOD_DATA.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .slice(0, 3);

    relatedGrid.innerHTML = relatedProducts
      .map((item) => window.Bikershood.createProductCard(item))
      .join("");

    window.Bikershood.bindProductAddButtons(relatedGrid);
  }

  renderGallery();
});
