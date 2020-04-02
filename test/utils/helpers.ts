import * as HapyTypeOrm from './../../src/Plugin'
import { Server } from '@hapi/hapi'

export const startServer = async (pluginOptions: Partial<HapyTypeOrm.Options>): Promise<Server> => {
  const server = new Server()

  await server.register([{
    plugin: HapyTypeOrm.plugin,
    options: pluginOptions,
  }])

  await server.start()

  return server
}
