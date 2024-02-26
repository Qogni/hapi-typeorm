import {
  DataSource,
  ConnectionManager,
} from 'typeorm'
import { startServer } from './utils/helpers'
import * as path from 'path'

describe('basic plugin test', () => {
  it('server decorations work', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

    const noArgument = server.plugins['hapi-typeorm'].getConnection()
    const defaultConnection = server.plugins['hapi-typeorm'].getConnection('default')
    const connectionManager = server.plugins['hapi-typeorm'].getConnectionManager()

    expect(noArgument).toBeInstanceOf(DataSource)
    expect(defaultConnection).toBeInstanceOf(DataSource)
    expect(connectionManager).toBeInstanceOf(ConnectionManager)
    expect(noArgument).toEqual(defaultConnection)

    await server.stop()
  })

  it('request decorations work', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

    let noArgument: DataSource | undefined
    let defaultConnection: DataSource | undefined
    let connectionManager: ConnectionManager | undefined

    server.route({
      method: 'GET',
      path: '/test',
      handler: (request, h) => {
        noArgument = request.getConnection()
        defaultConnection = request.getConnection('default')
        connectionManager = request.getConnectionManager()

        return ''
      },
    })

    await server.inject({
      method: 'GET',
      url: '/test',
    })

    expect(noArgument).toBeInstanceOf(DataSource)
    expect(defaultConnection).toBeInstanceOf(DataSource)
    expect(connectionManager).toBeInstanceOf(ConnectionManager)
    expect(noArgument).toEqual(defaultConnection)

    await server.stop()
  })
})
