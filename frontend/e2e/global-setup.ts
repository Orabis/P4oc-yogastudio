import {MCR} from 'monocart-coverage-reports';
import {coverageOptions} from './coverage';

export default async function globalSetup() {
  MCR(coverageOptions).cleanCache();
}
