const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// Localiza a pasta do frontend (seja no mesmo nível, na pasta pública ou no diretório pai)
let frontendPath = path.join(__dirname, "../frontend");
if (!fs.existsSync(frontendPath)) {
  frontendPath = fs.existsSync(path.join(__dirname, "public"))
    ? path.join(__dirname, "public")
    : path.join(__dirname, "../");
}

app.use(express.static(frontendPath));

// Servidor serve o arquivo index.html na rota raiz
app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send("API do Sistema Hospitalar está rodando!");
  }
});

// Banco de dados em memória (Evita o erro 500 de escrita no Render)
const db = {
  usuarios: [
    { usuario: "admin", senha: "123", area: "atendimento" },
    { usuario: "triagem", senha: "123", area: "triagem" },
    { usuario: "medico", senha: "123", area: "medico" }
  ],
  pacientes: [],
  triagens: [],
  consultas: [],
  tv_chamada: null,
  tv_historico: []
};

// LOGIN
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  const user = db.usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (!user) {
    return res.status(401).json({ erro: "Login ou senha inválidos" });
  }

  res.json(user);
});

// ATENDIMENTO - Cadastrar paciente
app.post("/atendimento", (req, res) => {
  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);
  res.json(paciente);
});

// LISTAR PACIENTES
app.get("/pacientes", (req, res) => {
  res.json(db.pacientes);
});

// TRIAGEM
app.post("/triagem", (req, res) => {
  try {
    const { pacienteId, nome, sintoma, temperatura, alergia, observacao } = req.body;

    let risco = req.body.risco;
    if (temperatura >= 39) {
      risco = "vermelho";
    } else if (temperatura >= 38) {
      risco = "amarelo";
    } else if (!risco) {
      risco = "verde";
    }

    // Atualiza status do paciente para sair da fila da triagem e ir para a do médico
    if (pacienteId) {
      const paciente = db.pacientes.find(p => p.id === Number(pacienteId) || p.id === pacienteId);
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
    console.error("Erro no processamento da triagem:", error);
    res.status(500).json({ erro: "Erro ao processar triagem no servidor." });
  }
});

// LISTAR TRIAGENS
app.get("/triagens", (req, res) => {
  res.json(db.triagens);
});

// ============ MÍDIA INDOOR - TV ============

app.post("/tv/chamar", (req, res) => {
  const chamada = {
    id: Date.now().toString(),
    localTipo: req.body.localTipo,
    localNumero: req.body.localNumero,
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  };

  db.tv_chamada = chamada;
  db.tv_historico.unshift(chamada);
  if (db.tv_historico.length > 5) db.tv_historico.pop();

  res.json(chamada);
});

app.get("/tv/chamada", (req, res) => {
  res.json({
    chamada: db.tv_chamada,
    historico: db.tv_historico
  });
});

// LISTA DE MEDICAÇÕES
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

// CONSULTA
app.post("/consulta", (req, res) => {
  const consulta = {
    id: Date.now(),
    paciente: req.body.paciente,
    diagnostico: req.body.diagnostico,
    medicacao: req.body.medicacao,
    obs: req.body.obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);
  res.json(consulta);
});

// MEDICAÇÕES
app.get("/medicacoes", (req, res) => {
  res.json(db.consultas);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
