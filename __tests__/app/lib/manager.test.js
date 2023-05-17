jest.mock('../../../app/models', () => ({
  Sequelize: { Op: { gte: Symbol('gte') } },
  site: {
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
  },
}));

const models = require('../../../app/models');
const managerModule = require('../../../app/lib/manager');

describe('Manager module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('manager.get', async () => {
    const mockSite = {
      toJSON: () => ({
        servername: 'test',
        altnames: 'test.com',
        renewAt: null,
        deletedAt: null,
        challenges: null,
      }),
    };
    models.site.findOne.mockResolvedValue(mockSite);
    const manager = managerModule.create();
    const result = await manager.get({ servername: 'test' });

    expect(models.site.findOne).toHaveBeenCalledWith({ where: { servername: 'test' } });
    expect(result).toEqual({
      subject: 'test',
      altnames: ['test.com'],
      renewAt: 1,
      deletedAt: null,
      challenges: null,
    });
  });

  test('manager.set', async () => {
    const mockSite = { update: jest.fn() };
    models.site.findOrCreate.mockResolvedValue([mockSite]);
    const manager = managerModule.create();
    const opts = {
      servername: 'test',
      altnames: 'test.com',
      deletedAt: null,
      renewAt: null,
    };
    await manager.set(opts);

    // expect(models.site.findOrCreate).isCalled();
    expect(models.site.findOrCreate).toHaveBeenCalledWith({
      where: { servername: 'test' },
      defaults: opts,
    });
    expect(mockSite.update).toHaveBeenCalledWith({
      altnames: 'test.com',
      deletedAt: null,
      renewAt: null,
    });
  });

  // Continue writing tests for find and remove
});
