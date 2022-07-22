import 'dotenv/config'

import { args_validation } from './functions/args_validation'
import * as date_validation from './functions/date_validation'
import { logger } from './functions/logger'

process.on('uncaughtException', err => {
  console.log('xx')
  if (err.stack !== undefined) logger.error(err.stack)
  else logger.error(`${err.name}: ${err.message}`)
  process.exit(1)
})

const args = args_validation(process.argv.slice(2), logger)

const date = args.date

/* const files_path: string = path.dirname(__filename) */
// const files_path = '/usr/src/app/files' // Dir where is commissioning_report.csv files

date_validation.check_date_format(date, logger)

/*
 * ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', ...]
 */
const date_range = date_validation.generate_date_range(date)
console.log(date_range)
;(async () => {
  // const mssql = new Mssql()
  // await mssql.init(target_script, logger)
  // for (const date of date_range) {
  //   let check_if_it_has_records_this_day = await mssql.query(
  //     `
  //     SELECT TOP 1 DATE_
  //     FROM ${process.env.CUSTOMER}_${target_script.toUpperCase()}
  //     WHERE DATE_ = '${date}'
  //   `,
  //     date
  //   )
  //   if (check_if_it_has_records_this_day['recordset'].length > 0) {
  //     let msg = `index.ts - ${target_script} - It has already records for day ${date} on `
  //     msg += `${process.env.CUSTOMER}_${target_script.toUpperCase()} table.`
  //     logger.error(msg)
  //     continue
  //   }
  //   const csv_file_path = get_filename(date, target_script, files_path)
  //   if (!existsSync(csv_file_path)) {
  //     logger.error(
  //       `index.ts - ${target_script} - ${date}_${target_script}.csv file does not exists`
  //     )
  //     continue
  //   }
  //   const csv_content = await read_csv(csv_file_path)
  //   const table_for_bulk = prepare_bulk[target_script](csv_content)
  //   await mssql.bulk(table_for_bulk, date)
  // }
  // mssql.close()
})()
