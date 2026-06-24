const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const user = await User.create({
    username: 'taskuser',
    email: 'task@example.com',
    password: 'password123'
  });
  userId = user._id;

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'task@example.com',
      password: 'password123'
    });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Task Routes', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          deadline: '2026-12-31',
          priority: 'High',
          status: 'Pending'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Task');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks', async () => {
      await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        deadline: new Date('2026-12-31'),
        priority: 'High',
        status: 'Pending',
        userId
      });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Task to Update',
        description: 'Description',
        deadline: new Date('2026-12-31'),
        priority: 'Medium',
        status: 'Pending',
        userId
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
          status: 'In Progress'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Task');
      expect(res.body.status).toBe('In Progress');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
        description: 'Description',
        deadline: new Date('2026-12-31'),
        priority: 'Low',
        status: 'Pending',
        userId
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Task removed');
    });
  });
});