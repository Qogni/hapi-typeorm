import {
  Connection,
  ConnectionManager,
} from 'typeorm'
import {startServer} from './utils/helpers'
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

    expect(noArgument).toBeInstanceOf(Connection)
    expect(defaultConnection).toBeInstanceOf(Connection)
    expect(connectionManager).toBeInstanceOf(ConnectionManager)
    expect(noArgument).toEqual(defaultConnection)

    return server.stop()
  })

  it('request decorations work', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

    let noArgument: Connection | undefined
    let defaultConnection: Connection | undefined
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

    expect(noArgument).toBeInstanceOf(Connection)
    expect(defaultConnection).toBeInstanceOf(Connection)
    expect(connectionManager).toBeInstanceOf(ConnectionManager)
    expect(noArgument).toEqual(defaultConnection)

    return server.stop()
  })
})
