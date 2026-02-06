import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginUserDto } from './login.dto';

describe('LoginUserDto', () => {
  it('should create an instance', () => {
    const dto = new LoginUserDto();
    expect(dto).toBeDefined();
  });

  it('should validate with valid params', async () => {
    const input = {
      username: 'testuser',
      password: 'testpassword',
    };
    const dto = plainToInstance(LoginUserDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.username).toBe('testuser');
    expect(dto.password).toBe('testpassword');
  });

  it('should not validate with invalid username length', async () => {
    const input = {
      username: '007',
      password: 'testpassword',
    };
    const dto = plainToInstance(LoginUserDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should not validate with invalid password length', async () => {
    const input = {
      username: 'testuser',
      password: 'pwd',
    };
    const dto = plainToInstance(LoginUserDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
