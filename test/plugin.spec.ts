import 'reflect-metadata'
import {expect} from 'chai'
import {Server} from 'hapi'
import * as HapyTypeOrm from '../src/Plugin'
import {Post} from './utils/entities/Post'
import * as path from 'path'

describe('basic plugin test', () => {
  const startServer = async (pluginOptions: Partial<HapyTypeOrm.Options>) => {
    const server = new Server()

    await server.register([{
      plugin: HapyTypeOrm.plugin,
      options: pluginOptions,
    }])

    await server.start()

    return server
  }

  it('plugin registers, logging works', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

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
  })

  it('plugin registers, logging works', async () => {
    const server = await startServer({
      connections: [{
        name: 'default',
        type: 'sqlite',
        database: 'temp/sqlitedb.db',
        logging: true,
        entities: ['test/utils/entities/**/*.ts'],
        synchronize: true,
        dropSchema: true,
      }],
    })

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
  })
})
