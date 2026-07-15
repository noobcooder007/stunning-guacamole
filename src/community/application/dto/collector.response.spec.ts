import 'reflect-metadata';
import { instanceToPlain } from 'class-transformer';
import { CollectorResponse } from './collector.response';

function makeDto(): CollectorResponse {
  return Object.assign(new CollectorResponse(), {
    id: 'collector-1',
    firstname: 'Juan',
    firstLastname: 'Pérez',
    nss: '12345678901',
    notes: 'Nota administrativa confidencial',
  });
}

describe('CollectorResponse', () => {
  it('no debería exponer notes para un rol sin grupo autorizado', () => {
    const plain = instanceToPlain(makeDto(), { groups: ['collector'] });

    expect(plain.notes).toBeUndefined();
    expect(plain.firstname).toBe('Juan');
  });

  it('debería exponer notes para el grupo owner', () => {
    const plain = instanceToPlain(makeDto(), { groups: ['owner'] });

    expect(plain.notes).toBe('Nota administrativa confidencial');
  });

  it('debería exponer notes para administrator y superadministrator', () => {
    expect(
      instanceToPlain(makeDto(), { groups: ['administrator'] }).notes,
    ).toBe('Nota administrativa confidencial');
    expect(
      instanceToPlain(makeDto(), { groups: ['superadministrator'] }).notes,
    ).toBe('Nota administrativa confidencial');
  });
});
