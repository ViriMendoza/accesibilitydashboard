export const SAMPLE_PROJECTS = [
  {
    id: 'p-ecommerce',
    name: 'Tienda en línea',
    client: 'Cliente demo',
    target: 'AA',
    updatedAt: '2026-11-04',
    notes: 'Revisar carrusel del home y el flujo de checkout.',
    checks: {
      '1.1.1': 'fail', '1.3.1': 'pass', '1.4.3': 'fail', '1.4.1': 'pass', '2.1.1': 'pass',
      '2.4.7': 'fail', '2.4.2': 'pass', '3.1.1': 'pass', '3.3.2': 'pass', '3.3.1': 'fail',
      '4.1.2': 'pending', '1.2.2': 'na', '2.3.1': 'pass',
    },
    issues: {
      '1.1.1': { owner: 'Ana López', due: '2026-11-20' },
      '1.4.3': { owner: 'Carlos Ruiz', due: '2026-11-05' },
      '2.4.7': { owner: 'Ana López', due: '' },
    },
    history: [
      { date: '2025-09-15', score: 8, pass: 2, fail: 6, pending: 17 },
      { date: '2025-11-20', score: 12, pass: 3, fail: 6, pending: 16 },
      { date: '2026-01-22', score: 16, pass: 4, fail: 5, pending: 16 },
      { date: '2026-03-10', score: 20, pass: 5, fail: 5, pending: 15 },
      { date: '2026-06-18', score: 24, pass: 6, fail: 4, pending: 15 },
      { date: '2026-11-04', score: 28, pass: 7, fail: 4, pending: 14 },
    ],
  },
  {
    id: 'p-landing',
    name: 'Landing campaña',
    client: 'Cliente demo',
    target: 'AA',
    updatedAt: '2026-10-28',
    notes: '',
    checks: {
      '1.1.1': 'pass', '1.3.1': 'pass', '1.4.3': 'pass', '1.4.10': 'pass', '2.1.1': 'pass',
      '2.4.1': 'pass', '2.4.2': 'pass', '2.4.7': 'pass', '3.1.1': 'pass', '1.2.2': 'fail',
      '2.5.8': 'fail', '4.1.2': 'pass', '3.3.8': 'na', '3.3.1': 'na', '3.3.2': 'na',
    },
    issues: {
      '1.2.2': { owner: 'Equipo de video', due: '2026-12-01' },
    },
    history: [
      { date: '2026-03-05', score: 13, pass: 3, fail: 4, pending: 16 },
      { date: '2026-05-14', score: 26, pass: 6, fail: 3, pending: 14 },
      { date: '2026-08-02', score: 35, pass: 8, fail: 2, pending: 13 },
      { date: '2026-10-28', score: 43, pass: 10, fail: 2, pending: 11 },
    ],
  },
]
