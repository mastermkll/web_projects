document.addEventListener("DOMContentLoaded", function () {
  if (!window.BIKERSHOOD_DATA || !window.Bikershood) {
    return;
  }

  const allProducts = window.BIKERSHOOD_DATA.products;

  const bikeFilter = document.getElementById("bikeFilter");
  const brandFilter = document.getElementById("brandFilter");
  const priceFilter = document.getElementById("priceFilter");
  const priceRead = document.getElementById("priceRead");
  const quickSearch = document.getElementById("quickSearch");
  const productGrid = document.getElementById("productsGrid");
  const clearFilters = document.getElementById("clearFilters");
  const resultsCount = document.getElementById("resultsCount");
  const tagButtons = Array.from(document.querySelectorAll("[data-tag-filter]"));

  const maxPrice = Math.max.apply(
    null,
    allProducts.map((product) => product.price)
  );

  const state = {
    bikeModel: "all",
    brand: "all",
    maxPrice: maxPrice,
    search: window.Bikershood.getUrlParam("search") || "",
    tag:
      (function () {
        const rawTag = (window.Bikershood.getUrlParam("tag") || "").toLowerCase();
        if (rawTag === "top") {
          return "top";
        }
        if (rawTag === "new") {
          return "new";
        }
        return "all";
      })()
  };

  const bikeOptions = [
    "all",
    ...new Set(allProducts.flatMap((product) => product.bikeModels))
  ];
  const brandOptions = ["all", ...new Set(allProducts.map((product) => product.brand))];

  function fillSelect(selectElement, options) {
    if (!selectElement) {
      return;
    }

    selectElement.innerHTML = options
      .map((option) => {
        const label = option === "all" ? "All" : option;
        return `<option value="${option}">${label}</option>`;
      })
      .join("");
  }

  function renderProducts() {
    const filtered = allProducts.filter((product) => {
      const searchText = [product.name, product.brand, product.category].join(" ").toLowerCase();
      const searchOk = !state.search || searchText.includes(state.search.toLowerCase());
      const bikeOk = state.bikeModel === "all" || product.bikeModels.includes(state.bikeModel);
      const brandOk = state.brand === "all" || product.brand === state.brand;
      const priceOk = product.price <= state.maxPrice;
      const tagOk =
        state.tag === "all" ||
        (state.tag === "top" && product.isTopSelling) ||
        (state.tag === "new" && product.isNew);

      return searchOk && bikeOk && brandOk && priceOk && tagOk;
    });

    if (!productGrid) {
      return;
    }

    if (!filtered.length) {
      productGrid.innerHTML =
        '<div class="empty-state">No products match your filters. Try broadening bike model, brand, or price range.</div>';
    } else {
      productGrid.innerHTML = filtered
        .map((product) => window.Bikershood.createProductCard(product))
        .join("");
      window.Bikershood.bindProductAddButtons(productGrid);
    }

    if (resultsCount) {
      resultsCount.textContent = String(filtered.length) + " Products";
    }
  }

  function syncControls() {
    if (bikeFilter) {
      bikeFilter.value = state.bikeModel;
    }

    if (brandFilter) {
      brandFilter.value = state.brand;
    }

    if (priceFilter) {
      priceFilter.max = String(maxPrice);
      priceFilter.value = String(state.maxPrice);
    }

    if (priceRead) {
      priceRead.textContent = "Up to " + window.Bikershood.formatCurrency(state.maxPrice);
    }

    if (quickSearch) {
      quickSearch.value = state.search;
    }

    tagButtons.forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-tag-filter") === state.tag);
    });
  }

  fillSelect(bikeFilter, bikeOptions);
  fillSelect(brandFilter, brandOptions);
  syncControls();

  if (bikeFilter) {
    bikeFilter.addEventListener("change", function () {
      state.bikeModel = this.value;
      renderProducts();
    });
  }

  if (brandFilter) {
    brandFilter.addEventListener("change", function () {
      state.brand = this.value;
      renderProducts();
    });
  }

  if (priceFilter) {
    priceFilter.addEventListener("input", function () {
      state.maxPrice = Number(this.value || maxPrice);
      syncControls();
      renderProducts();
    });
  }

  if (quickSearch) {
    quickSearch.addEventListener("input", function () {
      state.search = this.value.trim();
      renderProducts();
    });
  }

  tagButtons.forEach((button) => {
    button.addEventListener("click", function () {
      state.tag = this.getAttribute("data-tag-filter") || "all";
      syncControls();
      renderProducts();
    });
  });

  if (clearFilters) {
    clearFilters.addEventListener("click", function () {
      state.bikeModel = "all";
      state.brand = "all";
      state.maxPrice = maxPrice;
      state.search = "";
      state.tag = "all";
      syncControls();
      renderProducts();
    });
  }

  renderProducts();
});
