// src/js/loadingOverlay.js

export function createLoadingOverlay({
  overlayId = "loadingOverlay",
  barFillId = "loadingBarFill",
  pctId = "loadingPct",
  labelId = "loadingLabel",
  fadeMs = 450,
} = {}) {
  const overlay = document.getElementById(overlayId);
  const barFill = document.getElementById(barFillId);
  const pctText = document.getElementById(pctId);
  const labelText = document.getElementById(labelId);

  if (!overlay || !barFill || !pctText || !labelText) {
    console.warn("[loadingOverlay] Missing loading overlay DOM elements.");
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  return {
    setProgress(p01) {
      if (!barFill || !pctText) return;
      const p = clamp01(p01);
      barFill.style.width = `${Math.round(p * 100)}%`;
      pctText.textContent = `${Math.round(p * 100)}%`;
    },

    setLabel(text) {
      if (!labelText) return;
      labelText.textContent = text;
    },

    hide() {
      if (!overlay) return;
      overlay.classList.add("hidden");
      setTimeout(() => overlay.remove(), fadeMs + 50);
    },
  };
}
