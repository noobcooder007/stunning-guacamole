import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SeedDto } from '@/auth/application/dto/seed.dto';

describe('SeedDto', () => {
  it('should create an instance', () => {
    const dto = new SeedDto();
    expect(dto).toBeDefined();
  });

  it('should validate with valid params', async () => {
    const input = {
      username: 'testuser',
      password: 'testpassword',
    };
    const dto = plainToInstance(SeedDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should invalidate with invalid username', async () => {
    const input = {
      username: '007',
      password: 'testpassword',
    };
    const dto = plainToInstance(SeedDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should invalidate with invalid password', async () => {
    const input = {
      username: 'testuser',
      password: 'pwd',
    };
    const dto = plainToInstance(SeedDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
