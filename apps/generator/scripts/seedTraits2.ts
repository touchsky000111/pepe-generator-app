import { db, init } from 'db';
import fs from 'fs/promises';
import path from 'path';
import "dotenv/config";


init();

const TRAITS_DIR = path.join(process.cwd(), 'public', 'images', 'traits');
const BASE_URL = 'http://localhost:3000/images/traits';

async function seedTraits() {
  const folders = await fs.readdir(TRAITS_DIR);

  for (const folder of folders) {
    console.log("template");
    const existing = await db
      .selectFrom('traits')
      .select('id')
      .where('folder', '=', folder)
      .executeTakeFirst();

    if (existing) {
      console.log(`Skipping already seeded folder: ${folder}`);
      if (folder !== "hands") {
        continue;
      }
    }

    const folderPath = path.join(TRAITS_DIR, folder);
    const files = await fs.readdir(folderPath);
    if (folder !== "hands") {
      const [trait] = await db
        .insertInto('traits')
        .values({ name: folder, folder })
        .returningAll()
        .execute();
    }

    for (const file of files) {
      const name = file.replace(/\.[^/.]+$/, '');
      const fileUrl = `${BASE_URL}/${folder}/${file}`;

      // const existing = await db
      //   .selectFrom('traitOptions')
      //   .select('id')
      //   .where('traitId', '=', 7)
      //   .where('file', '=', file)
      //   .executeTakeFirst();

      // if (existing) {
      //   console.log(`Skipping duplicate trait option: ${folder}/${file}`);
      //   continue;
      // }

      await db.insertInto('traitOptions').values({
        file,
        name,
        traitId: 7,
        // imageUrl: fileUrl,
      }).execute();
    }
  }

  console.log('Traits and options seeded!');
}

seedTraits().catch(console.error);
