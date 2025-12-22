import { INestApplication } from '@nestjs/common';
import { Seeder } from './seed.test-database.js';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { LoginResponseDto } from '../src/auth/dto/login-response.dto.js';
import { LoginDto } from '../src/auth/dto/login.dto.js';
import { App } from 'supertest/types.js';
import { CreateOfferDto } from '../src/offer/dto/create-offer.dto.js';
import { PRICE_SCRAPER } from '../src/price/price-scraping.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('offer e2e tests', () => {
  let app: INestApplication;
  const seeder = new Seeder();
  const returnNewPrice = 123.45;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PRICE_SCRAPER)
      .useValue([
        {
          canHandle: () => true,
          scrape: () => returnNewPrice,
        },
      ])

      .compile();
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

  it('should create a new offer', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    const newOffer: CreateOfferDto = {
      name: 'New Test Offer',
      priceFreshold: 150,
      link: 'https://example.com/product/1',
    };
    const createResponse = await request(app.getHttpServer() as App)
      .post('/offer')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newOffer)
      .expect(201);
    expect(createResponse.body).toMatchObject({
      name: newOffer.name,
      priceFreshold: newOffer.priceFreshold,
      link: newOffer.link,
      currentPrice: returnNewPrice,
    });
  });

  it('should get all offers for regular user', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    const getResponse = await request(app.getHttpServer() as App)
      .get('/offer')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(getResponse.body).toHaveLength(2);
  });

  it('should get all offers for admin user', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.adminUser.email,
        password: seeder.rowAdminpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const adminToken = loginResponse.body.token;
    const getResponse = await request(app.getHttpServer() as App)
      .get('/offer')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(getResponse.body).toHaveLength(2);
  });
  it('should not allow unauthenticated access to offers', async () => {
    await request(app.getHttpServer() as App)
      .get('/offer')
      .expect(401);
  });

  it('should return an offer by id', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    const getResponse = await request(app.getHttpServer() as App)
      .get('/offer/1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(getResponse.body).toMatchObject({
      id: 1,
      name: 'Test Offer 1',
      priceFreshold: 100,
      link: 'http://example.com/offer1',
      currentPrice: returnNewPrice,
    });
  });

  it('should return 404 for non-existing offer', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    await request(app.getHttpServer() as App)
      .get('/offer/999')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
  it('should update an existing offer', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    const updateData = { name: 'Updated Offer Name' };
    const updateResponse = await request(app.getHttpServer() as App)
      .patch('/offer/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData)
      .expect(200);
    expect(updateResponse.body).toMatchObject({
      id: 1,
      name: updateData.name,
      priceFreshold: 100,
      link: 'http://example.com/offer1',
    });
  });

  it('should delete an existing offer', async () => {
    const loginResponse = (await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({
        email: seeder.regularUser.email,
        password: seeder.rowUserpassword,
      } as LoginDto)
      .expect(200)) as { body: LoginResponseDto };
    const userToken = loginResponse.body.token;
    await request(app.getHttpServer() as App)
      .delete('/offer/1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    await request(app.getHttpServer() as App)
      .get('/offer/1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });
});
