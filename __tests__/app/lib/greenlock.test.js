jest.mock('@root/greenlock');
jest.mock('path');
jest.mock('../../package.json', () => ({ name: 'test', version: '1.0.0' }), { virtual: true });

const Greenlock = require('@root/greenlock');
const path = require('path');
const pkg = require('../../package.json');

describe('greenlock service', () => {
  beforeAll(() => {
    // Mocking the process.env values
    process.env.GREENLOCK_MAINTAINER_EMAIL = 'test@test.com';
    process.env.GREENLOCK_DIR = '/test/dir';

    path.join.mockImplementation(() => '/mocked/path');

    Greenlock.create.mockImplementation(() => ({
      packageRoot: '/mocked/path',
      configDir: '/test/dir',
      manager: './app/lib/manager.js',
      packageAgent: `${pkg.name}/${pkg.version}`,
      maintainerEmail: 'test@test.com',
      notify: function (event, details) {
        if ('error' === event) {
          console.warn(details);
        }
        console.info({ event, details });
      }
    }));
  });

  it('should mock greenlock service correctly', () => {
    const greenlock = require('./../../../app/lib/greenlock');
    expect(greenlock.packageRoot).toBe('/mocked/path');
    expect(greenlock.configDir).toBe('/test/dir');
    expect(greenlock.packageAgent).toBe('test/1.0.0');
    expect(greenlock.maintainerEmail).toBe('test@test.com');
    expect(greenlock.notify).toBeDefined();
  });
});