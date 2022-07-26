"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const csv_writer_1 = require("csv-writer");
const fs_1 = require("fs");
const path_1 = require("path");
const args_validation_1 = require("./functions/args_validation");
const check_device_id_1 = require("./functions/check_device_id");
const date_validation = __importStar(require("./functions/date_validation"));
const logger_1 = require("./functions/logger");
const read_csv_1 = require("./functions/read_csv");
process.on('uncaughtException', err => {
    if (err.stack !== undefined)
        logger_1.logger.error(err.stack);
    else
        logger_1.logger.error(`${err.name}: ${err.message}`);
    process.exit(1);
});
const args = (0, args_validation_1.args_validation)(process.argv.slice(2), logger_1.logger);
const date = args.date;
/* const files_path: string = path.dirname(__filename) */
const files_path = '/workspaces/typescript-backend-sample/files'; // Dir where is commissioning_report.csv files
date_validation.check_date_format(date, logger_1.logger);
/*
 * ['2022-01-01', '2022-01-02', '2022-01-03', '2022-01-04', ...]
 */
const date_range = date_validation.generate_date_range(date);
(async () => {
    const counter = {};
    for (const d of date_range) {
        const csv_file_path = (0, path_1.join)(files_path, `${d}_success_reading_rate_tou.csv`);
        if (!(0, fs_1.existsSync)(csv_file_path)) {
            logger_1.logger.error(`${d}_success_reading_rate_tou.csv file does not exists`);
            continue;
        }
        const meters_ids = {};
        const csv_content = await (0, read_csv_1.read_csv)(csv_file_path);
        let i = csv_content.length;
        while (i--) {
            const row = csv_content[i];
            let meter_id = row['METER_ID'];
            const success_rate = row['SUCCESS_RATE'].trim();
            const whitelisted = row['WHITELISTED'].toLowerCase() == 'yes' ? true : false;
            const res_check_device_id = (0, check_device_id_1.check_device_id)(meter_id);
            if (res_check_device_id === false)
                continue;
            if (meters_ids[res_check_device_id] !== undefined)
                continue;
            meters_ids[res_check_device_id] = true;
            meter_id = res_check_device_id;
            let point;
            if (success_rate != '0.0')
                point = 1;
            else
                point = 0;
            if (counter[meter_id] !== undefined)
                counter[meter_id].points = counter[meter_id].points + point;
            else
                counter[meter_id] = { points: point, whitelisted: whitelisted };
        }
    }
    const records = [];
    for (const [k, v] of Object.entries(counter)) {
        const meter_id = k;
        const total = v.points;
        const avg_ssr = Math.round((total / 6) * 100).toFixed(2);
        const whitelisted = v.whitelisted;
        records.push({
            meter_id: meter_id,
            avg_ssr: avg_ssr,
            total: total,
            whitelisted: whitelisted
        });
    }
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: (0, path_1.join)(files_path, `TESTE.csv`),
        header: [
            { id: 'meter_id', title: 'METER_ID' },
            { id: 'avg_ssr', title: 'AVG_SSR' },
            { id: 'total', title: 'TOTAL' },
            { id: 'whitelisted', title: 'WHITELISTED' }
        ]
    });
    await csvWriter.writeRecords(records);
    // console.log(count)
})();
//# sourceMappingURL=index.js.map