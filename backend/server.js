const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();

app.use(express.json());
app.use(cors());

// ======================================================
// CONFIGURAÇÃO DOS CAMINHOS ESTÁTICOS
// ======================================================

let frontendPath = path.join(__dirname, "../frontend");

if (!fs.existsSync(frontendPath)) {
  frontendPath = fs.existsSync(path.join(__dirname, "public"))
    ? path.join(__dirname, "public")
    : path.join(__dirname, "../");
}

app.use(express.static(frontendPath));

// ======================================================
// PÁGINA INICIAL
// ======================================================

app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send("API do Sistema Hospitalar está rodando!");
  }
});

// ======================================================
// BANCO DE DADOS EM MEMÓRIA
// ======================================================

const db = {
  usuarios: [
    {
      usuario: "admin",
      senha: "123",
      tipo: "admin",
      nome: "Administrador"
    },
    {
      usuario: "atendimento",
      senha: "123",
      tipo: "atendimento",
      nome: "Recepção"
    },
    {
      usuario: "triagem",
      senha: "123",
      tipo: "triagem",
      nome: "Enfermagem"
    },
    {
      usuario: "medico",
      senha: "123",
      tipo: "medico",
      nome: "Dr. Médico"
    },
    { usuario: "farmacia", senha: "123", tipo: "farmacia", nome: "Farmácia" },
    { usuario: "enfermeira2", senha: "123", tipo: "triagem", nome: "Enfermeira Ana" },
    { usuario: "medico2", senha: "123", tipo: "medico", nome: "Dr. Carlos" }
  ],

  pacientes: [],
  triagens: [],
  consultas: [],
  prescricoes: [],
  ponto: [],
  auditoria: [],
  movimentacoesEstoque: [],
  medicamentosEstoque: [
    { id: 1, nome: "Dipirona", quantidade: 120, minimo: 20, unidade: "comprimidos" },
    { id: 2, nome: "Paracetamol", quantidade: 80, minimo: 20, unidade: "comprimidos" },
    { id: 3, nome: "Ibuprofeno", quantidade: 50, minimo: 15, unidade: "comprimidos" },
    { id: 4, nome: "Amoxicilina", quantidade: 30, minimo: 10, unidade: "cápsulas" },
    { id: 5, nome: "Soro fisiológico", quantidade: 25, minimo: 5, unidade: "unidades" }
  ],
  tv_chamada: null,
  tv_historico: [],
  tv_conteudos: [
    { tipo: "dica", titulo: "Higienize as mãos", texto: "Lave as mãos com frequência e utilize álcool em gel quando necessário." },
    { tipo: "aviso", titulo: "Hospital Sentinela", texto: "Mantenha seus documentos e informações de saúde atualizados." },
    { tipo: "dica", titulo: "Atenção aos sinais", texto: "Em caso de piora importante dos sintomas, procure atendimento imediatamente." }
  ]
};

// ======================================================
// PERSISTÊNCIA DE USUÁRIOS CRIADOS PELO ADMIN
// ======================================================
const USERS_FILE = path.join(__dirname, "users.json");
try {
  if (fs.existsSync(USERS_FILE)) {
    const savedUsers = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    if (Array.isArray(savedUsers)) {
      // O arquivo é a lista completa, não apenas usuários extras: assim, usuários excluídos
      // não reaparecem depois que o servidor é reiniciado.
      db.usuarios = savedUsers;
    }
  }
} catch (error) {
  console.error("Não foi possível carregar usuários salvos:", error.message);
}
function salvarUsuarios() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(db.usuarios, null, 2), "utf8");
}

// Solicitações de redefinição de senha: persistidas entre reinicializações.
const PASSWORD_REQUESTS_FILE = path.join(__dirname, "password_requests.json");
let solicitacoesSenha = [];
try {
  if (fs.existsSync(PASSWORD_REQUESTS_FILE)) {
    const savedRequests = JSON.parse(fs.readFileSync(PASSWORD_REQUESTS_FILE, "utf8"));
    if (Array.isArray(savedRequests)) solicitacoesSenha = savedRequests;
  }
} catch (error) { console.error("Não foi possível carregar notificações:", error.message); }
function salvarSolicitacoesSenha() {
  fs.writeFileSync(PASSWORD_REQUESTS_FILE, JSON.stringify(solicitacoesSenha, null, 2), "utf8");
}

