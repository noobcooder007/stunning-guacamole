import { getOwnershipScope } from './ownership-scope.util';

describe('getOwnershipScope', () => {
  it('debería retornar beneficientId y collectorId undefined cuando el usuario no está vinculado', () => {
    expect(getOwnershipScope({ id: 'user-1', role: 'administrator' })).toEqual({
      beneficientId: undefined,
      collectorId: undefined,
    });
  });

  it('debería retornar beneficientId cuando el usuario está vinculado a un Beneficient', () => {
    expect(
      getOwnershipScope({ id: 'user-1', beneficientId: 'ben-1' }),
    ).toEqual({ beneficientId: 'ben-1', collectorId: undefined });
  });

  it('debería retornar collectorId cuando el usuario está vinculado a un Collector', () => {
    expect(
      getOwnershipScope({ id: 'user-1', collectorId: 'col-1' }),
    ).toEqual({ beneficientId: undefined, collectorId: 'col-1' });
  });

  it('debería manejar un user undefined sin lanzar', () => {
    expect(getOwnershipScope(undefined)).toEqual({
      beneficientId: undefined,
      collectorId: undefined,
    });
  });
});
