import { User } from 'src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { hash } from 'bcrypt';

const prisma = new PrismaService();

export class Seeder {
  rowAdminpassword = 'adminpassword';
  rowUserpassword = 'password';

  adminUser = {
    id: 2,
    email: 'admin@example.com',
    name: 'Admin User',
    password: '',
    role: 'ADMIN',
    isActive: true,
  } as User;
  regularUser = {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
    password: '',
    role: 'USER',
    isActive: true,
  } as User;

  async seedTestDatabase() {
    await prisma.user.deleteMany();
    await prisma.offer.deleteMany();
    const adminpassword = await hash(this.rowAdminpassword, 10);
    const userpassword = await hash(this.rowUserpassword, 10);

    this.adminUser.password = adminpassword;
    this.regularUser.password = userpassword;

    await prisma.user.createMany({
      data: [this.regularUser, this.adminUser],
    });

    await prisma.offer.createMany({
      data: [
        {
          id: 1,
          name: 'Test Offer 1',
          priceFreshold: 100,
          userId: 1,
          link: 'http://example.com/offer1',
        },
        {
          id: 2,
          name: 'Test Offer 2',
          priceFreshold: 200,
          userId: 1,
          link: 'http://example.com/offer2',
        },
      ],
    });
  }
}
