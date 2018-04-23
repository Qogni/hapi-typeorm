import 'reflect-metadata'
import {expect} from 'chai'
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

    const noArgument = server.plugins['hapi-typeorm'].getConnection('default')
    const defaultConnection = server.plugins['hapi-typeorm'].getConnection('default')
    const connectionManager = server.plugins['hapi-typeorm'].getConnectionManager()

    expect(noArgument).to.be.instanceOf(Connection)
    expect(defaultConnection).to.be.instanceOf(Connection)
    expect(connectionManager).to.be.instanceOf(ConnectionManager)
    expect(noArgument).to.equal(defaultConnection)

    return server.stop()
  })

  it('request decorations work', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

    let noArgument
    let defaultConnection
    let connectionManager

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

    expect(noArgument).to.be.instanceOf(Connection)
    expect(defaultConnection).to.be.instanceOf(Connection)
    expect(connectionManager).to.be.instanceOf(ConnectionManager)
    expect(noArgument).to.equal(defaultConnection)

    return server.stop()
  })
})
