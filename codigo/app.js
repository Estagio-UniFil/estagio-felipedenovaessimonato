// ========== DEPENDÊNCIAS ==========
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const app = express();

// ========== CONFIGURAÇÕES ==========
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static('public'));


// ========== CONEXÃO COM POSTGRESQL ==========
const sequelize = new Sequelize('postgresql://postgres:fioYAlaMaeAKZjdUlYzFJwKHirRnCJHB@yamabiko.proxy.rlwy.net:16989/railway', {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
  

// ========== MODELO CLIENTE ==========
const Cliente = sequelize.define('Cliente', {
  nome: DataTypes.STRING,
  cpfCnpj: DataTypes.STRING,
  telefone: DataTypes.STRING,
  endereco: DataTypes.STRING,
  email: DataTypes.STRING
});

// ========== SYNC BANCO ==========
sequelize.sync();

// ========== ROTAS ==========
app.get('/', async (req, res) => {
    try {
      const clientes = await Cliente.findAll();
      console.log('Clientes encontrados:', clientes);
  
      let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
      let tabela = clientes.map(c => `
        <tr>
          <td>${c.nome}</td>
          <td>${c.cpfCnpj}</td>
          <td>${c.telefone}</td>
          <td>${c.endereco}</td>
          <td>${c.email}</td>
          <td>
            <form method="POST" action="/clientes/delete/${c.id}" style="display:inline-block;">
              <button>Excluir</button>
            </form>
            <button onclick="editarCliente('${c.id}', '${c.nome}', '${c.cpfCnpj}', '${c.telefone}', '${c.endereco}', '${c.email}')">
              Editar
            </button>
          </td>
        </tr>
      `).join('');
      
  
      html = html.replace('{{tabela_clientes}}', tabela);
      res.send(html);
    } catch (error) {
      console.error('Erro ao carregar a página principal:', error);
      res.status(500).send('Erro ao carregar a página');
    }
  });
  

  app.post('/clientes', async (req, res) => {
    const { id, nome, cpfCnpj, telefone, endereco, email } = req.body;
  
    if (id) {
      // Atualizar cliente existente
      await Cliente.update(
        { nome, cpfCnpj, telefone, endereco, email },
        { where: { id } }
      );
    } else {
      // Criar novo cliente
      await Cliente.create({ nome, cpfCnpj, telefone, endereco, email });
    }
  
    res.redirect('/');
  });
  

app.post('/clientes/delete/:id', async (req, res) => {
  await Cliente.destroy({ where: { id: req.params.id } });
  res.redirect('/');
});

// ========== SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${3000}`));
