import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@/auth/application/dto/create-user.dto';
import { validate } from 'class-validator';

describe('CreateUserDto', () => {
  it('should create an instance', () => {
    const dto = new CreateUserDto();
    expect(dto).toBeDefined();
  });

  it('should validate with valid params', async () => {
    const input = {
      username: 'testuser',
      password: 'testpassword',
      role: 'testrole',
    };
    const dto = plainToInstance(CreateUserDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.username).toBe('testuser');
    expect(dto.password).toBe('testpassword');
    expect(dto.role).toBe('testrole');
  });
});
