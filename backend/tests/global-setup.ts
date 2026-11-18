import {execSync} from 'node:child_process';

export default function globalSetup() {
  // recrée le schéma à partir de schema.prisma sur la base de test
  execSync('npx prisma db push --force-reset --skip-generate', {
    stdio: 'inherit',
    env: {...process.env, DATABASE_URL: 'postgresql://yogauser:yogapass@localhost:5446/yogastudio_test'},
  });
}
