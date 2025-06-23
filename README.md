# Zitouna - E-commerce de Produtos Naturais 

![Status](https://img.shields.io/badge/status-ativo-brightgreen)

Bem-vindo ao repositório do projeto Zitouna, uma plataforma de e-commerce completa e funcional dedicada à venda de produtos naturais de alta qualidade, como Amlou, óleos de argan e oliva, e açafrão.

Este projeto foi desenvolvido a partir de uma interface estática, transformando-a em uma aplicação web dinâmica com um backend robusto em Node.js e um painel de administração para gerenciamento de pedidos.

---

## ✨ Recursos Principais

- **Catálogo de Produtos Dinâmico:** Os produtos são carregados a partir de uma API interna, permitindo fácil atualização e gerenciamento.
- **Carrinho de Compras Funcional:** Os usuários podem adicionar produtos, ajustar quantidades e visualizar o carrinho, com dados persistidos no navegador.
- **Sistema de Checkout:** Um fluxo de checkout completo que coleta as informações do cliente e envia o pedido para o servidor.
- **Painel de Administração Protegido:** Uma área administrativa (`/admin`) segura com autenticação de usuário e senha.
- **Gerenciamento de Pedidos:** O administrador pode visualizar todos os pedidos recebidos e gerenciar seus status (Pendente, Entregue, Cancelado) ou excluí-los.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)

- **Backend:**
  - Node.js
  - Express.js

- **Banco de Dados:**
  - Arquivos JSON para simular um banco de dados de produtos e pedidos.

---

## 🚀 Como Começar

Siga as instruções abaixo para executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 14 ou superior)
- [Git](https://git-scm.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/yLuck-Python/Zitouna-backned.git
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd Zitouna-backned
    ```

3.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

### Executando a Aplicação

1.  **Inicie o servidor:**
    ```bash
    npm start
    ```
2.  O servidor estará rodando em `http://localhost:3000`. Abra este endereço no seu navegador.

---

## 🔑 Painel de Administração

Para acessar a área de gerenciamento de pedidos:

1.  Navegue para `http://localhost:3000/admin`.
2.  O navegador solicitará as credenciais. Utilize as seguintes:

    - **Usuário:** `admin`
    - **Senha:** `zitouna123`

---