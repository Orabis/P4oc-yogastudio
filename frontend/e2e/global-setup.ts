import {execSync} from 'node:child_process';
import {MCR} from 'monocart-coverage-reports';
import {coverageOptions} from './coverage';
import {E2E_DATABASE_URL} from './environment';

export default async function globalSetup() {
  const options = {cwd: '../backend', stdio: 'inherit', env: {...process.env, DATABASE_URL: E2E_DATABASE_URL}} as const;
  execSync('npx prisma db push --force-reset --skip-generate', options);
  execSync('npm run prisma:seed', options);

  MCR(coverageOptions).cleanCache();
}
