CREATE DATABASE IF NOT EXISTS fraud2;
USE fraud2;

CREATE TABLE rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    alias VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE fuente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_fuente VARCHAR(100) NOT NULL,
    valor_fuente VARCHAR(255) NOT NULL
);

CREATE TABLE estado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipo_propiedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipo_fraude (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id CHAR(36) PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rol_id INT NOT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id) REFERENCES rol(id)
);

CREATE TABLE reporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    portada VARCHAR(255) NOT NULL,
    evidencia VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NULL DEFAULT NULL,
    zona VARCHAR(150) NULL DEFAULT NULL,
    contacto_ofertante VARCHAR(150) NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    usuario_id CHAR(36) NOT NULL,
    fuente_id INT NOT NULL,
    estado_id INT NOT NULL,
    tipo_propiedad_id INT NOT NULL,
    tipo_fraude_id INT NOT NULL,
    CONSTRAINT fk_reporte_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT fk_reporte_fuente
        FOREIGN KEY (fuente_id) REFERENCES fuente(id),
    CONSTRAINT fk_reporte_estado
        FOREIGN KEY (estado_id) REFERENCES estado(id),
    CONSTRAINT fk_reporte_tipo_propiedad
        FOREIGN KEY (tipo_propiedad_id) REFERENCES tipo_propiedad(id),
    CONSTRAINT fk_reporte_tipo_fraude
        FOREIGN KEY (tipo_fraude_id) REFERENCES tipo_fraude(id)
);

CREATE TABLE recovery_code (
    id CHAR(36) PRIMARY KEY,
    usuario_id CHAR(36) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    expira_en DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

INSERT INTO rol (id, nombre, alias) VALUES
(1, 'Usuario', 'user'),
(2, 'Administrador', 'admin'),
(3, 'Super Administrador', 'super_admin'),
(4, 'Administrador Pendiente', 'pending');

INSERT INTO fuente (tipo_fuente, valor_fuente) VALUES
('Plataforma', 'Airbnb'),
('Plataforma', 'Booking'),
('Plataforma', 'Vrbo'),
('Red social', 'Facebook Marketplace'),
('Red social', 'Instagram'),
('Mensajería', 'WhatsApp'),
('Otro', 'Recomendación personal');

INSERT INTO estado (nombre) VALUES
('En revisión'),
('Fraude confirmado'),
('No es fraude');


INSERT INTO tipo_propiedad (nombre) VALUES
('Departamento'),
('Casa completa'),
('Habitación privada'),
('Villa'),
('Cabaña'),
('Hotel');

INSERT INTO tipo_fraude (nombre) VALUES
('Propiedad inexistente'),
('Suplantación de anfitrión'),
('Cobro fuera de la plataforma'),
('Fotos falsas o engañosas'),
('Doble reservación'),
('Solicitud de depósito fraudulento');

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- USUARIOS DE PRUEBA
INSERT INTO usuario (
    id,
    correo,
    contrasena,
    salt,
    nombre,
    rol_id
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'usuario1@test.com',
    'TEST_PASSWORD',
    'TEST_SALT',
    'Usuario Prueba 1',
    1
),
(
    '22222222-2222-2222-2222-222222222222',
    'usuario2@test.com',
    'TEST_PASSWORD',
    'TEST_SALT',
    'Usuario Prueba 2',
    1
),
(
    '33333333-3333-3333-3333-333333333333',
    'admin@test.com',
    'TEST_PASSWORD',
    'TEST_SALT',
    'Administrador Prueba',
    2
),
(
    '44444444-4444-4444-4444-444444444444',
    'superadmin@test.com',
    'TEST_PASSWORD',
    'TEST_SALT',
    'Super Administrador Prueba',
    3
);

-- REPORTES DE PRUEBA
INSERT INTO reporte (
    nombre,
    descripcion,
    longitud,
    latitud,
    portada,
    evidencia,
    precio,
    zona,
    contacto_ofertante,
    usuario_id,
    fuente_id,
    estado_id,
    tipo_propiedad_id,
    tipo_fraude_id
) VALUES

-- Reporte 1
(
    'Departamento sospechoso en Airbnb',
    'El supuesto propietario solicita depósito fuera de Airbnb.',
    -99.133209,
    19.432608,
    'test_portada_1.jpg',
    'test_evidencia_1.jpg',
    8500.00,
    'Centro',
    '5551234567',
    '11111111-1111-1111-1111-111111111111',
    1,
    1,
    1,
    3
),

-- Reporte 2
(
    'Casa falsa en Booking',
    'El anuncio utiliza fotografías de otra propiedad.',
    -99.167664,
    19.427225,
    'test_portada_2.jpg',
    'test_evidencia_2.jpg',
    12000.00,
    'Roma Norte',
    '5559876543',
    '11111111-1111-1111-1111-111111111111',
    2,
    2,
    2,
    2
),

-- Reporte 3
(
    'Habitación inexistente',
    'El anuncio desapareció después de realizar el pago.',
    -99.180000,
    19.400000,
    'test_portada_3.jpg',
    'test_evidencia_3.jpg',
    5000.00,
    'Coyoacán',
    '5551112233',
    '22222222-2222-2222-2222-222222222222',
    1,
    3,
    3,
    1
),

-- Reporte 4
(
    'Villa con fotos engañosas',
    'Las fotografías del anuncio no corresponden con la propiedad.',
    -99.150000,
    19.450000,
    'test_portada_4.jpg',
    'test_evidencia_4.jpg',
    15000.00,
    'Polanco',
    '5554445566',
    '22222222-2222-2222-2222-222222222222',
    3,
    2,
    4,
    4
),

-- Reporte 5
(
    'Cabaña sospechosa en Facebook',
    'El vendedor solicita un depósito antes de mostrar la propiedad.',
    -99.120000,
    19.460000,
    'test_portada_5.jpg',
    'test_evidencia_5.jpg',
    3000.00,
    'Tlalpan',
    '5557778899',
    '11111111-1111-1111-1111-111111111111',
    4,
    1,
    5,
    5
),

-- Reporte 6
(
    'Departamento con doble reservación',
    'La misma propiedad aparece reservada para diferentes personas.',
    -99.140000,
    19.440000,
    'test_portada_6.jpg',
    'test_evidencia_6.jpg',
    9000.00,
    'Condesa',
    '5552223344',
    '22222222-2222-2222-2222-222222222222',
    1,
    3,
    1,
    5
);
