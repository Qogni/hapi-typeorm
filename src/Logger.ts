import type { Server } from '@hapi/hapi'
import type { Logger, QueryRunner } from 'typeorm'

type LogMsgType = Parameters<HapiLogger['server']['log']>[1]

export class HapiLogger implements Logger {
  private readonly server: Server

  constructor (server: Server) {
    this.server = server
  }

  public log (level: 'log' | 'info' | 'warn', message: LogMsgType, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', level], message)
  }

  public logMigration (message: string, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'migration'], message)
  }

  public logQuery (query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'query'], query)
  }

  public logQueryError (error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'error'], error)
  }

  public logQuerySlow (time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'slow-query'], `${query} took ${time.toString()}`)
  }

  public logSchemaBuild (message: string, queryRunner?: QueryRunner): any {
    this.server.log(['hapi-typeorm', 'schema'], message)
  }
}
