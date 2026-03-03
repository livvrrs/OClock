# ☕ OClock - Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org/)

A professional full-stack solution for time-tracking and staff management, specifically tailored for cafes and restaurants. Featuring a sleek glassmorphism design and a robust PostgreSQL backend.

*Uma solução full-stack profissional para controle de ponto e gestão de pessoal, desenhada para cafés e restaurantes. Apresenta design glassmorphism moderno e um backend robusto em PostgreSQL.*

---

## 🛠️ Tech Stack | Tecnologias
* **Backend:** Node.js & Express.js
* **Database:** PostgreSQL (with `pg` pool connection)
* **Frontend:** HTML5, Tailwind CSS, FontAwesome
* **Environment:** Dotenv for secure credentials

---

## ✨ Key Features | Funcionalidades
- 🕒 **Real-time Clock-in/out:** Smart validation system that prevents unauthorized entries.
- 📊 **Admin Dashboard:** Full control over staff registration, performance metrics, and reporting.
- ⏳ **Automated Calculations:** Precise work duration tracking with PostgreSQL intervals.
- 🗄️ **Soft Delete System:** Inactive employees are archived to preserve historical data integrity.
- 🎨 **Modern UI:** Responsive interface with glassmorphism effects and intuitive feedback.

---

## 🚀 Getting Started | Como Começar

### 1. Database Setup | Configuração do Banco
Execute the SQL scripts located in the `/database` folder in your PostgreSQL instance:
1. `schema.sql` - To create the tables.
2. `seeds.sql` - To populate with test data.

### 2. Environment Variables | Variáveis de Ambiente
Rename `.env.example` to `.env` and fill in your local database credentials:
`
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=cafe_ponto
PORT=3001`


### 3. Installation | Instalação
`npm install`

### 4. Start the server | Inicie o servidor
`npm start`

---

# 📂 Project Structure | Estrutura
```text
├── database/         # SQL Scripts (Schema & Seeds)
├── routes/           # Express API Routes
├── .env.example      # Template for environment variables
├── admin.html        # Management Dashboard
├── index.html        # Employee Clock-in Station
└── server.js         # Entry point
```

# 👨‍🍳 Test Employees | Equipe de Teste
The project includes iconic staff members for testing:

- Remy (Chef de Cuisine)

# 📝 License | Licença
This project is MIT licensed.

Developed with ☕ by Lívia Oliveira
