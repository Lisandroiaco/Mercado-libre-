// Base de datos simple en un archivo JSON (data/db.json).
// Sin instalar nada extra; suficiente para servidores chicos y medianos.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const file = path.join(dir, 'db.json');

const data = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
data.guilds ??= {};
data.polls ??= {};
data.giveaways ??= {};

function writeNow() {
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
  renameSync(`${file}.tmp`, file);
}

let timer = null;
export function save() {
  clearTimeout(timer);
  timer = setTimeout(writeNow, 1000);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    clearTimeout(timer);
    writeNow();
    process.exit(0);
  });
}

export function getGuild(guildId) {
  const g = (data.guilds[guildId] ??= {});
  g.users ??= {};
  g.warns ??= {};
  return g;
}

export function getUser(guildId, userId) {
  const u = (getGuild(guildId).users[userId] ??= {});
  u.coins ??= 0;
  u.xp ??= 0;
  u.level ??= 0;
  u.lastDaily ??= 0;
  u.lastWork ??= 0;
  u.lastXp ??= 0;
  return u;
}

export const polls = data.polls;
export const giveaways = data.giveaways;
