import { Logger } from 'winston'
import yargs from 'yargs/yargs'

import { IArgs } from '../interfaces/IArgs'

const check_args = (args: string[], logger: Logger): IArgs | Promise<IArgs> => {
  const argv = yargs(args)
    .options({
      date: {
        alias: 'd',
        demandOption: true,
        describe: 'Date. Format "YYYY-MM-DD"',
        type: 'string'
      }
    })
    .fail(msg => {
      logger.error(`${msg.toString().replace('\n', '').trim()}`)
      process.exit(1)
    })
    .example([['$0 --date "YYYY-MM-DD"']]).argv

  return argv
}

const args_validation = (args: string[], logger: Logger) => {
  const output = check_args(args, logger) as IArgs
  return output
}

export { args_validation }
