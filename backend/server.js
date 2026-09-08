const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(express.json());
app.use(cors());

let frontendPath = path.join(__dirname, "../frontend");
if (!fs.existsSync(frontendPath)) {
  frontendPath = fs.existsSync(path.join(__dirname, "public"))
    ? path.join(__dirname, "public")
    : path.join(__dirname, "../");
}

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send("API do Sistema Hospitalar está rodando!");
  }
});

// Banco de dados em memória
const db = {
  usuarios: [
    { usuario: "admin", senha: "123", tipo: "atendimento" },
    { usuario: "atendimento", senha: "123", tipo: "atendimento" },
    { usuario: "triagem", senha: "123", tipo: "triagem" },
    { usuario: "medico", senha: "123", tipo: "medico" }
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
    return res.status(401).json({ erro: "Usuário ou senha inválidos." });
  }

  res.json({ usuario: user.usuario, tipo: user.tipo });
});

// ATENDIMENTO
app.post("/atendimento", (req, res) => {
  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    dataNascimento: req.body.dataNascimento,
    idade: req.body.idade,
    responsavel: req.body.responsavel,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);
  res.json(paciente);
});

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

    if (pacienteId) {
      const paciente = db.pacientes.find(p => String(p.id) === String(pacienteId));
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
    res.status(500).json({ erro: "Erro ao processar triagem." });
  }
});

app.get("/triagens", (req, res) => {
  res.json(db.triagens);
});

// TV - CHAMADAS
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

app.get("/lista-medicacoes", (req, res) => {
  res.json([
    "Dipirona", "Paracetamol", "Ibuprofeno", "Amoxicilina",
    "Azitromicina", "Loratadina", "Omeprazol", "Buscopan", "Dramin", "Soro fisiológico"
  ]);
});

// CONSULTA
app.post("/consulta", (req, res) => {
  const { triagemId, paciente, diagnostico, medicacao, obs } = req.body;

  if (triagemId) {
    const triagem = db.triagens.find(t => String(t.id) === String(triagemId));
    if (triagem) {
      triagem.status = "finalizado";
    }
  }

  const consulta = {
    id: Date.now(),
    triagemId,
    paciente,
    diagnostico,
    medicacao,
    obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);
  res.json(consulta);
});

app.get("/medicacoes", (req, res) => {
  res.json(db.consultas);
});

// GERAR PDF DA ALTA
app.post("/gerar-pdf-alta", (req, res) => {
  const { paciente, sintoma, temperatura, alergia, diagnostico, medicacao, obs } = req.body;
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    body { font-family: Arial, sans-serif; color: #2d3748; margin: 0; padding: 0; font-size: 10.5pt; line-height: 1.5; }
    .header { border-bottom: 2px solid #2b6cb0; padding-bottom: 12px; margin-bottom: 20px; }
    .hospital-title { font-size: 18pt; font-weight: bold; color: #1a365d; margin: 0; }
    .doc-title { text-align: center; background-color: #ebf8ff; border: 1px solid #cbd5e1; color: #2b6cb0; padding: 10px; font-size: 14pt; font-weight: bold; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .info-table td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10pt; }
    .info-table .label { font-weight: bold; background-color: #f8fafc; color: #4a5568; width: 25%; }
    .box-content { border: 1px solid #e2e8f0; padding: 12px; font-size: 10pt; min-height: 50px; }
    .signature-area { margin-top: 50px; text-align: center; }
    .signature-line { width: 250px; border-top: 1px solid #4a5568; margin: 0 auto 8px auto; }
  </style>
  </head>
  <body>
    <div class="header">
      <div class="hospital-title">🏥 Hospital Sentinela</div>
      <div>Data: ${dataAtual}</div>
    </div>
    <div class="doc-title">Termo de Alta Médica</div>
    <table class="info-table">
      <tr><td class="label">Paciente:</td><td><strong>${paciente || "Não informado"}</strong></td></tr>
      <tr><td class="label">Sintoma:</td><td>${sintoma || "—"}</td></tr>
      <tr><td class="label">Temperatura:</td><td>${temperatura ? temperatura + " °C" : "—"}</td></tr>
      <tr><td class="label">Alergias:</td><td>${alergia || "Nenhuma"}</td></tr>
      <tr><td class="label">Diagnóstico:</td><td>${diagnostico || "—"}</td></tr>
      <tr><td class="label">Medicação:</td><td>${medicacao || "—"}</td></tr>
    </table>
    <div class="box-content"><strong>Observações:</strong><br>${obs ? obs.replace(/\n/g, "<br>") : "Paciente liberado."}</div>
    <div class="signature-area">
      <div class="signature-line"></div>
      <div>Dr. Médico Responsável</div>
    </div>
  </body>
  </html>
  `;

  const htmlPath = path.join(__dirname, "temp_alta.html");
  const pdfPath = path.join(__dirname, "temp_alta.pdf");

  fs.writeFileSync(htmlPath, htmlContent, "utf-8");

  exec(`weasyprint "${htmlPath}" "${pdfPath}"`, (error) => {
    if (error) {
      return res.status(500).json({ erro: "Erro ao gerar PDF." });
    }
    res.sendFile(pdfPath, () => {
      if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
