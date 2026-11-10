import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

// Carga todos los archivos .js de una carpeta (commands/ o events/)
export async function loadModules(folder) {
  const dir = path.join(here, folder);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js'));
  const modules = [];
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    modules.push(mod.default);
  }
  return modules;
}
