CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;


-- ============================
-- MÓDULO: MÉDICOS VETERINARIOS
-- ============================

-- Tabla: veterinarios
CREATE TABLE IF NOT EXISTS  veterinarios (
  id_Veterinario INT AUTO_INCREMENT PRIMARY KEY,
  Vet_Nombres VARCHAR(100) NOT NULL,
  Vet_Apellidos VARCHAR(100) NOT NULL,
  Vet_Cedula VARCHAR(20) NOT NULL UNIQUE,
  Vet_Correo VARCHAR(100),
  Vet_Telefono VARCHAR(20),
  Vet_Direccion VARCHAR(150),
  Vet_FechaIngreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_modulo VARCHAR(50) DEFAULT 'medicos_veterinarios',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla: especialidades
CREATE TABLE IF NOT EXISTS  especialidades (
  id_Especialidad INT AUTO_INCREMENT PRIMARY KEY,
  Esp_Nombre VARCHAR(100) NOT NULL,
  Esp_Descripcion TEXT,
  id_modulo VARCHAR(50) DEFAULT 'medicos_veterinarios',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla: turnos
CREATE TABLE IF NOT EXISTS  turnos (
  id_Turno INT AUTO_INCREMENT PRIMARY KEY,
  id_Veterinario_FK INT,
  id_Especialidad_FK INT,
  Tur_Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Tur_HoraInicio TIME,
  Tur_HoraFin TIME,
  Tur_Estado ENUM('Disponible', 'Ocupado', 'Cancelado') DEFAULT 'Disponible',
  id_modulo VARCHAR(50) DEFAULT 'medicos_veterinarios',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_Veterinario_FK) REFERENCES veterinarios(id_Veterinario),
  FOREIGN KEY (id_Especialidad_FK) REFERENCES especialidades(id_Especialidad)
);
