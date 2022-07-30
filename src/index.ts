import 'dotenv/config'

import { createObjectCsvWriter } from 'csv-writer'
import { existsSync } from 'fs'
import { join } from 'path'

import { Mysql } from './classes/Mysql'
import { args_validation } from './functions/args_validation'
import { check_device_id } from './functions/check_device_id'
import * as date_validation from './functions/date_validation'
import { check_latitude, check_longitude } from './functions/lat_long_validation'
import { logger } from './functions/logger'
import { read_csv } from './functions/read_csv'
import { IMainOutput } from './interfaces/IMainOutput'

const args = args_validation(process.argv.slice(2), logger)
const date = args.date

/* const files_path: string = path.dirname(__filename) */
const files_path = '/usr/src/app/files' // Dir where is commissioning_report.csv files

date_validation.check_date_format(date, logger)

/*
 * ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', ...]
 */
const date_range = date_validation.generate_date_range(date)

const mysql = new Mysql()

;(async () => {
  const counter: IMainOutput = {}

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

      if (!whitelisted) continue

      const res_check_device_id: string | boolean = check_device_id(meter_id)
      if (res_check_device_id === false) continue
      if (meters_ids[res_check_device_id as string] !== undefined) continue
      meters_ids[res_check_device_id as string] = true
      meter_id = res_check_device_id as string

      let point: number
      if (success_rate && success_rate != '0.0') point = 1
      else point = 0

      if (counter[meter_id] !== undefined)
        counter[meter_id].points = counter[meter_id].points + point
      else counter[meter_id] = { points: point }
    }
  }

  /* Read installed_field_control.csv file to get city, lat and lng */
  const csv_file_path = join(files_path, `${date}_installed_field_control.csv`)

  if (!existsSync(csv_file_path)) {
    logger.error(`${date}_installed_field_control.csv file does not exists`)
    process.exit(1)
  }

  const csv_content = await read_csv(csv_file_path)

  let i = csv_content.length
  while (i--) {
    const row = csv_content[i]

    const meter_id: string = row['METER']
    let latitude: string = row['LAT']
    let longitude: string = row['LONG']
    const city: string = row['City']

    latitude = check_latitude(latitude)
    longitude = check_longitude(longitude)

    if (latitude == '0' || longitude == '90') {
      latitude = '0'
      longitude = '90'
    }

    if (counter[meter_id] !== undefined) {
      counter[meter_id].latitude = latitude
      counter[meter_id].longitude = longitude
      counter[meter_id].city = city
    }
  }

  const records = []
  // const bulk_data = []

  for (const [k, v] of Object.entries(counter)) {
    const meter_id = k

    const total = v.points
    const avg_ssr = Math.round((total / 6) * 100)

    const latitude = v.latitude || '0'
    const longitude = v.longitude || '90'
    const city = v.city ? v.city.replace("'", "\\'") : 'NULL'

    records.push({
      avg_ssr: avg_ssr.toString(),
      city: city,
      date_: date,
      latitude: latitude,
      longitude: longitude,
      meter_id: meter_id.toString(),
      total: total.toString()
    })

    // bulk_data.push([date, meter_id, avg_ssr, total, latitude, longitude, city])
  }

  const csvWriter = createObjectCsvWriter({
    header: [
      { id: 'date_', title: 'DATE_' },
      { id: 'meter_id', title: 'METER_ID' },
      { id: 'avg_ssr', title: 'AVG_SSR' },
      { id: 'total', title: 'TOTAL' },
      { id: 'latitude', title: 'LATITUDE' },
      { id: 'longitude', title: 'LONGITUDE' },
      { id: 'city', title: 'CITY' }
    ],
    path: join(files_path, `TESTE.csv`)
  })

  await csvWriter.writeRecords(records)

  await mysql.bulk(records)
  // console.log(count)
})()
