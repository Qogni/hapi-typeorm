import {Plugin, Server} from 'hapi'
import {
  Connection,
  ConnectionManager,
  ConnectionOptions,
  ConnectionOptionsReader,
  createConnections,
  getConnection,
  getConnectionManager,
  useContainer,
} from 'typeorm'
import {HapiLogger} from './Logger'
import {DefaultContainer} from './Container'

const Pkg: {
  version: string,
} = require('../package.json')

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

export class Options {
  configRoot: string
  configName: string
  connections: ConnectionOptions[]

  private defaultOptions: Partial<Options> = {
    configRoot: process.cwd(),
    configName: 'ormconfig',
    connections: [],
  }

  constructor(options: Partial<Options>) {
    Object.assign(this, this.defaultOptions, options)
  }
}

export const plugin: Plugin<Options> = {
  name: 'hapi-typeorm',
  register: async (server: Server, partialOptions: Partial<Options> = {}) => {
    useContainer(new DefaultContainer(), { fallback: false, fallbackOnErrors: false })

    const options = new Options(partialOptions)

    try {
      const optionsReader = new ConnectionOptionsReader({
        root: options.configRoot,
        configName: options.configName,
      })

      server.log(['hapi-typeorm', 'config'], 'configRoot: ' + options.configRoot)
      server.log(['hapi-typeorm', 'config'], 'configName: ' + options.configName)

      options.connections = options.connections.concat(await optionsReader.all())
    } catch (err) {
      server.log(['hapi-typeorm', 'config', 'warning'], err.message)
    }

    options.connections = options.connections.map(conn => {
      if (conn.logging && conn.logger === undefined) {
        conn = {
          ...conn,
          logger: new HapiLogger(server),
        }
      }

      return conn
    })

    await createConnections(options.connections)

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
