(() => {
  const user = JSON.parse(localStorage.getItem('sentinelaUser') || 'null');
  if (!user || user.tipo !== 'admin') { location.replace('/index.html'); return; }
  const headers = { 'Content-Type': 'application/json', 'X-Sentinela-User': user.usuario };
  const roleNames = { admin: 'Administrador', medico: 'Médico', triagem: 'Triagem', atendimento: 'Atendimento', farmacia: 'Farmácia' };
  document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === button));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${button.dataset.panel}`));
    if (button.dataset.panel === 'usuarios') carregarUsuarios();
  }));
  async function api(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
    return data;
  }
  async function carregarAdmin() {
    try {
      const resumo = await api('/admin/resumo');
      document.getElementById('cards').innerHTML = `<div class="card"><b>Pacientes</b><div class="num">${resumo.pacientes}</div></div><div class="card"><b>Triagens</b><div class="num">${resumo.triagens}</div></div><div class="card"><b>Consultas</b><div class="num">${resumo.consultas}</div></div><div class="card"><b>🟢 Verdes</b><div class="num">${resumo.risco.verde}</div></div><div class="card"><b>🟡 Amarelos</b><div class="num">${resumo.risco.amarelo}</div></div><div class="card"><b>🔴 Vermelhos</b><div class="num">${resumo.risco.vermelho}</div></div><div class="card"><b>Presentes</b><div class="num">${resumo.presentes}/${resumo.funcionarios}</div></div><div class="card"><b>Estoque baixo</b><div class="num">${resumo.estoqueBaixo}</div></div>`;
      const freq = await api('/admin/frequencia');
      document.getElementById('freq').innerHTML = freq.map(f => `<tr><td>${escapeHTML(f.nome)}</td><td>${escapeHTML(roleNames[f.tipo] || f.tipo)}</td><td>${f.registro?.horaEntrada || '—'}</td><td>${f.registro?.saida || '—'}</td><td>${f.registro ? '🟢 Presente' : '🔴 Ausente'}</td></tr>`).join('');
      const aud = await api('/admin/auditoria');
      document.getElementById('audit').innerHTML = aud.map(a => `<tr><td>${new Date(a.dataHora).toLocaleString('pt-BR')}</td><td>${escapeHTML(a.usuarioAcao)}</td><td>${escapeHTML(a.acao)}</td><td>${escapeHTML(a.alvo || '—')}</td></tr>`).join('') || '<tr><td colspan="4">Nenhum registro ainda.</td></tr>';
    } catch (error) { console.error(error); }
  }
  function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  async function carregarUsuarios() {
    const tbody = document.getElementById('usersList'); tbody.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';
    try {
      const users = await api('/admin/usuarios');
      tbody.innerHTML = users.map(u => `<tr><td>${escapeHTML(u.nome)}</td><td>${escapeHTML(u.usuario)}</td><td><span class="role-pill">${escapeHTML(roleNames[u.tipo] || u.tipo)}</span></td></tr>`).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="3">${escapeHTML(error.message)}</td></tr>`; }
  }
  document.getElementById('userForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget; // capture before await; currentTarget becomes null after dispatch
    const message = document.getElementById('userMessage'); const submit = form.querySelector('button[type="submit"]');
    message.className = 'status-msg'; message.textContent = 'Criando usuário...'; submit.disabled = true;
    const payload = { nome: document.getElementById('novoNome').value.trim(), usuario: document.getElementById('novoUsuario').value.trim(), senha: document.getElementById('novaSenha').value, tipo: document.getElementById('novoTipo').value };
    try {
      const created = await api('/admin/usuarios', { method: 'POST', body: JSON.stringify(payload) });
      message.className = 'status-msg success'; message.textContent = `Usuário “${created.usuario}” criado com acesso à área ${roleNames[created.tipo]}.`;
      form.reset(); document.getElementById('novoTipo').value = 'medico'; await carregarUsuarios();
    } catch (error) { message.className = 'status-msg error'; message.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  carregarAdmin(); carregarUsuarios(); setInterval(carregarAdmin, 10000);
})();
