const express = require('express');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Iniciar o servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados PostgreSQL usando a variável de ambiente DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Definir o modelo de cliente
const Cliente = sequelize.define('Cliente', {
  nome: DataTypes.STRING,
  cpfCnpj: DataTypes.STRING,
  telefone: DataTypes.STRING,
  endereco: DataTypes.STRING,
  email: DataTypes.STRING
});

// Sincronizar a tabela do cliente no banco
sequelize.sync()
  .then(() => {
    console.log("Tabela 'Clientes' criada com sucesso.");
  })
  .catch((err) => {
    console.error("Erro ao criar a tabela 'Clientes':", err);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Rota para exibir o formulário
app.get('/', async (req, res) => {
  try {
    // Buscar todos os clientes no banco
    const clientes = await Cliente.findAll();

    // Carregar o HTML
    let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

    // Gerar a tabela de clientes
    let tabela = clientes.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.cpfCnpj}</td>
        <td>${c.telefone}</td>
        <td>${c.endereco}</td>
        <td>${c.email}</td>
      </tr>
    `).join('');

    // Substituir o marcador {{tabela_clientes}} no HTML
    html = html.replace('{{tabela_clientes}}', tabela);

    // Enviar o HTML modificado como resposta
    res.send(html);
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
    res.status(500).send("Erro ao carregar clientes");
  }
});

// Rota para salvar o cliente no banco
app.post('/clientes', async (req, res) => {
  const { nome, cpfCnpj, telefone, endereco, email } = req.body;
  
  try {
    await Cliente.create({ nome, cpfCnpj, telefone, endereco, email });
    res.redirect('/'); // Redireciona de volta para a página principal
  } catch (err) {
    console.error("Erro ao salvar cliente:", err);
    res.status(500).send("Erro ao salvar cliente no banco.");
  }
});

// Iniciar o servidor na porta
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