// ======================================================
// LOGIN
// ======================================================

app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  const user = db.usuarios.find(
    u =>
      u.usuario === usuario &&
      u.senha === senha
  );

  if (!user) {
    return res.status(401).json({
      erro: "Usuário ou senha inválidos."
    });
  }

  res.json({
    usuario: user.usuario,
    nome: user.nome || user.usuario,
    tipo: user.tipo
  });
});

// ======================================================
// ADMIN: GERENCIAMENTO DE USUÁRIOS
// ======================================================
function requisicaoAdmin(req) {
  const solicitante = String(req.headers["x-sentinela-user"] || "");
  return db.usuarios.some(u => u.usuario === solicitante && u.tipo === "admin");
}
app.get("/admin/usuarios", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode gerenciar usuários." });
  res.json(db.usuarios.map(({ usuario, nome, tipo }) => ({ usuario, nome: nome || usuario, tipo })));
});
app.post("/admin/usuarios", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode criar usuários." });
  const usuario = String(req.body.usuario || "").trim();
  const senha = String(req.body.senha || "");
  const nome = String(req.body.nome || usuario).trim();
  const tipo = String(req.body.tipo || "");
  const tiposPermitidos = ["triagem", "atendimento", "medico", "farmacia"];
  if (usuario.length < 3 || usuario.length > 40 || !/^[a-zA-Z0-9._-]+$/.test(usuario)) return res.status(400).json({ erro: "O login deve ter de 3 a 40 caracteres e usar apenas letras, números, ponto, hífen ou underline." });
  if (senha.length < 3 || senha.length > 100) return res.status(400).json({ erro: "A senha deve ter pelo menos 3 caracteres." });
  if (!tiposPermitidos.includes(tipo)) return res.status(400).json({ erro: "Selecione uma função válida." });
  if (db.usuarios.some(u => u.usuario.toLowerCase() === usuario.toLowerCase())) return res.status(409).json({ erro: "Já existe um usuário com esse login." });
  const novoUsuario = { usuario, senha, nome: nome || usuario, tipo };
  db.usuarios.push(novoUsuario);
  try { salvarUsuarios(); } catch (error) {
    db.usuarios.pop(); console.error("Erro ao salvar usuário:", error);
    return res.status(500).json({ erro: "Não foi possível salvar o usuário." });
  }
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: String(req.headers["x-sentinela-user"]), acao: `Criou usuário (${tipo})`, alvo: usuario, dataHora: new Date().toISOString() });
  res.status(201).json({ usuario, nome: novoUsuario.nome, tipo });
});

// Excluir usuário (não permite excluir contas administrativas nem a própria conta admin).
app.delete("/admin/usuarios/:usuario", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode excluir usuários." });
  const alvo = decodeURIComponent(req.params.usuario);
  const existente = db.usuarios.find(u => u.usuario.toLowerCase() === alvo.toLowerCase());
  if (!existente) return res.status(404).json({ erro: "Usuário não encontrado." });
  if (existente.tipo === "admin" || existente.usuario === String(req.headers["x-sentinela-user"] || "")) return res.status(400).json({ erro: "Por segurança, contas administrativas não podem ser excluídas por esta tela." });
  db.usuarios = db.usuarios.filter(u => u !== existente);
  try { salvarUsuarios(); } catch (error) { db.usuarios.push(existente); return res.status(500).json({ erro: "Não foi possível salvar a exclusão." }); }
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: String(req.headers["x-sentinela-user"]), acao: "Excluiu usuário", alvo: existente.usuario, dataHora: new Date().toISOString() });
  res.json({ sucesso: true });
});

// Alteração direta exige a senha atual do usuário selecionado.
app.post("/admin/usuarios/:usuario/senha", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode gerenciar senhas." });
  const alvo = db.usuarios.find(u => u.usuario.toLowerCase() === decodeURIComponent(req.params.usuario).toLowerCase());
  if (!alvo) return res.status(404).json({ erro: "Usuário não encontrado." });
  const senhaAntiga = String(req.body.senhaAntiga || "");
  const novaSenha = String(req.body.novaSenha || "");
  if (senhaAntiga !== alvo.senha) return res.status(401).json({ erro: "A senha antiga não confere. Se ela foi esquecida, envie uma solicitação para o administrador aprovar." });
  if (novaSenha.length < 3 || novaSenha.length > 100) return res.status(400).json({ erro: "A nova senha deve ter entre 3 e 100 caracteres." });
  const anterior = alvo.senha; alvo.senha = novaSenha;
  try { salvarUsuarios(); } catch (error) { alvo.senha = anterior; return res.status(500).json({ erro: "Não foi possível salvar a nova senha." }); }
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: String(req.headers["x-sentinela-user"]), acao: "Alterou senha de usuário", alvo: alvo.usuario, dataHora: new Date().toISOString() });
  res.json({ sucesso: true });
});

