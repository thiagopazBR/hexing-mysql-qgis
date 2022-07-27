import { strict as assert } from 'assert'
import { Connection, createConnection, QueryError, RowDataPacket } from 'mysql2'

// import { IGlpiDataResponse } from '../interfaces/IGlpiDataResponse'
import { IMysqlResponse } from '../interfaces/IMysqlResponse'

assert(process.env.GLPI_DB_HOST, 'GLPI_DB_HOST is invalid or undefined')
assert(process.env.GLPI_DB_NAME, 'GLPI_DB_NAME is invalid or undefined')
assert(process.env.GLPI_DB_USER, 'GLPI_DB_USER is invalid or undefined')
assert(process.env.GLPI_DB_PASS, 'GLPI_DB_PASS is invalid or undefined')

export class Mysql {
  connection: Connection

  constructor() {
    this.connection = createConnection({
      database: process.env.GLPI_DB_NAME,
      host: process.env.GLPI_DB_HOST,
      password: process.env.GLPI_DB_PASS,
      user: process.env.GLPI_DB_USER
    })
  }

  public select(query: string): Promise<IMysqlResponse> {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err: QueryError, rows: RowDataPacket[]) => {
        if (err) reject({ error: err })

        resolve({ data: rows })
      })
    })
  }

  // public async get_glpi_data(): Promise<IGlpiDataResponse> {
  //   const query = `
  //     SELECT
  //       p.serial,
  //       p.name as peripheral,
  //       pl.idrelayfield as idrelay
  //     FROM
  //       glpi_peripherals as p
  //     LEFT JOIN
  //       glpi_plugin_fields_peripheraldeviceconfigurations as pl ON pl.items_id = p.id
  //     WHERE
  //       p.is_deleted != 1
  //       AND p.peripheraltypes_id = '3';`

  //   const result = await this.select(query)
  //   const output: IGlpiDataResponse = {}

  //   for (const r of result.data)
  //     if (r.serial) {
  //       const relay_serial = r.serial
  //       const relay_name = r.peripheral
  //       const id_relay = r.idrelay ? r.idrelay : relay_serial

  //       output[relay_serial] = { id_relay: id_relay, name: relay_name }
  //     }

  //   return Promise.resolve(output)
  // }
}

// for qr in query_result:
//         if qr['serial'] != None:
//             relay_serial = qr['serial']
//             relay_name =  qr['peripheral']
//             id_relay = qr['idrelay'] if qr['idrelay'] else relay_serial

//             output[relay_serial] = {"name": relay_name, "id_relay": id_relay }
