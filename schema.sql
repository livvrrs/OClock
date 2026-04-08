-- FILE: schema.sql
-- DESCRIPTION: Database structure for the O'Clock system.

-- 1. EMPLOYEES TABLE
-- Stores profile data and employment status
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL, 
    cargo VARCHAR(50),
    senha VARCHAR(20), -- Added to support the login logic we implemented
    ativo BOOLEAN DEFAULT true 
);

-- 2. TIME CLOCK RECORDS
-- Stores all entry, exit, and break timestamps
CREATE TABLE registros_ponto (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
    entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inicio_intervalo TIMESTAMP, -- Support for Lunch Break start
    fim_intervalo TIMESTAMP,    -- Support for Lunch Break end
    saida TIMESTAMP
);