// Usuário autenticado na interface altera a própria senha informando a senha atual.
app.post("/senha/alterar", (req, res) => {
  const usuario = String(req.body.usuario || "").trim();
  const alvo = db.usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
  if (!alvo) return res.status(404).json({ erro: "Usuário não encontrado." });
  if (String(req.body.senhaAntiga || "") !== alvo.senha) return res.status(401).json({ erro: "Senha antiga incorreta. Se você a esqueceu, solicite redefinição ao administrador." });
  const novaSenha = String(req.body.novaSenha || "");
  if (novaSenha.length < 3 || novaSenha.length > 100) return res.status(400).json({ erro: "A nova senha deve ter entre 3 e 100 caracteres." });
  const anterior = alvo.senha; alvo.senha = novaSenha;
  try { salvarUsuarios(); } catch (error) { alvo.senha = anterior; return res.status(500).json({ erro: "Não foi possível salvar a nova senha." }); }
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: alvo.usuario, acao: "Alterou a própria senha", alvo: alvo.usuario, dataHora: new Date().toISOString() });
  res.json({ sucesso: true });
});

// Usuário que esqueceu a senha pode pedir redefinição; a mudança só ocorre após aprovação do admin.
app.post("/senha/solicitar-redefinicao", (req, res) => {
  const usuario = String(req.body.usuario || "").trim();
  const alvo = db.usuarios.find(u => u.usuario.toLowerCase() === usuario.toLowerCase());
  if (!alvo) return res.status(404).json({ erro: "Usuário não encontrado." });
  if (alvo.tipo === "admin") return res.status(400).json({ erro: "A redefinição de conta administrativa deve ser tratada diretamente pelo responsável pelo sistema." });
  if (solicitacoesSenha.some(n => n.usuario.toLowerCase() === alvo.usuario.toLowerCase() && n.status === "pendente")) return res.status(409).json({ erro: "Já existe uma solicitação pendente para este usuário." });
  const solicitacao = { id: Date.now(), usuario: alvo.usuario, nome: alvo.nome || alvo.usuario, tipo: alvo.tipo, status: "pendente", dataHora: new Date().toISOString() };
  solicitacoesSenha.unshift(solicitacao);
  try { salvarSolicitacoesSenha(); } catch (error) { solicitacoesSenha = solicitacoesSenha.filter(n => n.id !== solicitacao.id); return res.status(500).json({ erro: "Não foi possível enviar a notificação." }); }
  res.status(201).json({ sucesso: true, mensagem: "Solicitação enviada ao administrador." });
});
app.get("/admin/notificacoes", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode ver notificações." });
  res.json(solicitacoesSenha);
});
app.post("/admin/notificacoes/:id/decidir", (req, res) => {
  if (!requisicaoAdmin(req)) return res.status(403).json({ erro: "Apenas o administrador pode decidir solicitações." });
  const pedido = solicitacoesSenha.find(n => String(n.id) === String(req.params.id));
  if (!pedido || pedido.status !== "pendente") return res.status(404).json({ erro: "Solicitação pendente não encontrada." });
  const aprovar = req.body.aprovar === true;
  if (aprovar) {
    const novaSenha = String(req.body.novaSenha || "");
    if (novaSenha.length < 3 || novaSenha.length > 100) return res.status(400).json({ erro: "Informe uma nova senha de 3 a 100 caracteres." });
    const alvo = db.usuarios.find(u => u.usuario.toLowerCase() === pedido.usuario.toLowerCase());
    if (!alvo) return res.status(404).json({ erro: "Este usuário não existe mais." });
    const anterior = alvo.senha; alvo.senha = novaSenha;
    try { salvarUsuarios(); } catch (error) { alvo.senha = anterior; return res.status(500).json({ erro: "Não foi possível salvar a nova senha." }); }
    pedido.status = "aprovada"; pedido.decididaPor = String(req.headers["x-sentinela-user"]); pedido.decisaodataHora = new Date().toISOString();
    db.auditoria.unshift({ id: Date.now(), usuarioAcao: String(req.headers["x-sentinela-user"]), acao: "Aprovou redefinição de senha", alvo: pedido.usuario, dataHora: new Date().toISOString() });
  } else {
    pedido.status = "recusada"; pedido.decididaPor = String(req.headers["x-sentinela-user"]); pedido.decisaodataHora = new Date().toISOString();
  }
  try { salvarSolicitacoesSenha(); } catch (error) { return res.status(500).json({ erro: "A decisão foi aplicada, mas não foi possível salvar a notificação." }); }
  res.json({ sucesso: true, status: pedido.status });
});

