document.addEventListener("DOMContentLoaded", function () {
  if (!window.BIKERSHOOD_DATA || !window.Bikershood) {
    return;
  }

  const products = window.BIKERSHOOD_DATA.products;
  const topSelling = products.filter((item) => item.isTopSelling).slice(0, 6);
  const newArrivals = products.filter((item) => item.isNew).slice(0, 6);

  const topSellingGrid = document.getElementById("topSellingGrid");
  const newArrivalsGrid = document.getElementById("newArrivalsGrid");

  if (topSellingGrid) {
    topSellingGrid.innerHTML = topSelling
      .map((product) => window.Bikershood.createProductCard(product))
      .join("");
    window.Bikershood.bindProductAddButtons(topSellingGrid);
  }

  if (newArrivalsGrid) {
    newArrivalsGrid.innerHTML = newArrivals
      .map((product) => window.Bikershood.createProductCard(product))
      .join("");
    window.Bikershood.bindProductAddButtons(newArrivalsGrid);
  }

  window.Bikershood.renderInstagram("instagramFeed", 4);
});
