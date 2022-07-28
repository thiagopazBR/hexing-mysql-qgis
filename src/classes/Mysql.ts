import { strict as assert } from 'assert'
import { Connection, createConnection, MysqlError } from 'mysql'
import { IMysqlResponse } from '../interfaces/IMysqlResponse'

assert(process.env.DB_HOST, 'DB_HOST is invalid or undefined')
assert(process.env.DB_NAME, 'DB_NAME is invalid or undefined')
assert(process.env.DB_USER, 'DB_USER is invalid or undefined')
assert(process.env.DB_PASS, 'DB_PASS is invalid or undefined')

export class Mysql {
  connection: Connection

  constructor() {
    this.connection = createConnection({
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASS,
      user: process.env.DB_USER
    })
  }

  public query(query: string, values?: (string | number)[][]): Promise<IMysqlResponse> {
    return new Promise((resolve, reject) => {
      this.connection.query(query, [values], (err: MysqlError, rows: []) => {
        if (err) {
          console.log(err)
          reject({ error: err })
        }

        resolve({ data: rows })
      })
    })
  }

  private async clear_table(table_name: string): Promise<void> {
    await this.query(`DELETE FROM ${table_name}`)
    await this.query(`ALTER TABLE ${table_name} AUTO_INCREMENT = 1`)
  }

  public async bulk(data: (string | number)[][]) {
    const table_name = 'meters_srr_avg'

    this.clear_table(table_name)
    const insert_prefix: string =
      'INSERT INTO `' +
      table_name +
      '` (DATE_, METER_ID, AVG_SSR, TOTAL, LATITUDE, LONGITUDE, CITY) VALUES ? '

    let i = 0
    let buff = []

    for (const line of data) {
      buff.push(line)
      i++
      if (buff.length % 2000 === 0) {
        await this.query(insert_prefix, buff)
        console.log(i)
        buff = []
      }
    }

    if (buff.length > 0) {
      await this.query(insert_prefix, buff)
      console.log(i)
    }
  }

  // console.log('end');
  // connection.close();
}

// run()
// font: https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js

/*
CREATE TABLE METERS_QGIS (
  ID INT NOT NULL IDENTITY PRIMARY KEY,
  DATE_ DATE,
  METER_ID INT NOT NULL,
  AVG_SSR TINYINT,
  TOTAL TINYINT,
  LATITUDE DECIMAL(10, 8),
  LONGITUDE DECIMAL(11, 8),
  CITY varchar(100)
)
*/
