import { execSync } from 'child_process'
import { createLogger, format, transports } from 'winston'

// Get GMT Ex: -03
const gmt = execSync('date +"%Z"').toString().trim()

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'log/logger.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.align(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${gmt} [${level.toUpperCase()}]: ${message}`
        })
      )
    })
  ]
})

export { logger }
