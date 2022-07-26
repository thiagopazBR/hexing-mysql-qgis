import 'dotenv/config'

import { createObjectCsvWriter } from 'csv-writer'
import { existsSync } from 'fs'
import { join } from 'path'

import { args_validation } from './functions/args_validation'
import { check_device_id } from './functions/check_device_id'
import * as date_validation from './functions/date_validation'
import { logger } from './functions/logger'
import { read_csv } from './functions/read_csv'

process.on('uncaughtException', err => {
  if (err.stack !== undefined) logger.error(err.stack)
  else logger.error(`${err.name}: ${err.message}`)
  process.exit(1)
})

const args = args_validation(process.argv.slice(2), logger)
const date = args.date

/* const files_path: string = path.dirname(__filename) */
const files_path = '/workspaces/typescript-backend-sample/files' // Dir where is commissioning_report.csv files

date_validation.check_date_format(date, logger)

/*
 * ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', ...]
 */
const date_range = date_validation.generate_date_range(date)

;(async () => {
  const counter: { [key: string]: { points: number; whitelisted: boolean } } = {}

  for (const d of date_range) {
    const csv_file_path = join(files_path, `${d}_success_reading_rate_tou.csv`)

    if (!existsSync(csv_file_path)) {
      logger.error(`${d}_success_reading_rate_tou.csv file does not exists`)
      continue
    }

    const meters_ids: { [key: string]: boolean } = {}

    const csv_content = await read_csv(csv_file_path)

    let i = csv_content.length
    while (i--) {
      const row = csv_content[i]

      let meter_id = row['METER_ID']
      const success_rate = row['SUCCESS_RATE'].trim()
      const whitelisted = row['WHITELISTED'].toLowerCase() == 'yes' ? true : false

      const res_check_device_id: string | boolean = check_device_id(meter_id)
      if (res_check_device_id === false) continue
      if (meters_ids[res_check_device_id as string] !== undefined) continue
      meters_ids[res_check_device_id as string] = true
      meter_id = res_check_device_id as string

      let point: number
      if (success_rate != '0.0') point = 1
      else point = 0

      if (counter[meter_id] !== undefined)
        counter[meter_id].points = counter[meter_id].points + point
      else counter[meter_id] = { points: point, whitelisted: whitelisted }
    }
  }

  const records = []

  for (const [k, v] of Object.entries(counter)) {
    const meter_id = k
    const total = v.points

    const avg_ssr = Math.round((total / 6) * 100).toFixed(2)
    const whitelisted = v.whitelisted

    records.push({
      meter_id: meter_id,
      avg_ssr: avg_ssr,
      total: total,
      whitelisted: whitelisted
    })
  }

  const csvWriter = createObjectCsvWriter({
    path: join(files_path, `TESTE.csv`),
    header: [
      { id: 'meter_id', title: 'METER_ID' },
      { id: 'avg_ssr', title: 'AVG_SSR' },
      { id: 'total', title: 'TOTAL' },
      { id: 'whitelisted', title: 'WHITELISTED' }
    ]
  })

  await csvWriter.writeRecords(records)

  // console.log(count)
})()
