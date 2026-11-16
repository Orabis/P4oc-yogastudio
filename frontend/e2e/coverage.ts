import {CoverageReportOptions, CoverageResults} from 'monocart-coverage-reports';

const minimum = 80;
const metrics = ['statements', 'branches', 'functions', 'lines'] as const;

export const coverageOptions: CoverageReportOptions = {
  name: 'Yoga Studio E2E Coverage',
  outputDir: './coverage/e2e',
  reports: ['console-summary', 'html', 'lcovonly'],
  entryFilter: (entry) => entry.url.includes('/src/'),
  sourceFilter: (sourcePath) => sourcePath.includes('src/') && !sourcePath.includes('main.tsx'),
  onEnd: (results?: CoverageResults) => {
    const failures = metrics
      .map((metric) => ({metric, pct: Number(results?.summary[metric]?.pct ?? 0)}))
      .filter(({pct}) => pct < minimum)
      .map(({metric, pct}) => `${metric}: ${pct}% < ${minimum}%`);
    if (failures.length) {
      throw new Error(`E2E coverage below threshold\n${failures.join('\n')}`);
    }
  },
};
