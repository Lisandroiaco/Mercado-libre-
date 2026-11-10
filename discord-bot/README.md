# 🤖 Bot de Discord todo en uno

Bot propio, modular y en español, hecho con [discord.js](https://discord.js.org) v14.
Cada comando es un archivo en `src/commands/`: para agregar uno nuevo, copiás uno existente y listo.
El `/help` se arma solo.

## Qué trae (24 comandos)

| Categoría | Comandos |
|---|---|
| 🛠️ Utilidad | `/help` (con menú por categoría), `/ping` |
| 📌 Información | `/userinfo`, `/serverinfo`, `/avatar` |
| 💰 Economía | `/balance`, `/daily`, `/work`, `/pay`, `/apostar` |
| ⭐ Niveles | `/rank`, `/top` — se gana XP chateando, y monedas al subir de nivel |
| 🛡️ Moderación | `/clear`, `/kick`, `/ban`, `/timeout`, `/warn dar/ver/borrar` |
| 🎮 Diversión | `/8ball`, `/moneda`, `/dado`, `/ppt` (con botones) |
| 🎉 Comunidad | `/encuesta` (botones con barras en vivo), `/sorteo` (botón para participar), `/confesar` (anónimo) |

Además: mensaje de bienvenida automático para nuevos miembros.
Los datos (monedas, niveles, advertencias, encuestas, sorteos) se guardan en `data/db.json`
y sobreviven a reinicios.

## Cómo ponerlo en marcha

1. **Creá la aplicación** en <https://discord.com/developers/applications> → *New Application*.
2. En **Bot**: tocá *Reset Token* y copiá el token. Más abajo activá **Server Members Intent**.
3. En **General Information** copiá el **Application ID**.
4. **Invitá el bot** a tu servidor: en *OAuth2 → URL Generator* marcá `bot` y `applications.commands`,
   y en permisos `Administrator` (o los que quieras). Abrí el link generado.
5. En esta carpeta:
   ```bash
   cp .env.example .env     # y completá DISCORD_TOKEN, CLIENT_ID y GUILD_ID
   npm install
   npm run deploy           # registra los comandos (repetir cuando agregues/cambies comandos)
   npm start
   ```

> 💡 Con `GUILD_ID` (ID de tu servidor: clic derecho → *Copiar ID*, con el modo desarrollador activado)
> los comandos aparecen al instante. Sin él se registran globalmente y pueden tardar hasta 1 hora.

## Estructura

```
src/
  index.js            arranca el bot y carga todo
  deploy-commands.js  registra los slash commands
  config.js           lee el .env
  db.js               base de datos en JSON
  utils.js            helpers (embeds, aleatorios, XP)
  moderation.js       chequeos de permisos para moderación
  commands/           un archivo por comando
  events/             bienvenidas, niveles, botones, etc.
```

Los botones y menús usan `customId` con el formato `comando:arg1:arg2`, y el comando los
maneja en su función `components()`.
