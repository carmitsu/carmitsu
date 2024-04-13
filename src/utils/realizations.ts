'use server';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readdir = promisify(fs.readdir);

export async function getRealizations(): Promise<string[]>{
  const realizationsDir = path.join(process.cwd(), 'public/realizations');
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg'];

  try {
    let files = await readdir(realizationsDir);
    files = files.filter(file => imageExtensions.includes(path.extname(file)));

    // Get file creation times and sort files by it
    files.sort((a, b) => {
      const timeA = fs.statSync(path.join(realizationsDir, a)).birthtime.getTime();
      const timeB = fs.statSync(path.join(realizationsDir, b)).birthtime.getTime();
      return timeB - timeA; // sort in descending order
    });

    return files.map(file => `/realizations/${file}`);
  } catch (err) {
    console.error('Could not list the directory.', err);
    return [];
  }
}