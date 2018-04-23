import * as HapyTypeOrm from './../../lib/Plugin'
import {Server} from 'hapi'

export const startServer = async (pluginOptions: Partial<HapyTypeOrm.Options>) => {
  const server = new Server()

  await server.register([{
    plugin: HapyTypeOrm.plugin,
    options: pluginOptions,
  }])

  await server.start()

  return server
}
