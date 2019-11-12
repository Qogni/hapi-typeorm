import {startServer} from './utils/helpers'
import {Post} from './utils/entities/Post'
import * as path from 'path'

describe('basic plugin test', () => {

  it('plugin registers, logging works', async () => {
    const server = await startServer({
      configRoot: path.join(process.cwd(), 'test'),
      configName: 'jsconfig',
    })

    const postRepository = server.plugins['hapi-typeorm'].getConnection('default').getRepository(Post)

    const spy = jest.fn()
    server.events.on('log', spy)

    const newPost = new Post()
    newPost.text = 'Hello post'
    newPost.title = 'this is post title'
    newPost.likesCount = 0
    const savedPost = await postRepository.save(newPost)

    expect(savedPost).toEqual(newPost)
    expect(savedPost.id).not.toBeNull()
    expect(spy).toHaveBeenCalled()

    const insertedPost = await postRepository.findOne(savedPost.id)
    expect(insertedPost).toMatchObject({
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
        database: ':memory:',
        logging: true,
        entities: ['test/utils/entities/**/*.ts'],
        synchronize: true,
        dropSchema: true,
      }],
    })

    const postRepository = server.plugins['hapi-typeorm'].getConnection('default').getRepository(Post)

    const spy = jest.fn()
    server.events.on('log', spy)

    const newPost = new Post()
    newPost.text = 'Hello post'
    newPost.title = 'this is post title'
    newPost.likesCount = 0
    const savedPost = await postRepository.save(newPost)

    expect(savedPost).toEqual(newPost)
    expect(savedPost.id).not.toBeNull()
    expect(spy).toHaveBeenCalled()

    const insertedPost = await postRepository.findOne(savedPost.id)
    expect(insertedPost).toMatchObject({
      id: savedPost.id,
      text: 'Hello post',
      title: 'this is post title',
      likesCount: 0,
    })

    return server.stop()
  })
})
