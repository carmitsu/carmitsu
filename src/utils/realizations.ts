'use server';
import fs from 'fs';
import path from 'path';

export async function getRealizations(): Promise<RealizationsData[]> {
  const realizationsPath = path.join(process.cwd(), 'public/realizations/realizations.json');

  try {
    const data = fs.readFileSync(realizationsPath, 'utf-8');
    const realizationsData = JSON.parse(data);

    realizationsData.forEach((realization: { image: string }) => {
      realization.image = `/realizations/${realization.image}`;
    });
    realizationsData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return realizationsData;
  } catch (err) {
    console.error('Could not read the file.', err);
    return [];
  }
}

export interface RealizationsData {
  [key: string]: {
    date: string;
    title: string;
    description: string;
    image: string;
  };
}