// ======================================================
// ATENDIMENTO
// ======================================================

app.post("/atendimento", (req, res) => {
  try {
    const pacienteEmBranco =
      req.body.pacienteEmBranco === true;

    let nome;
    let cpf;
    let dataNascimento;
    let idade;
    let responsavel;
    let tipo;

    if (pacienteEmBranco) {
      const identificador = Date.now()
        .toString()
        .slice(-6);

      nome =
        `PACIENTE EMERGÊNCIA #${identificador}`;

      cpf = "";
      dataNascimento = "";
      idade = null;
      responsavel = "";
      tipo = req.body.tipo || "SUS";

    } else {
      nome = req.body.nome;
      cpf = req.body.cpf;
      dataNascimento = req.body.dataNascimento;
      idade = req.body.idade;
      responsavel = req.body.responsavel;
      tipo = req.body.tipo;
    }

    const paciente = {
      id: Date.now(),
      nome,
      cpf,
      dataNascimento,
      idade,
      sexo: req.body.sexo || "",
      estadoCivil: req.body.estadoCivil || "",
      responsavel,
      tipo,
      pacienteEmBranco,
      status: "triagem",
      createdAt: new Date()
    };

    db.pacientes.push(paciente);

    res.json(paciente);

  } catch (error) {
    console.error(
      "Erro ao cadastrar paciente:",
      error
    );

    res.status(500).json({
      erro: "Erro ao cadastrar paciente."
    });
  }
});

// ======================================================
// LISTAR PACIENTES
// ======================================================

app.get("/pacientes", (req, res) => {
  res.json(db.pacientes);
});

// ======================================================
// TRIAGEM
// ======================================================

app.post("/triagem", (req, res) => {
  try {
    const {
      pacienteId,
      nome,
      sintoma,
      temperatura,
      alergia,
      observacao
    } = req.body;

    let risco = req.body.risco;

    if (temperatura >= 39) {
      risco = "vermelho";
    } else if (temperatura >= 38) {
      risco = "amarelo";
    } else if (!risco) {
      risco = "verde";
    }

    if (pacienteId) {
      const paciente = db.pacientes.find(
        p =>
          String(p.id) ===
          String(pacienteId)
      );

      if (paciente) {
        paciente.status = "medico";
      }
    }

    const triagem = {
      id: Date.now(),
      pacienteId,
      nome,
      sintoma,
      temperatura,
      alergia,
      observacao,
      risco,
      status: "aguardando_medico",
      createdAt: new Date()
    };

    db.triagens.push(triagem);

    res.json(triagem);

  } catch (error) {
    console.error(
      "Erro na triagem:",
      error
    );

    res.status(500).json({
      erro: "Erro ao processar triagem."
    });
  }
});

// ======================================================
// LISTAR TRIAGENS
// ======================================================

app.get("/triagens", (req, res) => {
  res.json(db.triagens);
});

// ======================================================
// TV - CHAMADAS
// ======================================================

app.post("/tv/chamar", (req, res) => {
  const chamada = {
    id: Date.now().toString(),

    localTipo:
      req.body.localTipo,

    localNumero:
      req.body.localNumero,

    paciente:
      req.body.paciente,

    hora:
      new Date().toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )
  };

  db.tv_chamada = chamada;

  db.tv_historico.unshift(chamada);

  if (db.tv_historico.length > 5) {
    db.tv_historico.pop();
  }

  res.json(chamada);
});

app.get("/tv/chamada", (req, res) => {
  res.json({
    chamada: db.tv_chamada,
    historico: db.tv_historico
  });
});

// ======================================================
// LISTA DE MEDICAÇÕES
// ======================================================

