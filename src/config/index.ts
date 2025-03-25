import { Console } from "console";
import fs from 'fs';

export default () => {
  const pick_sys_path = ([path_to_windows, path_to_linux]) => {

    if (process.platform === 'win32') {
      return `${process.cwd()}${path_to_windows}`;
    };
    if (process.platform === 'linux') {
      return `${process.cwd()}${path_to_linux}`;
    };
    console.error("system environment is not supported by application");
    return process.exit(1);
  };


  const env = {
    aging: {
      maxFileCount: process.env.MAX_FILE_COUNT || 80,
    },
    scheduler: {
      retryTime: process.env.RETRY_TIME || "5",
      interval: process.env.INTERVAL || "86400000",
    },
    projectionRulePath: process.env.EXCEL_PROJECTIOIN_RULE_PATH || pick_sys_path(['\\projection-rule.json', '/projection-rule.json']),
    chrome: {
      executablePath: process.env.CHROME_EXECUTABLE_PATH || pick_sys_path(['\\chrome\\chrome-win', '/chrome/chrome-linux/chrome']),
      downloadPath: process.env.CSV_DOWNLOAD_PATH || pick_sys_path([`\\csv_download\\`, '/csv_download/']),
      headless: !!process.env.CHROME_RUNTIME_HEADLESS || false,
    },
    example_website: {
      url: ''https://example.com/admin',
        username: process.env.example_website_USERNAME,
      password: process.env.example_website_PASSWORD,
    },
    wp: {
      url: 'https://example.com/admin',
      username: process.env.WP_USERNAME,
      password: process.env.WP_PASSWORD,
    },
  };
  const views = [
    {
      viewName: 'XXX',
      as: 'Report-XXX.csv',
      destSheetName: 'WCB-XXX',
      // wpItem: '3024',
      wpItem: '4968',
    },
    {
      viewName: 'XXX_XXX',
      as: 'Report-XXX.csv',
      destSheetName: 'XXX-XXX',
      // wpItem: '1210',
      wpItem: '4969',
    },
    {
      viewName: 'XXX_XXX',
      as: 'Report-XXX.csv',
      destSheetName: 'XXX-XXX',
      // wpItem: '1213',
      wpItem: '4970',
    },
  ];
  const downloadConfig = {
    views,
    all: {
      destSheetName: 'XXX-ALL',
      // wpItem: '1189',
      wpItem: '4932',
    },
  };
  return { env, downloadConfig };
};
