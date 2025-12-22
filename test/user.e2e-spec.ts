import { INestApplication } from '@nestjs/common';
import { Seeder } from './seed.test-database.js';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto.js';
import { User } from 'src/generated/prisma/client.js';
import { LoginDto } from 'src/auth/dto/login.dto.js';
import { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('User e2e tests', () => {
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

  it('should return all users for admin', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.adminUser.email,
        password: seeder.adminUser.password,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const adminToken = loginResponse.body.token;
    const result = (await request(app.getHttpServer() as App)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)) as { body: User[] };
    expect(result.body.length).toBe(2);
  });

  it('should not return all users for regular user', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.regularUser.password,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    await request(app.getHttpServer() as App)
      .get('/user')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should return user by id for admin', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post(`/auth/login`)
      .send({
        email: seeder.adminUser.email,
        password: seeder.adminUser.password,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const adminToken = loginResponse.body.token;
    const result = (await request(app.getHttpServer() as App)
      .get(`/user/${seeder.regularUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)) as { body: User };
    expect(result.body.email).toBe(seeder.regularUser.email);
  });

  it('should return own user by id for regular user', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post(`/auth/login`)
      .send({
        email: seeder.regularUser.email,
        password: seeder.regularUser.password,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    const result = (await request(app.getHttpServer() as App)
      .get(`/user/${seeder.regularUser.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)) as { body: User };
    expect(result.body.email).toBe(seeder.regularUser.email);
  });
  it('should not return other user by id for regular user', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post(`/auth/login`)
      .send({
        email: seeder.regularUser.email,
        password: seeder.regularUser.password,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    await request(app.getHttpServer() as App)
      .get(`/user/${seeder.adminUser.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(401);
  });
});
