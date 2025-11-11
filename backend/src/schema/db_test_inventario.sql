-- ---
-- SCRIPT DE CREACIÓN CONSOLIDADO: MÓDULO GENERAL + MÓDULO DE INVENTARIO
-- BASE DE DATOS: db_veterinaria_v1
-- Nota: Se ha eliminado la cláusula ENGINE y COLLATE en la definición de las tablas para simplificar.
-- ---

-- 1. Deshabilitar la verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS=0;

-- 2. Crear la base de datos (si no existe) y usarla
CREATE DATABASE IF NOT EXISTS db_test_inventario;
USE db_test_inventario;

-- 3. TABLAS MAESTRAS DEL MÓDULO GENERAL

-- Tabla: ModuloGeneralAudit
DROP TABLE IF EXISTS ModuloGeneralAudit;
CREATE TABLE IF NOT EXISTS ModuloGeneralAudit (
    id_modulo_general_audit INT AUTO_INCREMENT PRIMARY KEY,
    nombre_modulo VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL, -- Reutilizacion de campo para otros modulos y evitar redudancias
    fecha_final DATE,           -- Puede ser NULL si aún sigue vigente, reutilizacion de campo para otros modulos
    responsable VARCHAR(255),
    descripcion TEXT,           -- Que especificamente guarda el modulo
    estado_modulo VARCHAR(50),  -- Opcional: Activo, Inactivo, Cerrado, etc.
    version VARCHAR(20),        -- Opcional (versionamiento??) Revisar porfa
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Reutilizacion de campo para otros modulos y evitar redudancias
);

