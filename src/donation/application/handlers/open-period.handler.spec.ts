import { OpenPeriodHandler } from './open-period.handler';
import { OpenPeriodCommand } from '@/donation/application/command/open-period.command';
import { ErrorType } from '@/shared/domain/dto/result.dto';

const USER_ID = '01907c2a-0000-7000-8000-000000000001';
const PERIOD_ID = '01907c2a-0000-7000-8000-000000000002';

function makePeriod(month: number, year: number) {
  return {
    month,
    year,
    _id: { unpack: () => PERIOD_ID },
    status: 'OPEN' as const,
    createdAt: new Date('2026-01-01'),
    createdBy: { unpack: () => USER_ID },
  };
}

function makeHandler(
  overrides: {
    findOpen?: jest.Mock;
    findLastClosed?: jest.Mock;
  } = {},
) {
  const repo = {
    findOpen: overrides.findOpen ?? jest.fn().mockResolvedValue(null),
    findLastClosed:
      overrides.findLastClosed ?? jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(undefined),
  };
  return { handler: new OpenPeriodHandler(repo as any), repo };
}

describe('OpenPeriodHandler', () => {
  it('debería fallar con CONFLICT si ya hay un periodo abierto', async () => {
    const { handler } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(makePeriod(5, 2026)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.CONFLICT);
  });

  it('debería fallar con NOT_FOUND si no hay periodo cerrado anterior', async () => {
    const { handler } = makeHandler({
      findOpen: jest.fn().mockResolvedValue(null),
      findLastClosed: jest.fn().mockResolvedValue(null),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(false);
    expect(result.error.type).toBe(ErrorType.NOT_FOUND);
  });

  it('debería abrir el mes siguiente al último periodo cerrado', async () => {
    const { handler, repo } = makeHandler({
      findLastClosed: jest.fn().mockResolvedValue(makePeriod(5, 2026)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(true);
    expect(result.value.month).toBe(6);
    expect(result.value.year).toBe(2026);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('debería pasar a enero del año siguiente cuando el último periodo fue diciembre', async () => {
    const { handler } = makeHandler({
      findLastClosed: jest.fn().mockResolvedValue(makePeriod(12, 2025)),
    });

    const result = await handler.execute(new OpenPeriodCommand(USER_ID));

    expect(result.isSuccess).toBe(true);
    expect(result.value.month).toBe(1);
    expect(result.value.year).toBe(2026);
  });
});
