// Ponto de entrada de compatibilidade. Mantém integrações antigas que iniciam api/index.js,
// mas reutiliza o mesmo aplicativo do backend para nunca servir uma versão antiga separada.
const app = require("../backend/server");

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor Sentinela rodando na porta ${PORT} (api/index.js)`);
  });
}

module.exports = app;
