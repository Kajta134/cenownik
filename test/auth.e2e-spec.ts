import { INestApplication } from '@nestjs/common';
import { Seeder } from './seed.test-database.js';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto.js';
import { LoginDto } from '../src/auth/dto/login.dto.js';
import { App } from 'supertest/types.js';
import { RegisterDto } from '../src/auth/dto/register.dto.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('auth e2e tests', () => {
  let app: INestApplication;
  const seeder = new Seeder();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await seeder.seedTestDatabase();
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.$disconnect();
    await app.close();
  });

  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should login with correct credentials', async () => {
    const response = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    expect(response.body.token).toBeDefined();
    expect(response.body).toMatchObject({
      token: response.body.token,
      email: seeder.regularUser.email,
      name: seeder.regularUser.name,
      role: seeder.regularUser.role,
      discordActivationLink: response.body.discordActivationLink,
    });
  });
  it('should not login with incorrect credentials', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: 'wrongpassword',
      } as LoginDto)
      .expect(401);
  });

  it('should register a new user', async () => {
    const newUser = {
      email: 'example@email.com',
      name: 'Example User',
      password: 'examplepassword',
    } as RegisterDto;
    const response = (await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send(newUser)
      .expect(201)) as { body: { email: string } };
    expect(response.body).toMatchObject({
      email: newUser.email,
    });
  });

  it('should not register a user with existing email', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({
        email: seeder.regularUser.email,
        name: 'Another User',
        password: 'anotherpassword',
      } as RegisterDto)
      .expect(409);
  });
});
