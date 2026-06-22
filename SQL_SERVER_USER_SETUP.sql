-- Script de Criação de Usuário SQL Server (Segurança Recomendada)
-- Execute como admin do SQL Server

-- ============================================
-- CRIAR USUÁRIO COM PERMISSÕES MÍNIMAS
-- ============================================

-- 1. Criar Login (conexão ao servidor)
CREATE LOGIN [app_precos] WITH PASSWORD = 'SenhaForte123!@#'
GO

-- 2. Criar Usuário no banco de dados
USE [seu_banco_aqui]
GO
CREATE USER [app_precos] FOR LOGIN [app_precos]
GO

-- 3. Conceder permissões SELECT apenas nas tabelas necessárias
-- Produtos
GRANT SELECT ON dbo.E02 TO [app_precos]
GRANT SELECT ON dbo.E23 TO [app_precos]
GRANT SELECT ON dbo.E29 TO [app_precos]

-- Clientes
GRANT SELECT ON dbo.A00 TO [app_precos]
GRANT SELECT ON dbo.A14 TO [app_precos]
GRANT SELECT ON dbo.A02 TO [app_precos]
GRANT SELECT ON dbo.A16 TO [app_precos]
GO

-- ============================================
-- TESTAR CONEXÃO COM NOVO USUÁRIO
-- ============================================

-- Fazer login com o novo usuário e executar:
-- SELECT * FROM dbo.E02
-- SELECT * FROM dbo.A00

-- ============================================
-- LIMPAR (se necessário)
-- ============================================
-- DROP USER [app_precos]
-- DROP LOGIN [app_precos]
