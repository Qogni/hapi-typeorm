import 'reflect-metadata'
import {expect} from 'chai'
import {Server} from 'hapi'
import * as HapyTypeOrm from '../src/Plugin'
import {Post} from './utils/entities/Post'

describe('basic plugin test', () => {
  const startServer = async () => {
    const server = new Server()
    const PluginOptions: HapyTypeOrm.Options = {
      connections: [{
        name: 'default',
        type: 'sqlite',
        database: 'temp/sqlitedb.db',
        logging: true,
        entities: ['test/utils/entities/*.ts'],
        synchronize: true,
      }],
    }

    await server.register([{
      plugin: HapyTypeOrm.plugin,
      options: PluginOptions,
    }])

    await server.start()

    return server
  }

  it('plugin registers, logging works', () => startServer().then(async (server: Server) => {
    const postRepository = server.plugins['hapi-typeorm'].getConnection('default').getRepository(Post)
    let logCount = 0

    server.events.on('log', (event, tags) => {
      logCount++
    })

    const newPost = new Post()
    newPost.text = 'Hello post'
    newPost.title = 'this is post title'
    newPost.likesCount = 0
    const savedPost = await postRepository.save(newPost)

    savedPost.should.be.equal(newPost)
    expect(savedPost.id).not.to.be.null
    expect(logCount).to.be.greaterThan(0)

    const insertedPost = await postRepository.findOne(savedPost.id)
    insertedPost!.should.be.eql({
      id: savedPost.id,
      text: 'Hello post',
      title: 'this is post title',
      likesCount: 0,
    })

    return server.stop()
  }))
})
