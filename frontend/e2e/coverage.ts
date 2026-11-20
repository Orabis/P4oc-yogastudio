import {CoverageReportOptions, CoverageResults} from 'monocart-coverage-reports';

const minimum = 80;
const metrics = ['statements', 'branches', 'functions', 'lines'] as const;

export const coverageOptions: CoverageReportOptions = {
  name: 'Yoga Studio E2E Coverage',
  outputDir: './coverage/e2e',
  reports: ['console-summary', 'html', 'lcovonly'],
  entryFilter: (entry) => {
    const path = new URL(entry.url).pathname;
    return /^\/src\/.+\.tsx?$/.test(path) && path !== '/src/main.tsx';
  },
  sourcePath: (filePath, info) => info.url?.match(/\/(src\/.+)$/)?.[1] ?? filePath,
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
