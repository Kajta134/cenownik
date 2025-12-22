import { User } from 'src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService();
export class Seeder {
  adminUser = {
    id: 2,
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'adminpassword',
    role: 'ADMIN',
    isActive: true,
  } as User;
  regularUser = {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
    password: 'password',
    role: 'USER',
    isActive: true,
  } as User;

  async seedTestDatabase() {
    await prisma.user.deleteMany();
    await prisma.offer.deleteMany();

    await prisma.user.createMany({
      data: [this.regularUser, this.adminUser],
    });

    await prisma.offer.createMany({
      data: [
        {
          name: 'Test Offer 1',
          priceFreshold: 100,
          userId: 1,
          link: 'http://example.com/offer1',
        },
        {
          name: 'Test Offer 2',
          priceFreshold: 200,
          userId: 1,
          link: 'http://example.com/offer2',
        },
      ],
    });
  }
}
