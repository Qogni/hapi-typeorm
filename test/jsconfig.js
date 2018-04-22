module.exports = {
  name: 'default',
  type: 'sqlite',
  database: '../temp/sqlitedbaaa.db',
  logging: true,
  entities: ['test/utils/entities/**/*.ts'],
  synchronize: true,
  dropSchema: true,
}
