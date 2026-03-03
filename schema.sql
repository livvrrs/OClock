-- TABELA DE FUNCIONÁRIOS | EMPLOYEES TABLE
-- Stores profile data and status (active/inactive)
-- Armazena dados do perfil e status (ativo/inativo)
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, -- Unique constraint to avoid duplicates | Evita e-mails duplicados
    cargo VARCHAR(50),
    ativo BOOLEAN DEFAULT true -- Soft delete strategy | Estratégia de Soft Delete
);

-- TABELA DE REGISTROS DE PONTO | TIME CLOCK RECORDS
-- Foreign Key relationship with 'funcionarios'
-- Relacionamento de Chave Estrangeira com 'funcionarios'
CREATE TABLE registros_ponto (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
    entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    saida TIMESTAMP
);