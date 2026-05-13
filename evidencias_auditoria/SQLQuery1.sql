-- 
USE [master]
GO
CREATE DATABASE [VINHOS_ARMAZENAGEM]
CONTAINMENT = NONE
ON PRIMARY
( NAME = N'VINHOS_ARMAZENAGEM', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\VINHOS_ARMAZENAGEM.mdf', SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
LOG ON
( NAME = N'VINHOS_ARMAZENAGEM_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\VINHOS_ARMAZENAGEM_log.ldf', SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO

-- Alterar configurações da Base de Dados
ALTER DATABASE [VINHOS_ARMAZENAGEM] SET COMPATIBILITY_LEVEL = 160
GO
ALTER DATABASE [VINHOS_ARMAZENAGEM] SET RECOVERY SIMPLE
GO

USE [VINHOS_ARMAZENAGEM]
GO

-- Tabela Dimensão: Localização
CREATE TABLE [dbo].[DimensaoLocalizacao](
    [IDLocalizacao] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [NomePais] NVARCHAR(100) NOT NULL,
    [NomeRegiao] NVARCHAR(100) NOT NULL
);
GO

-- Tabela Dimensão: Produto
CREATE TABLE [dbo].[DimensaoProduto](
    [IDProduto] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [NomeProduto] NVARCHAR(150) NOT NULL,
    [NomeProdutor] NVARCHAR(150) NOT NULL,
    [Classificacao] DECIMAL(3,2) NOT NULL,
    [Avaliacoes] INT NOT NULL
);
GO

-- Tabela Dimensão: Ano
CREATE TABLE [dbo].[DimensaoAno](
    [IDAno] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [AnoValor] INT NOT NULL
);
GO

-- Tabela Facto: Vendas
CREATE TABLE [dbo].[FatoVendas](
    [IDFato] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [IDLocalizacao] INT NOT NULL,
    [IDProduto] INT NOT NULL,
    [IDAno] INT NOT NULL,
    [PrecoVenda] DECIMAL(10,2) NOT NULL,
    FOREIGN KEY ([IDLocalizacao]) REFERENCES [dbo].[DimensaoLocalizacao]([IDLocalizacao]),
    FOREIGN KEY ([IDProduto]) REFERENCES [dbo].[DimensaoProduto]([IDProduto]),
    FOREIGN KEY ([IDAno]) REFERENCES [dbo].[DimensaoAno]([IDAno])
);
GO

-- Inserção de Dados: Localização
INSERT INTO [dbo].[DimensaoLocalizacao] (NomePais, NomeRegiao)
VALUES 
('França', 'Bordéus'),
('Itália', 'Piemonte'),
('Espanha', 'Rioja');
GO

-- Inserção de Dados: Produto
INSERT INTO [dbo].[DimensaoProduto] (NomeProduto, NomeProdutor, Classificacao, Avaliacoes)
VALUES 
('Château Margaux 2015', 'Adega Margaux', 4.8, 200),
('Barolo Riserva 2016', 'Vinícolas Piemonte', 4.5, 150),
('Rioja Gran Reserva 2014', 'Mestres Rioja', 4.2, 120);
GO

-- Inserção de Dados: Ano
INSERT INTO [dbo].[DimensaoAno] (AnoValor)
VALUES (2015), (2016), (2014);
GO

-- Inserção de Dados: Facto (Vendas)
INSERT INTO [dbo].[FatoVendas] (IDLocalizacao, IDProduto, IDAno, PrecoVenda)
VALUES 
(1, 1, 1, 1500.00),
(2, 2, 2, 850.00),
(3, 3, 3, 450.00);
GO
