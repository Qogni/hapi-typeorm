module.exports = {
  name: 'default',
  type: 'sqlite',
  database: ':memory:',
  logging: true,
  entities: ['test/utils/entities/**/*.ts'],
  synchronize: true,
  dropSchema: true,
}
