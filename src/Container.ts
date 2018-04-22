/* tslint:disable:ban-types */

/**
 * Shamelessly copied from TypeORM's source code
 *
 * https://github.com/typeorm/typeorm/blob/master/src/container.ts
 */

interface InstaceType {
  type: Function,
  object: any,
}

export class DefaultContainer {
  private instances: InstaceType[] = []

  get<T>(someClass: { new (...args: any[]): T }): T {
    let instance = this.instances.find(i => i.type === someClass)
    if (!instance) {
      instance = { type: someClass, object: new someClass() }
      this.instances.push(instance)
    }

    return instance.object
  }
}
