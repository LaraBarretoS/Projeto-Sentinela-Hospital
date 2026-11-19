(() => {
  const user = JSON.parse(localStorage.getItem('sentinelaUser') || 'null');
  if (!user || user.tipo !== 'admin') { location.replace('/index.html'); return; }
  const headers = { 'Content-Type': 'application/json', 'X-Sentinela-User': user.usuario };
  const roleNames = { admin: 'Administrador', medico: 'Médico', triagem: 'Triagem', atendimento: 'Atendimento', farmacia: 'Farmácia' };
  let usuarioAlvoSenha = null;

  async function api(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
    return data;
  }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function setTab(name) {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${name}`));
    if (name === 'usuarios') carregarUsuarios();
    if (name === 'notificacoes') carregarNotificacoes();
  }
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.panel)));
  document.getElementById('notificationBell').addEventListener('click', () => setTab('notificacoes'));

  async function carregarAdmin() {
    try {
      const resumo = await api('/admin/resumo');
      document.getElementById('cards').innerHTML = `<div class="card"><b>Pacientes</b><div class="num">${resumo.pacientes}</div></div><div class="card"><b>Triagens</b><div class="num">${resumo.triagens}</div></div><div class="card"><b>Consultas</b><div class="num">${resumo.consultas}</div></div><div class="card"><b>🟢 Verdes</b><div class="num">${resumo.risco.verde}</div></div><div class="card"><b>🟡 Amarelos</b><div class="num">${resumo.risco.amarelo}</div></div><div class="card"><b>🔴 Vermelhos</b><div class="num">${resumo.risco.vermelho}</div></div><div class="card"><b>Presentes</b><div class="num">${resumo.presentes}/${resumo.funcionarios}</div></div><div class="card"><b>Estoque baixo</b><div class="num">${resumo.estoqueBaixo}</div></div>`;
      const freq = await api('/admin/frequencia');
      document.getElementById('freq').innerHTML = freq.map(f => `<tr><td>${escapeHTML(f.nome)}</td><td>${escapeHTML(roleNames[f.tipo] || f.tipo)}</td><td>${escapeHTML(f.registro?.horaEntrada || '—')}</td><td>${escapeHTML(f.registro?.saida || '—')}</td><td>${f.registro ? '🟢 Presente' : '🔴 Ausente'}</td></tr>`).join('');
      const aud = await api('/admin/auditoria');
      document.getElementById('audit').innerHTML = aud.map(a => `<tr><td>${new Date(a.dataHora).toLocaleString('pt-BR')}</td><td>${escapeHTML(a.usuarioAcao)}</td><td>${escapeHTML(a.acao)}</td><td>${escapeHTML(a.alvo || '—')}</td></tr>`).join('') || '<tr><td colspan="4">Nenhum registro ainda.</td></tr>';
    } catch (error) { console.error(error); }
  }

  async function carregarUsuarios() {
    const tbody = document.getElementById('usersList'); tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
    try {
      const users = await api('/admin/usuarios');
      tbody.innerHTML = users.map(u => {
        const protegido = u.tipo === 'admin';
        return `<tr><td>${escapeHTML(u.nome)}</td><td>${escapeHTML(u.usuario)}</td><td><span class="role-pill">${escapeHTML(roleNames[u.tipo] || u.tipo)}</span></td><td>${protegido ? '<span class="hint">Conta protegida</span>' : `<button class="btn" data-action="password" data-user="${escapeHTML(u.usuario)}">🔐 Alterar senha</button><button class="btn danger" data-action="delete" data-user="${escapeHTML(u.usuario)}">🗑️ Excluir</button>`}</td></tr>`;
      }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="4">${escapeHTML(error.message)}</td></tr>`; }
  }
  document.getElementById('usersList').addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const username = button.dataset.user;
    if (button.dataset.action === 'password') { abrirModalSenha(username); return; }
    if (button.dataset.action === 'delete') {
      if (!confirm(`Tem certeza que deseja excluir o usuário “${username}”? Esta ação não pode ser desfeita.`)) return;
      try { await api(`/admin/usuarios/${encodeURIComponent(username)}`, { method: 'DELETE' }); await carregarUsuarios(); await carregarAdmin(); }
      catch (error) { alert(error.message); }
    }
  });
  function abrirModalSenha(username) {
    usuarioAlvoSenha = username;
    document.getElementById('passwordModalTitle').textContent = `🔐 Alterar senha: ${username}`;
    document.getElementById('passwordModalDescription').textContent = 'Informe a senha antiga e escolha uma nova. Se a senha antiga foi esquecida, envie uma solicitação para aprovação do administrador.';
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordMessage').textContent = '';
    document.getElementById('passwordModal').style.display = 'flex';
  }
  function fecharModalSenha() { document.getElementById('passwordModal').style.display = 'none'; usuarioAlvoSenha = null; }
  document.getElementById('closePasswordModal').addEventListener('click', fecharModalSenha);
  document.getElementById('passwordModal').addEventListener('click', event => { if (event.target.id === 'passwordModal') fecharModalSenha(); });
  document.getElementById('passwordForm').addEventListener('submit', async event => {
    event.preventDefault();
    const msg = document.getElementById('passwordMessage');
    const old = document.getElementById('oldPassword').value;
    const next = document.getElementById('newPassword').value;
    const confirmNext = document.getElementById('confirmPassword').value;
    if (next !== confirmNext) { msg.className = 'status-msg error'; msg.textContent = 'A confirmação da nova senha não corresponde.'; return; }
    if (!usuarioAlvoSenha) return;
    try {
      await api(`/admin/usuarios/${encodeURIComponent(usuarioAlvoSenha)}/senha`, { method: 'POST', body: JSON.stringify({ senhaAntiga: old, novaSenha: next }) });
      msg.className = 'status-msg success'; msg.textContent = 'Senha alterada com sucesso.';
      setTimeout(fecharModalSenha, 700);
    } catch (error) { msg.className = 'status-msg error'; msg.textContent = error.message; }
  });
  document.getElementById('forgotOldPassword').addEventListener('click', async () => {
    if (!usuarioAlvoSenha) return;
    const msg = document.getElementById('passwordMessage');
    try {
      await api('/senha/solicitar-redefinicao', { method: 'POST', body: JSON.stringify({ usuario: usuarioAlvoSenha }) });
      msg.className = 'status-msg success'; msg.textContent = 'Solicitação enviada. O administrador precisará aprovar a redefinição.';
      await atualizarContagemNotificacoes();
    } catch (error) { msg.className = 'status-msg error'; msg.textContent = error.message; }
  });

  async function atualizarContagemNotificacoes() {
    try {
      const notices = await api('/admin/notificacoes');
      const pending = notices.filter(n => n.status === 'pendente').length;
      const count = document.getElementById('notificationCount');
      count.textContent = String(pending); count.hidden = pending === 0;
      document.getElementById('tabNotificationCount').textContent = pending ? `(${pending})` : '';
      return notices;
    } catch (error) { console.error(error); return []; }
  }
  async function carregarNotificacoes() {
    const container = document.getElementById('notificationsList'); container.textContent = 'Carregando notificações...';
    try {
      const notices = await atualizarContagemNotificacoes();
      if (!notices.length) { container.innerHTML = '<p>Nenhuma notificação até o momento.</p>'; return; }
      container.innerHTML = notices.map(n => `<article class="notice"><strong>${escapeHTML(n.usuario)}</strong> — ${escapeHTML(n.nome || n.usuario)}<p>Solicitou redefinição de senha em ${new Date(n.dataHora).toLocaleString('pt-BR')}.</p><p>Status: <strong>${n.status === 'pendente' ? '⏳ Aguardando aprovação' : n.status === 'aprovada' ? '✅ Aprovada' : '❌ Recusada'}</strong></p>${n.status === 'pendente' ? `<div class="notice-actions"><button class="btn" data-notice-action="approve" data-id="${n.id}" data-user="${escapeHTML(n.usuario)}">Aprovar e definir senha</button><button class="btn danger" data-notice-action="reject" data-id="${n.id}">Recusar</button></div>` : ''}</article>`).join('');
    } catch (error) { container.textContent = error.message; }
  }
  document.getElementById('notificationsList').addEventListener('click', async event => {
    const button = event.target.closest('button[data-notice-action]'); if (!button) return;
    const id = button.dataset.id;
    try {
      let payload;
      if (button.dataset.noticeAction === 'approve') {
        const novaSenha = prompt(`Defina uma nova senha para ${button.dataset.user} (mínimo de 3 caracteres):`);
        if (novaSenha === null) return;
        if (novaSenha.length < 3 || novaSenha.length > 100) { alert('A senha deve ter entre 3 e 100 caracteres.'); return; }
        payload = { aprovar: true, novaSenha };
      } else {
        if (!confirm('Deseja recusar esta solicitação de redefinição de senha?')) return;
        payload = { aprovar: false };
      }
      await api(`/admin/notificacoes/${encodeURIComponent(id)}/decidir`, { method: 'POST', body: JSON.stringify(payload) });
      await carregarNotificacoes(); await carregarAdmin();
    } catch (error) { alert(error.message); }
  });

  document.getElementById('userForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('userMessage'); const submit = form.querySelector('button[type="submit"]');
    message.className = 'status-msg'; message.textContent = 'Criando usuário...'; submit.disabled = true;
    const payload = { nome: document.getElementById('novoNome').value.trim(), usuario: document.getElementById('novoUsuario').value.trim(), senha: document.getElementById('novaSenha').value, tipo: document.getElementById('novoTipo').value };
    try {
      const created = await api('/admin/usuarios', { method: 'POST', body: JSON.stringify(payload) });
      message.className = 'status-msg success'; message.textContent = `Usuário “${created.usuario}” criado com acesso à área ${roleNames[created.tipo]}.`;
      form.reset(); document.getElementById('novoTipo').value = 'medico'; await carregarUsuarios(); await carregarAdmin();
    } catch (error) { message.className = 'status-msg error'; message.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  carregarAdmin(); carregarUsuarios(); atualizarContagemNotificacoes(); setInterval(carregarAdmin, 10000); setInterval(atualizarContagemNotificacoes, 5000);
})();
