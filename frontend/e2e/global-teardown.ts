import {MCR} from 'monocart-coverage-reports';
import {coverageOptions} from './coverage';

export default async function globalTeardown() {
  await MCR(coverageOptions).generate();
}
