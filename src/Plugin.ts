import {Plugin, Server} from 'hapi'
import {
  Connection,
  ConnectionManager,
  ConnectionOptions,
  createConnections,
  getConnection,
  getConnectionManager,
} from 'typeorm'
import {HapiLogger} from './Logger'

const Pkg: {
  version: string,
} = require('../package.json')

export interface Options {
  connections: ConnectionOptions[]
}

declare module 'hapi' {
  interface Request {
    connectionManager: ConnectionManager
    getConnection: (connectionName?: string) => Connection,
  }

  interface PluginProperties {
    'hapi-typeorm': {
      connectionManager: ConnectionManager
      getConnection: (connectionName?: string) => Connection,
    }
  }
}

const internal: {
  connections?: Connection[],
} = {}

export const plugin: Plugin<Options> = {
  name: 'hapi-typeorm',
  register: async (server: Server, options: Options) => {
    let connectionOptions: ConnectionOptions[] = options.connections

    connectionOptions = connectionOptions.map(conn => {
      if (conn.logging && conn.logger === undefined) {
        conn = {
          ...conn,
          logger: new HapiLogger(server),
        }
      }

      return conn
    })

    internal.connections = await createConnections(connectionOptions)

    server.expose('connectionManager', getConnectionManager())
    server.expose('getConnection', getConnection)

    server.decorate(
      'request',
      'getConnectionManager',
      getConnectionManager,
      {apply: true},
    )

    server.decorate(
      'request',
      'getConnection',
      server.plugins['hapi-typeorm'].getConnection,
    )
  },
  version: Pkg.version,
}
