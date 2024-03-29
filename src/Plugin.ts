import { type Plugin, type Server } from '@hapi/hapi'
import {
  ConnectionManager,
  type ConnectionOptions,
  ConnectionOptionsReader,
  type DataSource,
} from 'typeorm'
import { HapiLogger } from './Logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Pkg: { version: string } = require('../package.json')

declare module '@hapi/hapi' {
  interface Request {
    getConnectionManager: () => ConnectionManager
    getConnection: (name?: string) => DataSource
  }

  interface PluginProperties {
    'hapi-typeorm': {
      getConnectionManager: () => ConnectionManager
      getConnection: (name?: string) => DataSource
    }
  }
}

export class Options {
  configRoot: string
  configName: string
  connections: ConnectionOptions[]

  private readonly defaultOptions: Partial<Options> = {
    configRoot: process.cwd(),
    configName: 'ormconfig',
    connections: [],
  }

  constructor (options: Partial<Options>) {
    Object.assign(this, this.defaultOptions, options)
  }
}

type LogMsg = Parameters<Server['log']>[1]

export const plugin: Plugin<Options> = {
  name: 'hapi-typeorm',
  register: async (server: Server, partialOptions: Partial<Options> = {}) => {
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
      server.log(['hapi-typeorm', 'config', 'warning'], err.message as LogMsg)
    }

    options.connections = options.connections.map(conn => {
      if (conn.logging !== undefined && conn.logger === undefined) {
        conn = {
          ...conn,
          logger: new HapiLogger(server),
        }
      }

      return conn
    })

    const connectionManager = new ConnectionManager()
    await options.connections.map(conn => connectionManager.create(conn)).reduce(
      // eslint-disable-next-line @typescript-eslint/return-await
      async (a: Promise<any>, conn) => a.then(async () => conn.connect()),
      Promise.resolve(true),
    )

    const containerGetConnectionManager: () => ConnectionManager = () => connectionManager
    const containerGetConnection = (name?: string): DataSource => connectionManager.get(name)

    server.expose('getConnectionManager', containerGetConnectionManager)
    server.expose('getConnection', containerGetConnection)

    server.decorate(
      'request',
      'getConnectionManager',
      containerGetConnectionManager,
    )

    server.decorate(
      'request',
      'getConnection',
      containerGetConnection,
    )
  },
  version: Pkg.version,
}