app.get("/lista-medicacoes", (req, res) => {
  res.json([
    "Dipirona",
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Azitromicina",
    "Loratadina",
    "Omeprazol",
    "Buscopan",
    "Dramin",
    "Soro fisiológico"
  ]);
});

// ======================================================
// CONSULTA
// ======================================================

app.post("/consulta", (req, res) => {
  const {
    triagemId,
    paciente,
    diagnostico,
    medicacao,
    obs,
    medicoUsuario,
    medicoNome,
    pacienteId
  } = req.body;

  if (triagemId) {
    const triagem = db.triagens.find(
      t =>
        String(t.id) ===
        String(triagemId)
    );

    if (triagem) {
      triagem.status = "finalizado";
    }
  }

  const consulta = {
    id: Date.now(),
    triagemId,
    paciente,
    pacienteId: pacienteId || null,
    diagnostico,
    medicacao,
    obs,
    medicoUsuario: medicoUsuario || "medico",
    medicoNome: medicoNome || "Profissional não informado",
    createdAt: new Date()
  };

  db.consultas.push(consulta);
  if (medicacao) {
    db.prescricoes.push({ ...consulta, tipo: "prescricao" });
  }

  res.json(consulta);
});

// ======================================================
// LISTAR CONSULTAS
// ======================================================

app.get("/medicacoes", (req, res) => {
  res.json(db.consultas);
});

// ======================================================
// CONTROLE DE FREQUÊNCIA / PONTO
// ======================================================
function agoraISO() { return new Date().toISOString(); }
function horaBR(data = new Date()) { return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }

app.get("/ponto", (req, res) => {
  const usuario = String(req.query.usuario || "");
  const hoje = new Date().toISOString().slice(0, 10);
  const registro = db.ponto.find(p => p.usuario === usuario && p.data === hoje);
  res.json(registro || null);
});

app.post("/ponto/entrada", (req, res) => {
  const { usuario, nome, horaInformada } = req.body;
  if (!usuario) return res.status(400).json({ erro: "Usuário não informado." });
  const data = new Date().toISOString().slice(0, 10);
  let registro = db.ponto.find(p => p.usuario === usuario && p.data === data);
  if (!registro) {
    registro = { id: Date.now(), usuario, nome: nome || usuario, data, horaSistemaEntrada: horaBR(), horaEntrada: horaInformada || horaBR(), saida: null, status: "presente" };
    db.ponto.push(registro);
  }
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: usuario, acao: "Registrou entrada", alvo: usuario, dataHora: agoraISO() });
  res.json(registro);
});

app.post("/ponto/saida", (req, res) => {
  const { usuario } = req.body;
  const data = new Date().toISOString().slice(0, 10);
  const registro = db.ponto.find(p => p.usuario === usuario && p.data === data);
  if (!registro) return res.status(404).json({ erro: "Entrada não registrada." });
  if (!registro.saida) registro.saida = horaBR();
  db.auditoria.unshift({ id: Date.now(), usuarioAcao: usuario, acao: "Registrou saída", alvo: usuario, dataHora: agoraISO() });
  res.json(registro);
});

app.get("/admin/frequencia", (req, res) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const registros = db.usuarios.filter(u => u.tipo !== "admin").map(u => ({
    usuario: u.usuario, nome: u.nome || u.usuario, tipo: u.tipo,
    registro: db.ponto.find(p => p.usuario === u.usuario && p.data === hoje) || null
  }));
  res.json(registros);
});

app.get("/admin/auditoria", (req, res) => res.json(db.auditoria.slice(0, 100)));

// ======================================================
// HISTÓRICO DO PACIENTE
// ======================================================
app.get("/pacientes/:id/historico", (req, res) => {
  const id = String(req.params.id);
  const paciente = db.pacientes.find(p => String(p.id) === id);
  const triagens = db.triagens.filter(t => String(t.pacienteId) === id);
  const consultas = db.consultas.filter(c => String(c.pacienteId) === id);
  res.json({ paciente: paciente || null, triagens, consultas });
});

app.get("/historico-paciente", (req, res) => {
  const nome = String(req.query.nome || "").toLowerCase();
  const pacientes = db.pacientes.filter(p => String(p.nome || "").toLowerCase().includes(nome));
  res.json(pacientes.map(p => ({
    ...p,
    consultas: db.consultas.filter(c => String(c.pacienteId) === String(p.id) || String(c.paciente).toLowerCase() === String(p.nome).toLowerCase())
  })));
});

