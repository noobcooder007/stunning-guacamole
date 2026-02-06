import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RefreshSessionDto } from './refresh-session.dto';

describe('RefreshSession', () => {
  it('should create an instance', () => {
    const dto = new RefreshSessionDto();
    expect(dto).toBeDefined();
  });

  it('should not validate with invalid params', async () => {
    const input = {
      sessionId: 'testsessionid',
    };
    const dto = plainToInstance(RefreshSessionDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('sessionId');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
