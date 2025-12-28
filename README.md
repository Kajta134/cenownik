# Cenownik Bot

A RESTful API built with **NestJS** that allows users to receive notifications when a product price drops below a defined threshold.

---

## Table of Contents

- [Features](#features)
- [Supported Shops](#supported-shops)
- [Technologies](#technologies)
- [Installation](#installation)

---

## Features

- **Price scraping from supported shops**  
  Automatically checks whether a product price has dropped below a specified threshold.

- **Email and Discord notifications**  
  Notifies users via email and Discord when a price drop occurs.

- **Price history tracking**  
  Access historical price data for tracked products.

- **User management**  
  Registration, authentication, and role-based access control.

- **Configurable scraping frequency**  
  Ability to manage how often prices are checked.

- **Swagger integration**  
  API documentation available via Swagger UI.

---

## Supported Shops

- [Amazon](https://www.amazon.pl/)
- [MediaExpert](https://www.mediaexpert.pl/)
- [OLX](https://www.olx.pl/)
- [x-kom](https://www.x-kom.pl/)

---

## Technologies

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [Swagger](https://swagger.io/)

---

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Configure the .env file.

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/cenownik"
JWT_SECRET=your_jwt_secret
MAIL_USER=your_email_address
MAIL_PASS=your_email_password
DISCORD_TOKEN=your_discord_bot_token
```

4. Setup database:

```bash
npx prisma generate

npx prisma migrate dev

npx prisma db seed
```

5. Start the development server:

```bash
npm run start:dev
```

6. Access API documentation at: http://localhost:3000/api (Swagger UI)