// ======================================================
// FARMÁCIA / ESTOQUE
// ======================================================
app.get("/farmacia/estoque", (req, res) => res.json(db.medicamentosEstoque));
app.get("/farmacia/movimentacoes", (req, res) => res.json(db.movimentacoesEstoque.slice(0, 100)));
app.get("/farmacia/alertas", (req, res) => res.json(db.medicamentosEstoque.filter(m => m.quantidade <= m.minimo)));

app.post("/farmacia/entrada", (req, res) => {
  const { medicamentoId, quantidade, usuario } = req.body;
  const med = db.medicamentosEstoque.find(m => String(m.id) === String(medicamentoId));
  if (!med || Number(quantidade) <= 0) return res.status(400).json({ erro: "Dados inválidos." });
  med.quantidade += Number(quantidade);
  const mov = { id: Date.now(), tipo: "entrada", medicamento: med.nome, quantidade: Number(quantidade), usuario: usuario || "farmacia", dataHora: agoraISO() };
  db.movimentacoesEstoque.unshift(mov);
  db.auditoria.unshift({ id: Date.now()+1, usuarioAcao: usuario || "farmacia", acao: `Entrada de ${quantidade} ${med.nome}`, alvo: med.nome, dataHora: agoraISO() });
  res.json(med);
});

app.post("/farmacia/saida", (req, res) => {
  const { medicamentoId, quantidade, usuario, paciente } = req.body;
  const med = db.medicamentosEstoque.find(m => String(m.id) === String(medicamentoId));
  if (!med || Number(quantidade) <= 0 || med.quantidade < Number(quantidade)) return res.status(400).json({ erro: "Estoque insuficiente ou dados inválidos." });
  med.quantidade -= Number(quantidade);
  const mov = { id: Date.now(), tipo: "saida", medicamento: med.nome, quantidade: Number(quantidade), paciente: paciente || "Não informado", usuario: usuario || "farmacia", dataHora: agoraISO() };
  db.movimentacoesEstoque.unshift(mov);
  db.auditoria.unshift({ id: Date.now()+1, usuarioAcao: usuario || "farmacia", acao: `Saída de ${quantidade} ${med.nome}`, alvo: paciente || med.nome, dataHora: agoraISO() });
  res.json(med);
});

app.post("/farmacia/ajuste", (req, res) => {
  const { medicamentoId, quantidade, usuario, motivo } = req.body;
  const med = db.medicamentosEstoque.find(m => String(m.id) === String(medicamentoId));
  if (!med || Number(quantidade) < 0) return res.status(400).json({ erro: "Dados inválidos." });
  const anterior = med.quantidade;
  med.quantidade = Number(quantidade);
  db.movimentacoesEstoque.unshift({ id: Date.now(), tipo: "ajuste", medicamento: med.nome, quantidade: Number(quantidade), quantidadeAnterior: anterior, motivo: motivo || "Correção de estoque", usuario: usuario || "farmacia", dataHora: agoraISO() });
  db.auditoria.unshift({ id: Date.now()+1, usuarioAcao: usuario || "farmacia", acao: `Ajustou estoque de ${med.nome}`, alvo: motivo || "Correção", dataHora: agoraISO() });
  res.json(med);
});

// ======================================================
// ADMIN / RESUMO
// ======================================================
app.get("/admin/resumo", (req, res) => {
  const risco = { verde: 0, amarelo: 0, vermelho: 0 };
  db.triagens.forEach(t => { if (risco[t.risco] !== undefined) risco[t.risco]++; });
  const hoje = new Date().toISOString().slice(0, 10);
  const pontosHoje = db.ponto.filter(p => p.data === hoje);
  res.json({ pacientes: db.pacientes.length, triagens: db.triagens.length, consultas: db.consultas.length, risco, presentes: pontosHoje.length, funcionarios: db.usuarios.filter(u => u.tipo !== "admin").length, estoqueBaixo: db.medicamentosEstoque.filter(m => m.quantidade <= m.minimo).length });
});

// ======================================================
// TV MULTIMÍDIA
// ======================================================
app.get("/tv/conteudo", (req, res) => res.json(db.tv_conteudos));

// ======================================================
// GERAR PDF DA ALTA MÉDICA
// ======================================================

