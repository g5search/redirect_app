const request = require('supertest');

jest.mock('../../app/lib/greenlock', () => ({
  create: jest.fn(() => Promise.resolve({})),
  init: jest.fn(() => Promise.resolve({})),
  add: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../app/lib/logging', () => ({
  info: jest.fn(() => Promise.resolve({})),
  warn: jest.fn(() => Promise.resolve({})),
  error: jest.fn(() => Promise.resolve({}))
}));

const app = require('../../app/lib/index');

describe('GET wildcard.com', () => {
  test('host is equal to root domain', async () => {
    await request(app)
      .get('/wildcard/test/subdir')
      .set('Host', 'wildcard.com')
      .set('Protocol', 'https')
      .expect(301);
  });
});

describe('GET www.wildcard.com', () => {
  test('no redirect configured', async () => {
    await request(app)
      .get('/')
      .set('Host', 'www.wildcard.com')
      .set('Protocol', 'https')
      .expect(404);
  });
});

describe('GET subdomain.test.com', () => {
  test('Redirect Loop', async () => {
    await request(app)
      .get('/')
      .set('Host', 'subdomain.test.com')
      .set('Protocol', 'https')
      .expect(301);
  });
});

describe('GET loop.com', () => {
  test('Redirect Loop', async () => {
    await request(app)
      .get('/')
      .set('Host', 'loop.com')
      .set('Protocol', 'https')
      .expect(404);
  });
});

describe('GET test.com', () => {
  test('Redirect Loop', async () => {
    await request(app)
      .get('/wildcard/subdir/test/')
      .set('Host', 'test.com')
      .set('Protocol', 'https')
      .expect(301);
  });
});

describe('GET test.com', () => {
  test('Nothing Found', async () => {
    await request(app)
      .get('/test/subdir/test/')
      .set('Host', 'test.com')
      .set('Protocol', 'https')
      .expect(404);
  });
});

describe('POST /api/v1/backfill/used', () => {
  test('It should respond with a 201 status for a successful request', async () => {
    const response = await request(app)
      .post('/api/v1/backfill/used')
      .send();

    expect(response.statusCode).toBe(201);
  });

  test('It should respond with a 500 status for an error', async () => {

    jest.mock('../../app/models', () => ({
      domain: {
        findAll: jest.fn(() => {
          throw new Error('Database error!!');
        })
      }
    }));

    const response = await request(app)
      .post('/api/v1/backfill/used')
      .send();

    expect(response.statusCode).toBe(500);
  });
});
