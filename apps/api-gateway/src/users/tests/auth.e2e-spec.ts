import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as request from 'supertest';
import { ApiGatewayModule } from '../../api-gateway.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../../../users/src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

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

    // Enable Validation Pipe
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

  let userPayload = {
    admin: {
      _id: '676d0a1b3e2482f102a2d3e2',
      email: 'admin.work@gmail.com',
      password: 'password',
    },
    user: {
      email: 'user.test@gmail.com',
      password: 'password',
      firstName: 'user',
      lastName: 'test',
      phone: '(+62) 81234567890',
      location: 'Malang',
      occupation: 'Software Engineer',
    },
    newUser: {
      email: 'uqie.work@gmail.com',
      password: 'password',
      firstName: 'uqie',
      lastName: 'rach',
      phone: '(+62) 81234567890',
      location: 'Malang',
      occupation: 'Software Engineer',
    },
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

    // Enable Validation Pipe
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
    await deleteUser(null, userPayload.user.email);
    await deleteUser(null, userPayload.newUser.email);
    await createUser(userPayload.user);
  });

  afterEach(async () => {
    await deleteUser(null, userPayload.user.email);
    await deleteUser(null, userPayload.newUser.email);
  });

  // Functions
  async function loginAsUserOrAdmin(
    option: string,
  ): Promise<{ token: string; payload: any }> {
    let choosen;
    switch (option) {
      case 'admin':
        choosen = userPayload.admin;
        break;
      case 'user':
        choosen = userPayload.user;
        break;
      default:
        choosen = userPayload.user;
        break;
    }

    const response = await request(app.getHttpServer())
      .post('/users/auth/login') // Endpoint Gateway API
      .send({
        email: choosen.email,
        password: choosen.password,
      });

    return {
      token: response.body.token,
      payload: response.body.user,
    };
  }

  async function deleteUser(_id?: string, email?: string) {
    return await userRepository.delete({ email });
  }

  async function createUser(data: any): Promise<any> {
    const { password, ...left } = data;
    const user = userRepository.create({
      ...left,
      password: await bcrypt.hash(password, 10),
      role: 'user',
    });
    return await userRepository.save(user);
  }

  // CREATE
  it('should return 403 if user is not an admin', async () => {
    // Login as user
    const { token } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .post(`/users`)
      .send(userPayload.newUser)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    return user;
  });

  it('should return 400 for the missing attributes', async () => {
    // login as admin
    const { token } = await loginAsUserOrAdmin('admin');

    // Create new user
    const user = await request(app.getHttpServer())
      .post(`/users`)
      .send({
        email: userPayload.newUser.email,
        password: userPayload.newUser.password,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    return user;
  });

  it('should return 201 after creating new user', async () => {
    // login as admin
    const { token } = await loginAsUserOrAdmin('admin');

    // Create new user
    const user = await request(app.getHttpServer())
      .post(`/users`)
      .send(userPayload.newUser)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return user;
  });

  it('should return 409 for duplicate entry', async () => {
    // login as admin, then retrieve token
    const { token } = await loginAsUserOrAdmin('admin');

    // Create new user
    // await createUser(userPayload.newUser);
    await request(app.getHttpServer())
      .post(`/users`)
      .send(userPayload.newUser)
      .set('Authorization', `Bearer ${token}`);

    const user = await request(app.getHttpServer())
      .post(`/users`)
      .send(userPayload.newUser)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    return user;
  });

  // GET by ID
  it('should return 200 when accessing its own data', async () => {
    // Create new user
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .get(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return user;
  });

  it('should return 403 forbidden when accessing other user data', async () => {
    // Login as user
    const { token } = await loginAsUserOrAdmin('user');

    // Login as admin
    const { payload } = await loginAsUserOrAdmin('admin');

    // Try to access admin data
    const user = await request(app.getHttpServer())
      .get(`/users/${userPayload.admin._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    return user;
  });

  it('should return 404 if user not found', async () => {
    // Login as user
      const { token, payload } = await loginAsUserOrAdmin('user');

    // delete user
    await deleteUser(null, payload.email);

    const user = await request(app.getHttpServer())
      .get(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });

    return user;
  });

  // GET all
  it('should return 401 unauthorized when accessing users data', async () => {
    const user = await request(app.getHttpServer())
      .get('/users')
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Unauthorized');
      }); // Expected HTTP Status
    return user;
  });

  it('should return 200 when admin accessing users data', async () => {
    // Login as admin
    const { token } = await loginAsUserOrAdmin('admin');

    const user = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
      });

    return user;
  });

  // DELETE
  it('should return 401 unauthorized when deleting user data', async () => {
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .delete(`/users/${payload._id}`)
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Unauthorized');
      });

    return user;
  });

  it('should return 403 forbidden when user deleting other user data', async () => {
    // create another user
    const anotherUser = await createUser(userPayload.newUser);

    console.log(anotherUser._id.toString());

    // Login as user
    const { token } = await loginAsUserOrAdmin('user');

    // Login as admin
    const { payload } = await loginAsUserOrAdmin('admin');

    // Try to delete admin data
    const user = await request(app.getHttpServer())
      .delete(`/users/${anotherUser._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    return user;
  });

  it('should return 404 if user not found', async () => {
    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    // delete user
    await deleteUser(null, payload.email);

    const user = await request(app.getHttpServer())
      .delete(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });

    return user;
  });

  it('should return 200 when deleting user data', async () => {
    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .delete(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    return user;
  });

  // UPDATE
  it('should return 200 when updating user data', async () => {
    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .put(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    return user;
  });

  it('should return 401 - unauthorized user', async () => {
    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .put(`/users/${payload._id}`)
      .expect(401);

    return user;
  });

  it('should return 403 - Forbidden when accessing other data', async () => {
    // create another user
    const anotherUser = await createUser(userPayload.newUser);

    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    const user = await request(app.getHttpServer())
      .put(`/users/${anotherUser._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    return user;
  });

  it('should return 404 - User not found', async () => {
    // Login as user
    const { token, payload } = await loginAsUserOrAdmin('user');

    // delete user
    await deleteUser(null, payload.email);

    const user = await request(app.getHttpServer())
      .put(`/users/${payload._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toBe('User not found');
      });

    return user;
  });
});
