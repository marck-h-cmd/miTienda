# Configuración de Webhooks de Mercado Pago en Local

## Problema
Los webhooks de Mercado Pago necesitan una URL pública, pero tu servidor local (`localhost:3000`) no es accesible desde internet. La solución es usar **ngrok** para crear un túnel seguro.

## Paso 1: Descargar ngrok

1. Ve a [https://ngrok.com/download](https://ngrok.com/download)
2. Descarga la versión para Windows
3. Extrae el archivo `ngrok.exe` en una carpeta accesible (ej: `C:\ngrok`)

## Paso 2: Registrate en ngrok (opcional pero recomendado)

1. Crea una cuenta en [https://ngrok.com/](https://ngrok.com/)
2. Obtén tu token de autenticación
3. En PowerShell, ejecuta:
   ```powershell
   ngrok config add-authtoken tu-token-aqui
   ```

## Paso 3: Crear el túnel a tu servidor local

Abre PowerShell y ejecuta:

```powershell
cd C:\ngrok
.\ngrok http 3000
```

Deberías ver algo como esto:
```
ngrok                                       (Ctrl+C to quit)

Session Status    online
Account           usuario@email.com (Plan: Free)
Version           3.0.0
Region            us-central
Latency           150ms
Web Interface     http://127.0.0.1:4040

Forwarding        https://abc123.ngrok.io -> http://localhost:3000
```

**Copia la URL**: `https://abc123.ngrok.io` (será diferente cada vez)

## Paso 4: Actualizar el .env

En tu archivo `.env`, actualiza:

```env
# Antes
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Después
API_URL=https://abc123.ngrok.io  # Usa la URL que ngrok te dio
FRONTEND_URL=http://localhost:5173  # Frontend sigue siendo local
```

## Paso 5: Configurar el webhook en Mercado Pago

1. Ve a [https://www.mercadopago.com/mla/account/webhooks](https://www.mercadopago.com/mla/account/webhooks)
   - O: Dashboard → Configuración → Webhooks
2. Agrega una nueva URL:
   - **URL de Webhook**: `https://abc123.ngrok.io/api/v1/webhooks/mercadopago`
   - **Eventos**: Selecciona `payment` (pagos)
3. Guarda

## Paso 6: Verifica que funciona

1. Mantén ngrok corriendo
2. Inicia tu servidor backend:
   ```powershell
   cd backend
   npm run dev
   ```
3. Ve a tu frontend y completa un pago de prueba
4. Deberías ver los webhooks en la consola de ngrok (http://127.0.0.1:4040)

## Consideraciones importantes

- **La URL de ngrok cambia cada vez** que la reinicies (versión gratis)
- Tendrás que actualizar el webhook en Mercado Pago cada vez
- **Para producción**, compra un plan de ngrok con URL fija, o usa un servicio como Vercel/Heroku

## Tokens de Prueba de Mercado Pago

Ya están configurados en tu `.env`:
- **Access Token (TEST)**: `TEST-5823287249899821-072321-9830df440f8a026b8028ba83a0164e18-2575605029` ✓
- **Client ID**: `2584150402` ✓

Para probar pagos, usa las tarjetas de prueba:
- **Tarjeta válida**: 4111111111111111, exp: 11/25, CVC: 123
- **Tarjeta rechazada**: 4000000000000002

## Troubleshooting

### El webhook no llega
- Verifica que ngrok esté corriendo
- Comprueba la URL en Mercado Pago (debe terminar en `/api/v1/webhooks/mercadopago`)
- Revisa los logs en http://127.0.0.1:4040

### Error 404 en el webhook
- La ruta podría ser incorrecta en tu código
- Verifica en `backend/src/routes/webhook.routes.ts`

### Error 500 en el webhook
- Revisa los logs del servidor backend
- Asegúrate que la base de datos esté corriendo
- Verifica que Prisma esté sincronizado: `npm run db:sync`
