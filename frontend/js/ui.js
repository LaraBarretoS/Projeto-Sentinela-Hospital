/* Composição visual por departamento, sem alterar os formulários existentes. */
(() => {
  const name = window.location.pathname.split('/').pop().split('.')[0];
  const pages = {
    admin: ["Administração", "Visão geral de operações, pessoas e desempenho hospitalar.", "GESTÃO & CONTROLE", "01 / OPERAÇÃO"],
    atendimento: ["Recepção", "Cadastro de pacientes e encaminhamento para a triagem.", "PORTA DE ENTRADA", "02 / ATENDIMENTO"],
    triagem: ["Triagem", "Organize a fila de espera e registre a avaliação inicial.", "AVALIAÇÃO INICIAL", "03 / TRIAGEM"],
    medico: ["Atendimento médico", "Visualize a fila, consulte o histórico e conclua atendimentos.", "CONSULTÓRIO", "04 / MÉDICO"],
    almoxarifado: ["Almoxarifado", "Estoque, movimentações e controle de insumos hospitalares.", "ESTOQUE & SUPRIMENTOS", "05 / MATERIAIS"],
    medicacoes: ["Prescrições", "Histórico de prescrições associadas a consultas.", "CONTROLE", "06 / REGISTROS"]
  };
  const page = pages[name];
  if (!page || !document.querySelector('.sentinela-topbar')) return;
  document.body.classList.add('sentinela-dashboard', `page-${name}`);
  const bar = document.querySelector('.sentinela-topbar');
  const brand = document.createElement('div'); brand.className = 'sentinela-brand';
  brand.innerHTML = '<div class="sentinela-brand-mark" aria-hidden="true">+</div><div><span class="sentinela-brand-name">sentinela<span style="color:#2566f3">.</span></span><span class="sentinela-brand-caption">Hospital Management</span></div>';
  bar.querySelector('.sentinela-left').prepend(brand);
  const hero = document.createElement('header'); hero.className = 'sentinela-hero';
  hero.innerHTML = '<div class="sentinela-hero-copy"><span class="sentinela-eyebrow"></span><h1></h1><p></p></div><div class="sentinela-hero-art"><span></span></div>';
  hero.querySelector('.sentinela-eyebrow').textContent = page[2];
  hero.querySelector('h1').textContent = page[0];
  hero.querySelector('p').textContent = page[1];
  hero.querySelector('.sentinela-hero-art span').textContent = page[3];
  bar.insertAdjacentElement('afterend', hero);
  const label = document.createElement('div'); label.className='sentinela-section-label'; label.textContent='Área de trabalho / '+page[0];
  hero.insertAdjacentElement('afterend', label);
  // O sino existente em ADM continua funcional e é exibido no cabeçalho.
  const bell = document.getElementById('notificationBell');
  if (bell) bar.querySelector('.sentinela-actions')?.prepend(bell);
  // Em telas menores, o botão de alternar tema continua acessível.
})();
