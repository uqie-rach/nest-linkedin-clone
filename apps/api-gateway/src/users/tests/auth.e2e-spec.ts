import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as request from 'supertest';
import { ApiGatewayModule } from '../../api-gateway.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../../users/src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

let registerPayload = {
  MATCH: {
    email: 'user.test@gmail.com',
    password: 'password',
    firstName: 'user',
    lastName: 'test',
    phone: '(+62) 81234567890',
    location: 'Malang',
    occupation: 'Software Engineer',
  },
  BAD_REQUEST: {
    email: '',
    password: 'password',
    firstName: 'user',
    lastName: 'test',
    phone: '(+62) 81234567890',
    location: 'Malang',
    occupation: 'Software Engineer',
  },
};

let loginPayload = {
  invalid_credential: {
    email: 'admin.work@gmail.com',
    password: 'wrongpassword',
  },
  not_found: {
    email: 'randomuser@gmail.com',
    password: 'wrongpassword',
  },
  match: {
    email: 'admin.work@gmail.com',
    password: 'password',
  },
  bad_request: {
    email: 'admin.work@gmail.com',
    // password: 'wrongpassword',
  },
};

let userRepository: Repository<User>;

describe('Users Microservice - E2E Register Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiGatewayModule,
        ClientsModule.register([
          {
            name: 'USERS_CLIENT',
            transport: Transport.TCP,
            options: { port: 3001 },
          },
        ]),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mongodb',
            url: configService.get<string>('MONGODB_URI'),
            synchronize: true,
            entities: [User],
          }),
        }),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
      options: { port: 3000 }, // Port gateway
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.startAllMicroservices();
    await app.init();

    const dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const emailToDelete = 'user.test@gmail.com';
    await userRepository.delete({ email: emailToDelete });
  });

  it('should register successfully', async () => {
    await request(app.getHttpServer())
      .post('/users/auth/register') // Endpoint Gateway API
      .send(registerPayload.MATCH)
      .expect(201); // Expected HTTP Status
  });

  it('should return 400 for bad request', async () => {
    return request(app.getHttpServer())
      .post('/users/auth/register') // Endpoint Gateway API
      .send(registerPayload.BAD_REQUEST)
      .expect(400);
  });

  it('should return 409 for Conflict', async () => {
    await request(app.getHttpServer())
      .post('/users/auth/register') // Endpoint Gateway API
      .send(registerPayload.MATCH)
      .expect(201); // Expected HTTP Status

    await request(app.getHttpServer())
      .post('/users/auth/register') // Endpoint Gateway API
      .send(registerPayload.MATCH)
      .expect(409)
      .expect((response) => {
        expect(response.body.message).toBe('User already exists');
      });

    const response = await request(app.getHttpServer())
      .post('/users/auth/register') // Endpoint Gateway API
      .send(registerPayload.MATCH)
      .expect(409)
      .expect((response) => {
        expect(response.body.message).toBe('User already exists');
      });

    return response;
  });
});

describe('Users Microservice - E2E Login Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiGatewayModule,
        ClientsModule.register([
          {
            name: 'USERS_CLIENT',
            transport: Transport.TCP,
            options: { port: 3001 },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
      options: { port: 3000 }, // Port gateway
    });

    await app.startAllMicroservices();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login successfully', async () => {
    return request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send(loginPayload.match)
      .expect(200); // Expected HTTP Status
  });

  it('should return 400 for invalid credentials', async () => {
    return request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send(loginPayload.invalid_credential)
      .expect(400); // Unauthorized
  });

  it('should return 404 for unregistered user', async () => {
    return request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send(loginPayload.not_found)
      .expect(404); // Unauthorized
  });

  it('should return 400 for bad request', async () => {
    return request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send(loginPayload.bad_request)
      .expect(400); // Unauthorized
  });
});

describe('Users Microservice - E2E Users Endpoint Test', () => {
  let app: INestApplication;
  let token: string = '';
  let payload = null;

  let loginPayload = {
    admin: {
      _id: '675eb54df7f153371abeaf4b',
      email: 'admin.work@gmail.com',
      password: 'password',
    },
    user: {
      email: 'user.test@gmail.com',
      password: 'password',
    },
  };

  let mockUser = {
    _id: '676ac870dd8c4df4b8f00f9a',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiGatewayModule,
        ClientsModule.register([
          {
            name: 'USERS_CLIENT',
            transport: Transport.TCP,
            options: { port: 3001 },
          },
        ]),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'mongodb',
            url: configService.get<string>('MONGODB_URI'),
            synchronize: true,
            entities: [User],
          }),
        }),
        TypeOrmModule.forFeature([User]),
        ClientsModule.register([
          {
            name: 'USERS_CLIENT',
            transport: Transport.TCP,
            options: { port: 3001 },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
      options: { port: 3000 }, // Port gateway
    });

    await app.startAllMicroservices();
    await app.init();

    const dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);

    const response = await request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send(loginPayload.user)
      .expect(200); // Expected HTTP Status

    payload = response.body.user;
    token = response.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {});

  it('should return 401 unauthorized when accessing users data', async () => {
    const user = await request(app.getHttpServer())
      .get('/users')
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Unauthorized');
      }); // Expected HTTP Status
    return user;
  });

  it('should return 200 when accessing its own data', async () => {
    console.log('here', payload, token);
    const user = await request(app.getHttpServer())
      .get(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return user;
  });

  it('should return 403 forbidden when accessing other user data', async () => {
    const user = await request(app.getHttpServer())
      .get(`/users/${loginPayload.admin._id}`)
      .set('Authorization', `Bearer ${token}`)
    // .expect((res) => {
    //   expect(res.body.message).toBe('Forbidden');
    // });

    console.log(user.body);
    return user;
  });

  it('should return 404 if user not found', async () => {
    const user = await request(app.getHttpServer())
      .get(`/users/${mockUser._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });

    console.log(user.body);

    return user;
  });
});
