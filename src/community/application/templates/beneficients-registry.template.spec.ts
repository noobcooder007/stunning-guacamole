import {
  beneficientsRegistryTemplate,
  BeneficientsRegistryPdfData,
} from './beneficients-registry.template';
import {
  beneficientsReportTemplate,
  BeneficientsReportPdfData,
} from './beneficients-report.template';

function makeRegistryItem(overrides: Partial<any> = {}) {
  return {
    beneficientNumber: 1,
    title: 'Sr.',
    firstname: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: null,
    birthday: new Date('1985-01-01'),
    genre: 'MALE',
    maritalStatus: 'Soltero',
    email: null,
    phoneNumber: '5512345678',
    street: 'Calle 1',
    noExt: '10',
    noInt: null,
    neighborhood: 'Centro',
    locality: null,
    city: 'CDMX',
    state: 'CDMX',
    zipCode: '06600',
    createdAt: new Date('2026-01-01'),
    reasonDeactivated: null,
    isActive: true,
    collectorNumber: 3,
    collectorFirstname: 'María',
    collectorFirstLastname: 'García',
    ...overrides,
  };
}

const registryData: BeneficientsRegistryPdfData = {
  items: [makeRegistryItem()],
  generatedAt: '2026-06-13',
  total: 1,
};

describe('beneficientsRegistryTemplate', () => {
  it('debería retornar un TDocumentDefinitions con content', () => {
    const doc = beneficientsRegistryTemplate(registryData);
    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();
  });

  it('debería manejar lista de items vacía', () => {
    const doc = beneficientsRegistryTemplate({ items: [], generatedAt: '2026-06-13', total: 0 });
    expect(doc).toBeDefined();
  });

  it('debería manejar beneficiario inactivo con reasonDeactivated', () => {
    const data: BeneficientsRegistryPdfData = {
      items: [makeRegistryItem({ isActive: false, reasonDeactivated: 'Baja' })],
      generatedAt: '2026-06-13',
      total: 1,
    };
    expect(() => beneficientsRegistryTemplate(data)).not.toThrow();
  });

  it('debería manejar fechas nulas (createdAt null)', () => {
    const data: BeneficientsRegistryPdfData = {
      items: [makeRegistryItem({ createdAt: null })],
      generatedAt: '2026-06-13',
      total: 1,
    };
    expect(() => beneficientsRegistryTemplate(data)).not.toThrow();
  });

  it('debería manejar campos opcionales ausentes (secondLastname, phoneNumber)', () => {
    const data: BeneficientsRegistryPdfData = {
      items: [makeRegistryItem({ secondLastname: null, phoneNumber: null, collectorNumber: null })],
      generatedAt: '2026-06-13',
      total: 1,
    };
    expect(() => beneficientsRegistryTemplate(data)).not.toThrow();
  });
});

function makeReportItem(overrides: Partial<any> = {}) {
  return {
    ...makeRegistryItem(overrides),
    deactivatedAt: null,
    donationCount: 5,
    donationTotal: 500,
    promiseAmount: 100,
    currency: 'MXN',
    recurrence: 1,
    recurring: true,
    promiseIsActive: true,
    ...overrides,
  };
}

describe('beneficientsReportTemplate', () => {
  it('debería retornar un TDocumentDefinitions con content', () => {
    const data: BeneficientsReportPdfData = {
      items: [makeReportItem()],
      generatedAt: '2026-06-13',
      total: 1,
    };
    const doc = beneficientsReportTemplate(data);
    expect(doc).toBeDefined();
    expect(doc.content).toBeDefined();
  });

  it('debería manejar lista de items vacía', () => {
    const doc = beneficientsReportTemplate({ items: [], generatedAt: '2026-06-13', total: 0 });
    expect(doc).toBeDefined();
  });

  it('debería manejar promiseAmount null y recurrencia no periódica', () => {
    const data: BeneficientsReportPdfData = {
      items: [makeReportItem({ promiseAmount: null, recurring: false })],
      generatedAt: '2026-06-13',
      total: 1,
    };
    expect(() => beneficientsReportTemplate(data)).not.toThrow();
  });
});
