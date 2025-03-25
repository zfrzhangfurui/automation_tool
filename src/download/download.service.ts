import { resolve } from 'path';
import { mkdirSync, renameSync, writeFileSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Browser, Page } from 'puppeteer-core';
import * as sleep from 'sleep-promise';
import { createId } from '@paralleldrive/cuid2';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';


import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class DownloadService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) readonly logger: Logger
  ) { }
  async tempPath() {
    const basePath = await this.configService.get('env.chrome.downloadPath');
    this.logger.info(`======basePath: ${basePath}`);
    const cuid = createId();
    const fullpath = resolve(basePath, cuid);
    return fullpath;
  }

  async handleDownload(page: Page, viewName: string) {
    this.logger.info(`===== downloading... name: ${viewName}`);
    if (!viewName) {
      return;
    }
    const iframeHandle = await page.waitForSelector('app-workbook iframe');
    const frame = await iframeHandle.contentFrame();
    await frame.hover('div.toolbar-item.insights');
    await sleep(500);
    const customviewsBtn = await frame.waitForSelector(
      'div.toolbar-item.insights',
      {
        timeout: 50000,
      },
    );
    await customviewsBtn.click();
    await sleep(5000);
    const spansSelector = `xpath///span[starts-with(@title, "${viewName}")]/../..`;
    this.logger.info(`====${spansSelector}`);
    await frame.waitForSelector(spansSelector, { timeout: 50000 });
    await sleep(5000);
    const span = (await frame.$$(spansSelector))[0];
    await span.click();
    await sleep(10000);
    const downloadBtnSelector = 'div.toolbar-item.collaborate button';
    await frame.hover(downloadBtnSelector);
    await sleep(500);
    await frame.click(downloadBtnSelector);
    await sleep(500);

    const dataDiv = await frame.waitForSelector(
      'div[data-tb-test-id="download-flyout-download-crosstab-MenuItem"]',
      { timeout: 10000 },
    );

    await dataDiv.click();
    await sleep(500);
    const radio = await frame.waitForSelector(
      'input[data-tb-test-id="crosstab-options-dialog-radio-csv-RadioButton"]',
      { timeout: 10000 },
    );

    await sleep(3000);
    await radio.click();
    await sleep(3000);
    const finalDownloadBtnSelector =
      'button[data-tb-test-id="export-crosstab-export-Button"]';
    const finalDownloadBtn = await frame.waitForSelector(
      finalDownloadBtnSelector,
      { timeout: 10000 },
    );

    await finalDownloadBtn.click();
    this.logger.info(`=====> name: ${viewName} downloaded`);
    await sleep(1000);
  }

  download(): (browser: Browser) => Promise<void> {
    return this._download.bind(this);
  }

  async _download(browser: Browser) {
    const page = await browser.newPage();
    const client = await page.createCDPSession();
    const downloadPath = await this.tempPath();
    mkdirSync(downloadPath, { recursive: true });
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath,
    });
    const { url, username, password } = await this.configService.get(
      'env.example_website',
    );

    // const url = "https://www.example_websiteview.com.au/";
    // const username = "mark@freedomlend.com.au";
    // const password = "GHC5ahg5bwk-zgw!yqp";
    await page.goto(url);
    await page.waitForSelector('.amplify-input');
    await page.type('input[name="username"]', username);
    await sleep(500);
    await page.type('input[name="password"]', password);
    this.logger.info("======== entring username and password");
    await sleep(2000);
    await page.click('button[type="submit"]');
    const homeloansSelector = 'img[src="./assets/icons/home_loan.svg"]';
    await page.waitForSelector(homeloansSelector, { timeout: 5_000 }).catch(err => {
      return Error(err + "maybe the wrong password");
    })
    const btn = await page.$(homeloansSelector);
    await btn.evaluate((dd) => console.log(`======dd btnP: ${dd}`));
    let cc = await btn.evaluate((dd) => {
      console.log(`======dd btnP: ${dd}`);
      return dd;
    });
    // console.log("=== " + cc);
    (await btn.$$('xpath/..'))[0].click();
    await page.waitForNavigation({ timeout: 6000 });
    const tabDeepSelector = 'div[id="dropdownMenuButton-Deep Dive Analysis"]';
    await page.hover(tabDeepSelector);
    await sleep(250);
    const designYourOwn = (
      await page.$$('xpath///span[contains(text(), "Design Your Own")]/..')
    )[0];
    await designYourOwn.evaluate((dd) => console.log(`======dd btnP: ${dd}`));
    await designYourOwn.click();
    await sleep(10000);
    const views = await this.configService.get('downloadConfig.views');
    for (const { viewName, as } of views) {
      await this.handleDownload(page, viewName);
      this.logger.info(`finish download : ${viewName}`);
      // return process.exit(1);
      renameSync(
        resolve(downloadPath, 'Report.csv'),
        resolve(downloadPath, as),
      );
    }
  }
}