-- Tabla: Gen_EstadoGeneral
DROP TABLE IF EXISTS Gen_EstadoGeneral;
CREATE TABLE IF NOT EXISTS Gen_EstadoGeneral (
    Gen_id_estado_general INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL,
    Gen_es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    Gen_descripcion TEXT,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_EstadoGeneral_nombre (Gen_nombre),
    INDEX idx_Gen_EstadoGeneral_activo (Gen_es_activo),
    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- 4. TABLAS DE CATÁLOGO GENERAL (Reutilizables por Inventario)

-- Tabla: Gen_UnidadMedida
-- Se toma la estructura de Gen_UnidadMedida del Módulo General
DROP TABLE IF EXISTS Gen_UnidadMedida;
CREATE TABLE IF NOT EXISTS Gen_UnidadMedida (
    Gen_id_unidad_medida INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_codigo VARCHAR(50) NOT NULL COMMENT 'Short code (ml, gr, un, etc.)',
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'Full name (milliliters, grams, units, etc.)',
    Gen_tipo_unidad VARCHAR(100) COMMENT 'volume, weight, count, etc.',
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_UnidadMedida_codigo (Gen_codigo),
    INDEX idx_Gen_UnidadMedida_tipo (Gen_tipo_unidad),
    INDEX idx_Gen_UnidadMedida_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_UnidadMedida_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_IVA
-- Se toma la estructura de Gen_IVA del Módulo General
DROP TABLE IF EXISTS Gen_IVA;
CREATE TABLE IF NOT EXISTS Gen_IVA (
    Gen_id_iva INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL,
    Gen_porcentaje DECIMAL(5,2) NOT NULL,
    Gen_fecha_vigencia_inicio DATE NOT NULL,
    Gen_fecha_vigencia_fin DATE,
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_Gen_IVA_fecha_vigencia (Gen_fecha_vigencia_inicio),
    INDEX idx_Gen_IVA_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_IVA_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_Gen_IVA_porcentaje_valido CHECK (Gen_porcentaje >= 0 AND Gen_porcentaje <= 100),

    CONSTRAINT chk_Gen_IVA_fechas_validas
	CHECK (Gen_fecha_vigencia_fin IS NULL OR Gen_fecha_vigencia_fin >= Gen_fecha_vigencia_inicio),

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- 5. OTRAS TABLAS DE CATÁLOGO GENERAL (No directamente relacionadas con Inventario, pero requeridas)

-- Tabla: Gen_Provincia
DROP TABLE IF EXISTS Gen_Provincia;
CREATE TABLE IF NOT EXISTS Gen_Provincia (
    Gen_id_provincia INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL,
    Gen_codigo_pais CHAR(2) DEFAULT 'EC' COMMENT 'ISO 3166-1 alpha-2 country code',
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_Provincia_nombre_pais (Gen_nombre, Gen_codigo_pais),
    INDEX idx_Gen_Provincia_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_Provincia_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_Ciudad
DROP TABLE IF EXISTS Gen_Ciudad;
CREATE TABLE IF NOT EXISTS Gen_Ciudad (
    Gen_id_ciudad INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL,
    Gen_id_provincia INT NOT NULL,
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_Ciudad_nombre_provincia (Gen_nombre, Gen_id_provincia),
    INDEX idx_Gen_Ciudad_provincia (Gen_id_provincia),
    INDEX idx_Gen_Ciudad_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_Ciudad_provincia FOREIGN KEY (Gen_id_provincia)
	REFERENCES Gen_Provincia(Gen_id_provincia) ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_Gen_Ciudad_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general)	ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_TipoDocumento
DROP TABLE IF EXISTS Gen_TipoDocumento;
CREATE TABLE IF NOT EXISTS Gen_TipoDocumento (
    Gen_id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_codigo VARCHAR(50) NOT NULL COMMENT 'Short code (e.g., CI, RUC, PASS)',
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'Full name (e.g., Cedula, RUC, Passport)',
    Gen_descripcion TEXT,
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_TipoDocumento_codigo (Gen_codigo),
    INDEX idx_Gen_TipoDocumento_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_TipoDocumento_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general)	ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_GeneroSexo
DROP TABLE IF EXISTS Gen_GeneroSexo;
CREATE TABLE IF NOT EXISTS Gen_GeneroSexo (
    Gen_id_genero_sexo INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'MALE, FEMALE, OTHER',
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_GeneroSexo_nombre (Gen_nombre),
    INDEX idx_Gen_GeneroSexo_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_GeneroSexo_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_Operadora
DROP TABLE IF EXISTS Gen_Operadora;
CREATE TABLE IF NOT EXISTS Gen_Operadora (
    Gen_id_operadora INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'CLARO, MOVISTAR, TUENTI, CNT',
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_Operadora_nombre (Gen_nombre),
    INDEX idx_Gen_Operadora_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_Operadora_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_EstadoCivil
DROP TABLE IF EXISTS Gen_EstadoCivil;
CREATE TABLE IF NOT EXISTS Gen_EstadoCivil (
    Gen_id_estado_civil INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'SINGLE, MARRIED, DIVORCED, WIDOWED',
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_EstadoCivil_nombre (Gen_nombre),
    INDEX idx_Gen_EstadoCivil_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_EstadoCivil_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_MetodoPago
DROP TABLE IF EXISTS Gen_MetodoPago;
CREATE TABLE IF NOT EXISTS Gen_MetodoPago (
    Gen_id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL COMMENT 'CASH, DEBIT_CARD, CREDIT_CARD, etc.',
    Gen_descripcion TEXT,
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_Gen_MetodoPago_nombre (Gen_nombre),
    INDEX idx_Gen_MetodoPago_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_MetodoPago_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- Tabla: Gen_Proveedores
DROP TABLE IF EXISTS Gen_Proveedores;
CREATE TABLE IF NOT EXISTS Gen_Proveedores (
    Gen_id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origen INT NOT NULL,
    Gen_nombre VARCHAR(255) NOT NULL,
    Gen_direccion TEXT,
    Gen_telefono VARCHAR(20),
    Gen_email VARCHAR(255),
    Gen_producto_servicio TEXT NOT NULL,
    Gen_id_estado_general INT NOT NULL,
    Gen_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_Gen_Proveedores_nombre (Gen_nombre),
    INDEX idx_Gen_Proveedores_estado (Gen_id_estado_general),

    CONSTRAINT fk_Gen_Proveedores_estado FOREIGN KEY (Gen_id_estado_general)
	REFERENCES Gen_EstadoGeneral(Gen_id_estado_general) ON DELETE RESTRICT ON UPDATE CASCADE,

    Foreign key (Gen_modulo_origen) References ModuloGeneralAudit(id_modulo_general_audit)
);

-- 6. TABLAS DEL MÓDULO DE INVENTARIO (ADAPTADAS) 💊

-- Tabla: Inv_TipoArticulo
-- Se mantiene como catálogo específico de Inventario
DROP TABLE IF EXISTS Inv_TipoArticulo;
CREATE TABLE IF NOT EXISTS Inv_TipoArticulo (
    id_Inv_TipoArticulo INT AUTO_INCREMENT PRIMARY KEY,
    Inv_Descripcion VARCHAR(50) NOT NULL UNIQUE -- (Venta, Consumo)
);

DROP TABLE IF EXISTS Inv_Articulo;
CREATE TABLE IF NOT EXISTS Inv_Articulo (
    id_Inv_Articulo INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origenFk INT NOT NULL, -- NUEVO: Clave foránea al ModuloGeneralAudit
    Inv_Nombre VARCHAR(255) NOT NULL UNIQUE,
    id_Inv_TipoArticuloFk INT NOT NULL,
    id_Gen_UnidadMedidaFk INT NOT NULL, -- Apunta a Gen_UnidadMedida.Gen_id_unidad_medida
    Inv_CantUnidadMedida INT NOT NULL DEFAULT 1,
    id_Gen_IVAFk INT NOT NULL, -- Apunta a Gen_IVA.Gen_id_iva
    Inv_PrecioUnitario DECIMAL(10, 2) NOT NULL,
    Inv_StockActual INT NOT NULL DEFAULT 0,
    Inv_Categoria VARCHAR(100), -- (Opcional)
    Inv_EsActivo BOOLEAN NOT NULL DEFAULT TRUE,

    FOREIGN KEY (Gen_modulo_origenFk) REFERENCES ModuloGeneralAudit (id_modulo_general_audit), -- RELACIÓN NUEVA
    FOREIGN KEY (id_Inv_TipoArticuloFk) REFERENCES Inv_TipoArticulo (id_Inv_TipoArticulo),
    FOREIGN KEY (id_Gen_UnidadMedidaFk) REFERENCES Gen_UnidadMedida (Gen_id_unidad_medida),
    FOREIGN KEY (id_Gen_IVAFk) REFERENCES Gen_IVA (Gen_id_iva)
);

-- Tabla: Inv_Movimiento (Se añade Gen_modulo_origenFk y se corrige la coma)
DROP TABLE IF EXISTS Inv_Movimiento;
CREATE TABLE IF NOT EXISTS Inv_Movimiento (
    id_Inv_Movimiento INT AUTO_INCREMENT PRIMARY KEY,
    Gen_modulo_origenFk INT NOT NULL, -- NUEVO: Clave foránea al ModuloGeneralAudit
    id_Inv_ArticuloFk INT NOT NULL,
    Inv_TipoMovimiento ENUM('Ingreso', 'Salida') NOT NULL,
    Inv_Cantidad INT NOT NULL,
    Inv_Fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha del movimiento
    Inv_EsActivo BOOLEAN NOT NULL DEFAULT TRUE, -- CORRECCIÓN: Se agrega la coma faltante.

    FOREIGN KEY (Gen_modulo_origenFk) REFERENCES ModuloGeneralAudit (id_modulo_general_audit), -- RELACIÓN NUEVA
    FOREIGN KEY (id_Inv_ArticuloFk) REFERENCES Inv_Articulo (id_Inv_Articulo) ON DELETE RESTRICT
);

-- 7. Reactivar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS=1;