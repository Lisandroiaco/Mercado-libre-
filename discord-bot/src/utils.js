import { EmbedBuilder } from 'discord.js';
import { config } from './config.js';

export const embed = () => new EmbedBuilder().setColor(config.embedColor);

export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function formatDuration(ms) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h && `${h}h`, m && `${m}m`, !h && sec && `${sec}s`].filter(Boolean).join(' ') || '0s';
}

// XP necesaria para pasar del nivel `level` al siguiente
export const xpForLevel = (level) => 5 * level ** 2 + 50 * level + 100;

export const coin = '🪙';
