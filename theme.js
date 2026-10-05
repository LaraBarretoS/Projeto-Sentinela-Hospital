(function () {
  const savedTheme = localStorage.getItem("sentinela-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  function atualizarIcone() {
    const botao = document.getElementById("themeToggle");
    if (!botao) return;
    const escuro = document.body.classList.contains("dark-mode");
    botao.textContent = escuro ? "☀️" : "🌙";
    botao.title = escuro ? "Modo claro" : "Modo escuro";
    botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  }

  window.alternarTema = function () {
    const escuro = document.body.classList.toggle("dark-mode");
    localStorage.setItem("sentinela-theme", escuro ? "dark" : "light");
    atualizarIcone();
  };

  document.addEventListener("DOMContentLoaded", atualizarIcone);
})();
