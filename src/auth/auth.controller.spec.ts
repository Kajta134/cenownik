import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('signIn', () => {
    it('should call authService.signIn with correct parameters and return response', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'secret' };
      const loginResponse = {
        accessToken: 'token',
        email: dto.email,
      } as unknown as LoginResponseDto;
      authService.signIn.mockResolvedValue(loginResponse);

      const result = await controller.signIn(dto);

      const signInSpy = jest.spyOn(authService, 'signIn');
      expect(signInSpy).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(loginResponse);
    });
  });

  describe('register', () => {
    it('should call authService.register with correct parameters and return response', async () => {
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'secret',
        name: 'User',
      };
      const registerResponse = { email: dto.email };
      authService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(dto);

      const registerSpy = jest.spyOn(authService, 'register');
      expect(registerSpy).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.name,
      );
      expect(result).toEqual(registerResponse);
    });

    it('should respond with CREATED status on register decorator', () => {
      const metadata = Reflect.getMetadata(
        'path',
        Reflect.get(AuthController.prototype, 'register'),
      ) as string;
      const httpCode = Reflect.getMetadata(
        '__httpCode__',
        Reflect.get(AuthController.prototype, 'register'),
      ) as string;
      expect(metadata).toBe('register');
      expect(httpCode).toBe(HttpStatus.CREATED);
    });
  });
});
