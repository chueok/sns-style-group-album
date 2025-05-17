import { join } from 'path';
import { makeDummyDB } from './make-dummy-db';
import { access } from 'fs/promises';

const rootPath = join(__dirname, '..', '..', '..');
const entitiesPath = join(rootPath, 'src', '**', '*.entity.{ts,js}');
const dbPath = join(rootPath, 'db', 'dummy.sqlite');
const nums = {
  numUser: 10,
  numDeletedUser: 2,
  numGroup: 3,
  numContent: 200,
  numComment: 1000,
  numLike: 1000,
};

void (async () => {
  if (await checkFileExists(dbPath)) {
    console.log(`🟢 The file already exists: ${dbPath}`);
    return;
  }
  console.log(`🟡 Creating a dummy database: ${dbPath}`);
  await makeDummyDB(entitiesPath, dbPath, nums);
})();

async function checkFileExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
