(() => {
  "use strict";
  const THEME_KEY = "sentinela-theme";
  const EFFECTS_KEY = "sentinela-effects";
  const root = document.documentElement;

  function readTheme(){
    try { return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; }
    catch (_) { return "light"; }
  }
  function readEffects(){
    try {
      const value = localStorage.getItem(EFFECTS_KEY);
      return value !== "off";
    } catch (_) { return true; }
  }
  function store(key, value){ try { localStorage.setItem(key, value); } catch (_) {} }

  function updateThemeIcon(){
    const button = document.getElementById("themeToggle");
    if (!button) return;
    const dark = document.body.classList.contains("dark-mode");
    button.textContent = dark ? "☀️" : "🌙";
    button.title = dark ? "Ativar modo claro" : "Ativar modo escuro";
    button.setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  }

  function ensureThemeButton(){
    if (document.body.classList.contains("tv-display")) return;
    let button = document.getElementById("themeToggle");
    if (!button) {
      button = document.createElement("button");
      button.id = "themeToggle";
      button.className = "theme-toggle";
      button.type = "button";
      (document.querySelector(".sentinela-header-actions") || document.body).appendChild(button);
    }
    button.onclick = window.alternarTema;
    updateThemeIcon();
  }

  function setTheme(theme){
    const dark = theme === "dark";
    document.body.classList.toggle("dark-mode", dark);
    store(THEME_KEY, dark ? "dark" : "light");
    updateThemeIcon();
    document.dispatchEvent(new CustomEvent("sentinela:theme-change", { detail: { theme: dark ? "dark" : "light" } }));
  }

  function setEffects(enabled){
    document.body.classList.toggle("effects-enabled", enabled);
    document.body.classList.toggle("effects-disabled", !enabled);
    store(EFFECTS_KEY, enabled ? "on" : "off");
    document.dispatchEvent(new CustomEvent("sentinela:effects-change", { detail: { enabled } }));
  }

  let rafId = 0;
  function handlePointerMove(event){
    if (!readEffects()) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      root.style.setProperty("--fx-x", x);
      root.style.setProperty("--fx-y", y);
    });
  }

  function markPageType(){
    const isLogin = !!document.getElementById("usuario");
    document.body.classList.toggle("sentinela-login", isLogin);
  }

  function applyPreferences(){
    markPageType();
    setTheme(readTheme());
    setEffects(readEffects());
    ensureThemeButton();
    root.style.setProperty("--fx-x", "50%");
    root.style.setProperty("--fx-y", "18%");
  }

  window.alternarTema = function alternarTema(){
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(next);
  };

  window.sentinelaThemeAPI = {
    getTheme: readTheme,
    setTheme,
    getEffectsEnabled: readEffects,
    setEffects
  };

  window.addEventListener("storage", event => {
    if (event.key === THEME_KEY) { document.body.classList.toggle("dark-mode", readTheme() === "dark"); updateThemeIcon(); }
    if (event.key === EFFECTS_KEY) { document.body.classList.toggle("effects-disabled", !readEffects()); document.body.classList.toggle("effects-enabled", readEffects()); }
  });
  document.addEventListener("mousemove", handlePointerMove, { passive: true });
  document.addEventListener("DOMContentLoaded", applyPreferences, { once: true });
  if (document.readyState !== "loading") applyPreferences();
})();
