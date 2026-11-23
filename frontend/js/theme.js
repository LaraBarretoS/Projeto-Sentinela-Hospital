(function () {
  const storageKey = "sentinela-theme";
  function aplicarTema() {
    const savedTheme = localStorage.getItem(storageKey);
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
    atualizarIcone();
  }
  function atualizarIcone() {
    const botao = document.getElementById("themeToggle");
    if (!botao) return;
    const escuro = document.body.classList.contains("dark-mode");
    botao.textContent = escuro ? "☀️" : "🌙";
    botao.title = escuro ? "Modo claro" : "Modo escuro";
    botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  }
  function garantirBotao() {
    if (!document.getElementById("themeToggle")) {
      const botao = document.createElement("button");
      botao.id = "themeToggle"; botao.className = "theme-toggle"; botao.type = "button";
      botao.textContent = "🌙"; botao.title = "Modo escuro"; botao.setAttribute("aria-label", "Ativar modo escuro");
      document.body.appendChild(botao);
    }
    document.getElementById("themeToggle").onclick = alternarTema;
    atualizarIcone();
  }
  window.alternarTema = function () {
    const escuro = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", escuro);
    localStorage.setItem(storageKey, escuro ? "dark" : "light");
    atualizarIcone();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { aplicarTema(); garantirBotao(); });
  else { aplicarTema(); garantirBotao(); }
})();
