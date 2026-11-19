/* Sector-only refinements. Admin and TV do not load this module. */
(() => {
  'use strict';
  const main = document.querySelector('#conteudo-principal.reference-v3');
  if (!main) return;
  const label = document.querySelector('.sentinela-header-title .eyebrow');
  if (label) label.textContent = label.textContent.replace(' / ', ' / ');
  const theme = document.getElementById('themeToggle');
  if (theme) theme.setAttribute('aria-label', 'Alternar entre tema claro e escuro');
  const actions = document.querySelector('.sentinela-header-actions');
  if (actions && theme) actions.appendChild(theme);
  const sender = document.getElementById('btnTrocarUsuario');
  if (sender) sender.textContent = '⇄  Trocar usuário';
  const password = document.getElementById('btnMinhaSenha');
  if (password) password.textContent = '♙  Minha senha';
  const point = document.getElementById('btnPontoManual');
  if (point) point.textContent = '◷  Ponto';
  // No existing input IDs, business logic, validation or API calls are altered.
})();
