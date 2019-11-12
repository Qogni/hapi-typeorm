import {Server} from '@hapi/hapi'
import {Logger, QueryRunner} from 'typeorm'

export class HapiLogger implements Logger {
  private server: Server

  constructor(server: Server) {
    this.server = server
  }

  public log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', level], message)
  }

  public logMigration(message: string, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'migration'], message)
  }

  public logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'query'], query)
  }

  public logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'error'], error)
  }

  public logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'slow-query'], query + ' took ' + time)
  }

  public logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'schema'], message)
  }
}
