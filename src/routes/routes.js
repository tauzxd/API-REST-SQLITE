import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rateLimit from "../middleware/rateLimit.js"
import path from "path";
import { Router } from "express";
import { readdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const routeFolders = ['login', 'private', 'public'];

async function recursiveArchivesImport(folder, format) {
  const listDirectories = [];
  async function searchDirectories(search) {
    const folderPath = path.resolve(`${__dirname}/${search}`);

    const allFiles = readdirSync(folderPath, { withFileTypes: true });
    allFiles.forEach(async (file) => {

      if (file.isDirectory()) {
        searchDirectories(`${folderPath}/${file.name}`);
        return;
      }
      const { default: archive } = await import(`./${search}/${file.name}`)
      if (!file.name.endsWith(format)) return;

      try {
        if (archive.method && archive.route) {
          if (archive.authMiddleware) {
            if (archive.permissions?.length > 0) {
              return await router[archive.method](archive.route,
                authMiddleware,
                (req, res, next) => { permissionMiddleware(req, res, next, archive.permissions) },
                rateLimit,
                archive.run)
            }
            return await router[archive.method](archive.route,
              authMiddleware,
              rateLimit,
              archive.run)
          }
          return await router[archive.method](archive.route,
            rateLimit,
            archive.run)
        }
      } catch (e) {
        console.error(e)
      }
    });
  }
  await searchDirectories(folder);

  return listDirectories;
}
routeFolders.forEach(async (folder) => await recursiveArchivesImport(folder, '.route.js'));

export default router;