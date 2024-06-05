const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const jwt = require('jsonwebtoken')



// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy();
})

describe('Auth Endpoints', () => {
  it('[POST] /api/auth/register - creates a new user', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({username:'testusername', password:'password'})

    expect(res.status).toBe(201)
    expect(res.body.username).toBe('testusername')
  })
})

it('[POST] /api/auth/login -logs in a user', async () => {
  await request(server).post('/api/auth/register').send({username:'testusername', password: 'password'})

  const res = await request(server).post('/api/auth/login').send({username:'testusername', password: 'password'})

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('welcome, testusername')
  expect(res.body.token).toBeDefined()
})


describe('Jokes Endpoints', () => {
  it('[GET] /api/jokes - requires token' , async () => {
    const res = await request(server).get('/api/jokes')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('token required')
  })

  it('[GET] /api/jokes - returns jokes with valid token', async () => {
    await request(server).post('/api/auth/register').send({username:'testusername', password: 'password'})

    const loginRes = await request(server)
    .post('/api/auth/login')
    .send({username:'testusername', password: 'password'})

    const token = loginRes.body.token

    const res = await request(server)
    .get('/api/jokes')
    .set('Authorization', token)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it('[GET] /api/jokes - returns 401 for invalid token', async () => {
    const invalidToken = jwt.sign({subject: 1, username: 'testusername'}, 'wrong-secret', {expiresIn: '1h'})
    const res = await request(server).get('/api/jokes').set('Authorization', invalidToken)

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('token invalid')
  })
})

