document.addEventListener("DOMContentLoaded", function () {
  if (!window.BIKERSHOOD_DATA || !window.Bikershood) {
    return;
  }

  const models = window.BIKERSHOOD_DATA.byoModels;
  const components = window.BIKERSHOOD_DATA.byoComponents;

  const modelGrid = document.getElementById("modelGrid");
  const componentGrid = document.getElementById("componentGrid");
  const selectedModelName = document.getElementById("selectedModelName");
  const selectedComponentsEl = document.getElementById("selectedComponents");
  const summarySubtotal = document.getElementById("summarySubtotal");
  const summaryBuild = document.getElementById("summaryBuild");
  const summaryTotal = document.getElementById("summaryTotal");
  const addByoCart = document.getElementById("addByoCart");
  const clearBuild = document.getElementById("clearBuild");
  const stepChips = Array.from(document.querySelectorAll("[data-step-chip]"));
  const previewModelLabel = document.getElementById("previewModelLabel");

  const state = {
    modelId: models[0].id,
    selectedComponents: new Set()
  };

  function getModel() {
    return models.find((model) => model.id === state.modelId) || models[0];
  }

  function getSelectedComponents() {
    return components.filter((component) => state.selectedComponents.has(component.id));
  }

  function getTotalPrice() {
    return getSelectedComponents().reduce((sum, component) => sum + component.price, 0);
  }

  function updateStepState() {
    const hasModel = Boolean(state.modelId);
    const hasComponents = state.selectedComponents.size > 0;

    stepChips.forEach((chip) => {
      const step = Number(chip.getAttribute("data-step-chip"));
      let active = false;

      if (step === 1) {
        active = true;
      }
      if (step === 2) {
        active = hasModel;
      }
      if (step === 3) {
        active = hasModel && hasComponents;
      }
      if (step === 4) {
        active = hasModel && hasComponents;
      }

      chip.classList.toggle("active", active);
    });
  }

  function togglePreviewLayer(id, enabled) {
    const layer = document.getElementById(id);
    if (layer) {
      layer.classList.toggle("hide", !enabled);
    }
  }

  function updatePreview() {
    const model = getModel();
    const accent = model.accent || "#ff4d00";

    const accentParts = ["previewAccentBody", "previewAccentTank", "previewAccentTail"];
    accentParts.forEach((partId) => {
      const part = document.getElementById(partId);
      if (part) {
        part.setAttribute("fill", accent);
      }
    });

    if (previewModelLabel) {
      previewModelLabel.textContent = model.name;
    }

    togglePreviewLayer("layerAuxLights", state.selectedComponents.has("aux-lights"));
    togglePreviewLayer("layerHandlebar", state.selectedComponents.has("handlebar"));
    togglePreviewLayer("layerWindscreen", state.selectedComponents.has("windscreen"));
    togglePreviewLayer("layerSaddleBag", state.selectedComponents.has("saddle-bag"));
    togglePreviewLayer("layerCrashGuard", state.selectedComponents.has("crash-guard"));
  }

  function renderModels() {
    if (!modelGrid) {
      return;
    }

    modelGrid.innerHTML = models
      .map(
        (model) => `
          <button type="button" class="model-card ${model.id === state.modelId ? "active" : ""}" data-model-id="${model.id}">
            <div>
              <p class="model-name">${model.name}</p>
              <p class="model-note">${model.note}</p>
            </div>
            <span class="badge">Select</span>
          </button>
        `
      )
      .join("");

    modelGrid.querySelectorAll("[data-model-id]").forEach((button) => {
      button.addEventListener("click", function () {
        state.modelId = this.getAttribute("data-model-id");
        renderModels();
        updateSummary();
        updatePreview();
        updateStepState();
      });
    });
  }

  function renderComponents() {
    if (!componentGrid) {
      return;
    }

    componentGrid.innerHTML = components
      .map(
        (component) => `
          <button type="button" class="component-card ${
            state.selectedComponents.has(component.id) ? "active" : ""
          }" data-component-id="${component.id}">
            <div>
              <p class="model-name">${component.name}</p>
              <p class="model-note">${component.type}</p>
            </div>
            <span class="component-price">${window.Bikershood.formatCurrency(component.price)}</span>
          </button>
        `
      )
      .join("");

    componentGrid.querySelectorAll("[data-component-id]").forEach((button) => {
      button.addEventListener("click", function () {
        const componentId = this.getAttribute("data-component-id");
        if (state.selectedComponents.has(componentId)) {
          state.selectedComponents.delete(componentId);
        } else {
          state.selectedComponents.add(componentId);
        }
        renderComponents();
        updateSummary();
        updatePreview();
        updateStepState();
      });
    });
  }

  function updateSummary() {
    const model = getModel();
    const selected = getSelectedComponents();
    const total = getTotalPrice();

    if (selectedModelName) {
      selectedModelName.textContent = model.name;
    }

    if (selectedComponentsEl) {
      selectedComponentsEl.innerHTML = selected.length
        ? selected.map((item) => `<span class="tag">${item.name}</span>`).join("")
        : '<span class="tag">No components selected yet</span>';
    }

    if (summarySubtotal) {
      summarySubtotal.textContent = window.Bikershood.formatCurrency(total);
    }

    if (summaryBuild) {
      summaryBuild.textContent = String(selected.length) + " components";
    }

    if (summaryTotal) {
      summaryTotal.textContent = window.Bikershood.formatCurrency(total);
    }

    if (addByoCart) {
      addByoCart.disabled = !selected.length;
      addByoCart.classList.toggle("btn-muted", !selected.length);
      addByoCart.classList.toggle("btn-primary", selected.length > 0);
    }
  }

  if (addByoCart) {
    addByoCart.addEventListener("click", function () {
      const model = getModel();
      const selected = getSelectedComponents();

      if (!selected.length) {
        window.Bikershood.showToast("Select at least one component first");
        return;
      }

      const selectedIds = selected.map((item) => item.id).sort();
      const total = getTotalPrice();

      window.Bikershood.addToCart({
        id: "byo-" + model.id + "-" + selectedIds.join("-"),
        name: "Custom Build - " + model.name,
        price: total,
        image: "assets/parts/part-17.jpeg",
        source: "BYO Configurator",
        itemType: "custom",
        meta: "Includes: " + selected.map((item) => item.name).join(", ")
      });
    });
  }

  if (clearBuild) {
    clearBuild.addEventListener("click", function () {
      state.modelId = models[0].id;
      state.selectedComponents.clear();
      renderModels();
      renderComponents();
      updateSummary();
      updatePreview();
      updateStepState();
    });
  }

  renderModels();
  renderComponents();
  updateSummary();
  updatePreview();
  updateStepState();
});
