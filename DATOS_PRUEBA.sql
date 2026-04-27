-- ========================================
-- DATOS DE PRUEBA PARA CHECKOUT
-- ========================================
-- Ejecuta estos comandos en tu BD PostgreSQL para agregar datos de prueba

-- 1. Obtener el ID del usuario de prueba (reemplaza con el tuyo)
-- Si necesitas crear uno:
INSERT INTO seg_usuarios (email, password_hash, nombre, apellido, telefono, activo)
VALUES ('test@ejemplo.com', '$2b$10$xyz...', 'Juan', 'Pérez', '987654321', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Obtener el ID del usuario que acabas de crear
SELECT id FROM seg_usuarios WHERE email = 'test@ejemplo.com';
-- Copia el ID para usarlo en los siguientes comandos

-- ========================================
-- AGREGAR DIRECCIONES DE ENVÍO
-- ========================================
-- Reemplaza 'USER_ID_AQUI' con el ID que copiaste arriba

INSERT INTO ord_direcciones_envio 
  (usuario_id, nombre, apellido, direccion, ciudad, departamento, codigo_postal, telefono, es_principal)
VALUES 
  ('USER_ID_AQUI', 'Juan', 'Pérez', 'Av. Principal 123, Apto 401', 'Lima', 'Lima', '15001', '987654321', true),
  ('USER_ID_AQUI', 'Juan', 'Pérez', 'Jr. Secundaria 456', 'Callao', 'Callao', '07001', '987654321', false);

-- Verificar que se insertaron
SELECT id, nombre, apellido, direccion, ciudad, es_principal 
FROM ord_direcciones_envio 
WHERE usuario_id = 'USER_ID_AQUI';

-- ========================================
-- VERIFICAR MÉTODOS DE ENVÍO
-- ========================================
-- Estos deberían existir desde el seed, pero verifica:

SELECT id, nombre, precio, tiempo_estimado FROM ord_metodos_envio;

-- Si no hay métodos, agrégalos:
INSERT INTO ord_metodos_envio (nombre, descripcion, precio, tiempo_estimado)
VALUES 
  ('Envío Estándar', 'Entrega en 3-5 días', 15.00, '3-5 días'),
  ('Envío Express', 'Entrega en 1-2 días', 25.00, '1-2 días'),
  ('Recojo en Tienda', 'Recojo del pedido en tienda', 0.00, 'Inmediato')
ON CONFLICT DO NOTHING;

-- ========================================
-- CREAR UN CARRITO CON ITEMS PARA PRUEBA
-- ========================================
-- Primero obtén un producto de prueba:
SELECT id FROM cat_productos LIMIT 1;

-- Luego obtén o crea un carrito:
INSERT INTO ord_carritos (usuario_id)
VALUES ('USER_ID_AQUI')
ON CONFLICT DO NOTHING;

-- Obtén el ID del carrito:
SELECT id FROM ord_carritos WHERE usuario_id = 'USER_ID_AQUI';

-- Agrega items al carrito (reemplaza CARRITO_ID y PRODUCTO_ID):
INSERT INTO ord_items_carrito (carrito_id, producto_id, cantidad, precio_unitario)
VALUES 
  ('CARRITO_ID', 'PRODUCTO_ID', 2, 99.99);

-- Verifica el carrito:
SELECT ic.id, ic.cantidad, p.nombre, ic.precio_unitario
FROM ord_items_carrito ic
JOIN cat_productos p ON ic.producto_id = p.id
WHERE ic.carrito_id = 'CARRITO_ID';

-- ========================================
-- VERIFICAR DATOS DE PRUEBA
-- ========================================

-- 1. Verificar usuario
SELECT id, email, nombre, apellido FROM seg_usuarios WHERE email = 'test@ejemplo.com';

-- 2. Verificar direcciones
SELECT id, nombre, apellido, direccion, ciudad, es_principal 
FROM ord_direcciones_envio 
WHERE usuario_id = 'USER_ID_AQUI';

-- 3. Verificar métodos de envío
SELECT id, nombre, precio, tiempo_estimado FROM ord_metodos_envio;

-- 4. Verificar carrito y items
SELECT * FROM ord_carritos WHERE usuario_id = 'USER_ID_AQUI';
SELECT * FROM ord_items_carrito WHERE carrito_id = 'CARRITO_ID';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 1. Reemplaza 'USER_ID_AQUI' con el UUID real del usuario
-- 2. Reemplaza 'CARRITO_ID' con el UUID real del carrito
-- 3. Reemplaza 'PRODUCTO_ID' con el UUID real de un producto
-- 4. Después de ejecutar estos comandos, deberías poder hacer checkout sin errores
-- 5. Para obtener un hash de contraseña válido, usa: bcrypt.hash('password', 10)