app.post("/gerar-pdf-alta", (req, res) => {
  try {
    const {
      paciente,
      sintoma,
      temperatura,
      alergia,
      diagnostico,
      medicacao,
      obs,
      risco
    } = req.body;

    const agora = new Date();

    const dataAtual =
      agora.toLocaleDateString("pt-BR");

    const horaAtual =
      agora.toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
      info: {
        Title: "Termo de Alta Médica",
        Author: "Hospital Sentinela",
        Subject: "Alta Médica"
      }
    });

    const buffers = [];

    doc.on("data", buffer => {
      buffers.push(buffer);
    });

    doc.on("end", () => {
      const pdfData =
        Buffer.concat(buffers);

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Length",
        pdfData.length
      );

      res.setHeader(
        "Content-Disposition",
        "inline; filename=alta_medica.pdf"
      );

      res.status(200).send(pdfData);
    });

    // ==================================================
    // CORES
    // ==================================================

    const azulEscuro = "#1a365d";
    const azul = "#2b6cb0";
    const cinza = "#4a5568";
    const cinzaClaro = "#e2e8f0";
    const fundo = "#f7fafc";
    const vermelho = "#c53030";
    const amarelo = "#b7791f";
    const verde = "#2f855a";

    // ==================================================
    // FUNÇÃO AUXILIAR
    // ==================================================

    function valorTexto(
      valor,
      padrao = "Não informado"
    ) {
      if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
      ) {
        return padrao;
      }

      return String(valor);
    }

    // ==================================================
    // CABEÇALHO
    // ==================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(azulEscuro)
      .text(
        "HOSPITAL SENTINELA",
        45,
        45
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(cinza)
      .text(
        "Sistema de Gestão Hospitalar e Prontuário Eletrônico",
        45,
        70
      );

    doc
      .fontSize(9)
      .fillColor(cinza)
      .text(
        `Data: ${dataAtual} | Horário: ${horaAtual}`,
        350,
        55,
        {
          width: 200,
          align: "right"
        }
      );

    doc
      .moveTo(45, 95)
      .lineTo(550, 95)
      .strokeColor(azul)
      .lineWidth(2)
      .stroke();

    // ==================================================
    // TÍTULO
    // ==================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor(azul)
      .text(
        "TERMO DE ALTA MÉDICA",
        45,
        120,
        {
          width: 505,
          align: "center"
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(cinza)
      .text(
        "Documento referente ao atendimento médico realizado.",
        45,
        145,
        {
          width: 505,
          align: "center"
        }
      );

    // ==================================================
    // IDENTIFICAÇÃO DO PACIENTE
    // ==================================================

    let y = 175;

    doc
      .roundedRect(
        45,
        y,
        505,
        115,
        5
      )
      .fillAndStroke(
        fundo,
        cinzaClaro
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(azulEscuro)
      .text(
        "IDENTIFICAÇÃO DO PACIENTE",
        60,
        y + 15
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(cinza)
      .text(
        "Paciente:",
        60,
        y + 40
      );

    doc
      .font("Helvetica")
      .fillColor("#2d3748")
      .text(
        valorTexto(paciente),
        115,
        y + 40,
        {
          width: 410
        }
      );

    doc
      .font("Helvetica-Bold")
      .fillColor(cinza)
      .text(
        "Sintoma:",
        60,
        y + 62
      );

    doc
      .font("Helvetica")
      .fillColor("#2d3748")
      .text(
        valorTexto(sintoma),
        115,
        y + 62,
        {
          width: 410
        }
      );

    doc
      .font("Helvetica-Bold")
      .fillColor(cinza)
      .text(
        "Temperatura:",
        60,
        y + 84
      );

    doc
      .font("Helvetica")
      .fillColor("#2d3748")
      .text(
        temperatura !== undefined &&
        temperatura !== null &&
        String(temperatura).trim() !== ""
          ? `${temperatura} °C`
          : "Não informada",
        130,
        y + 84
      );

    doc
      .font("Helvetica-Bold")
      .fillColor(cinza)
      .text(
        "Alergias:",
        285,
        y + 84
      );

    const alergiaTexto =
      valorTexto(
        alergia,
        "Nenhuma informada"
      );

    if (
      alergia &&
      String(alergia).trim() !== "" &&
      String(alergia).toLowerCase() !== "nenhuma" &&
      String(alergia).toLowerCase() !== "não"
    ) {
      doc
        .font("Helvetica-Bold")
        .fillColor(vermelho)
        .text(
          alergiaTexto,
          335,
          y + 84,
          {
            width: 195
          }
        );
    } else {
      doc
        .font("Helvetica")
        .fillColor("#2d3748")
        .text(
          alergiaTexto,
          335,
          y + 84,
          {
            width: 195
          }
        );
    }

    // ==================================================
    // DIAGNÓSTICO E CONDUTA
    // ==================================================

    y += 135;

    doc
      .roundedRect(
        45,
        y,
        505,
        125,
        5
      )
      .fillAndStroke(
        "#ffffff",
        cinzaClaro
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(azulEscuro)
      .text(
        "DIAGNÓSTICO E CONDUTA MÉDICA",
        60,
        y + 15
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(cinza)
      .text(
        "Diagnóstico / Hipótese:",
        60,
        y + 42
      );

    doc
      .font("Helvetica")
      .fillColor("#2d3748")
      .text(
        valorTexto(diagnostico),
        60,
        y + 60,
        {
          width: 470
        }
      );

    doc
      .font("Helvetica-Bold")
      .fillColor(cinza)
      .text(
        "Medicação / Prescrição:",
        60,
        y + 84
      );

    doc
      .font("Helvetica")
      .fillColor("#2d3748")
      .text(
        valorTexto(
          medicacao,
          "Nenhuma"
        ),
        60,
        y + 102,
        {
          width: 470
        }
      );

    // ==================================================
    // CLASSIFICAÇÃO DE RISCO
    // ==================================================

    y += 145;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(azulEscuro)
      .text(
        "CLASSIFICAÇÃO DE RISCO",
        45,
        y
      );

    let riscoTexto =
      valorTexto(
        risco,
        "Não informado"
      );

    let riscoCor = cinza;

    if (
      String(risco).toLowerCase() ===
      "vermelho"
    ) {
      riscoTexto = "VERMELHO";
      riscoCor = vermelho;

    } else if (
      String(risco).toLowerCase() ===
      "amarelo"
    ) {
      riscoTexto = "AMARELO";
      riscoCor = amarelo;

    } else if (
      String(risco).toLowerCase() ===
      "verde"
    ) {
      riscoTexto = "VERDE";
      riscoCor = verde;
    }

    doc
      .roundedRect(
        45,
        y + 20,
        505,
        35,
        5
      )
      .fill("#f7fafc");

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(riscoCor)
      .text(
        riscoTexto,
        60,
        y + 32
      );

    // ==================================================
    // OBSERVAÇÕES
    // ==================================================

    y += 80;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(azulEscuro)
      .text(
        "OBSERVAÇÕES E ORIENTAÇÕES",
        45,
        y
      );

    y += 20;

    const observacoes =
      valorTexto(
        obs,
        "Nenhuma observação registrada."
      );

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#2d3748")
      .text(
        observacoes,
        45,
        y,
        {
          width: 505,
          align: "left",
          lineGap: 3
        }
      );

    // ==================================================
    // ASSINATURA
    // ==================================================

    const assinaturaY =
      Math.max(
        doc.y + 45,
        680
      );

    doc
      .moveTo(
        175,
        assinaturaY
      )
      .lineTo(
        420,
        assinaturaY
      )
      .strokeColor(cinza)
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(azulEscuro)
      .text(
        "Médico Responsável",
        175,
        assinaturaY + 7,
        {
          width: 245,
          align: "center"
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(cinza)
      .text(
        "CRM/UF 123456",
        175,
        assinaturaY + 24,
        {
          width: 245,
          align: "center"
        }
      );

    // ==================================================
    // RODAPÉ
    // ==================================================

    doc
      .moveTo(45, 770)
      .lineTo(550, 770)
      .strokeColor(cinzaClaro)
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#718096")
      .text(
        "Hospital Sentinela • Documento gerado pelo Sistema de Gestão Hospitalar",
        45,
        780,
        {
          width: 505,
          align: "center"
        }
      );

    doc.end();

  } catch (error) {

    console.error(
      "Erro interno no PDF:",
      error
    );

    res.status(500).json({
      erro: "Erro interno ao gerar PDF.",
      detalhes: error.message
    });
  }
});

// ======================================================
// SERVIDOR
// ======================================================

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  () => {
    console.log(
      `Servidor rodando na porta ${PORT}`
    );
  }
);
