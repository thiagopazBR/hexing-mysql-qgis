import moment from 'moment'
import { Logger } from 'winston'

export const check_date_format = (d: string, logger: Logger, date_format = 'YYYY-MM-DD'): void => {
  if (!moment(d, date_format, true).isValid()) {
    logger.error(`Incorrect date format. It should be ${date_format}. Given: ${d}`)
    process.exit(1)
  }
}

/**
 * @param startDate The start date
 * @param endDate The end date
 */
export const generate_date_range = (startDate: string, date_format = 'YYYY-MM-DD'): string[] => {
  const fromDate = moment(startDate).subtract(6, 'days')
  const toDate = moment(startDate).subtract(1, 'days')
  const diff = toDate.diff(fromDate, 'days') + 1

  const range: Array<string> = []

  for (let i = 0; i < diff; i++) {
    const d = <string>moment(fromDate).add(i, 'days').format(date_format)
    range.push(d)
  }

  return range
}
