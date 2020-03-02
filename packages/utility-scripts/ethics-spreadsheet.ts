// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node packages/utility-scripts/ethics-spreadsheet.ts
import { google } from 'googleapis';
import { EthicLevel, EthicTrigger, EthicScale, EthicTriggerKind } from '@sr2020/sr2020-models/scripts/character/ethics_library';
import uuid = require('uuid');
const sheets = google.sheets('v4');

class SpreadsheetProcessor {
  allCrysises: EthicTrigger[] = [];
  ethicLevels: EthicLevel[] = [];

  parseScale(s: string): EthicScale {
    if (s == 'МН') return 'violence';
    if (s == 'СК') return 'control';
    if (s == 'ГИ') return 'individualism';
    if (s == 'ЭР') return 'mind';
    throw new Error(`Unsupported ethic scale code: ${s}`);
  }

  parseKind(s: string): EthicTriggerKind {
    if (s == 'Принцип') return 'principle';
    if (s == 'Поступок') return 'action';
    if (s == 'Кризис') return 'crysis';
    throw new Error(`Unsupported ethic trigger kind: ${s}`);
  }

  generateId(): string {
    return uuid.v1();
  }

  parseTrigger(cells: string[]) {
    const description = cells[0];
    const kind = this.parseKind(cells[1]);
    const trigger: EthicTrigger = { id: this.generateId(), description, kind, crysises: [], shifts: [] };
    for (let i = 0; i < 4; ++i) {
      const unparsed: string | undefined = cells[2 + i];
      if (unparsed?.length) {
        const m1 = unparsed.match(/ДобавитьКризис\(#(\d+)\)/);
        if (m1) {
          trigger.crysises.push(Number(m1[1]));
          continue;
        }

        const m2 = unparsed.match(/СменитьСостояние\((.*)([\+-]\d+)\), если (.*) = \[(.*);(.*)\]/);
        if (m2) {
          if (m2[1] != m2[3]) throw new Error(`Changed scale != conditional scale: ${unparsed}`);
          trigger.shifts.push({
            change: Number(m2[2]),
            conditionMax: Number(m2[5]),
            conditionMin: Number(m2[4]),
            scale: this.parseScale(m2[1]),
          });
          continue;
        }

        const m3 = unparsed.match(/СменитьСостояние\((.*)([\+-]\d+)\)/);
        if (m3) {
          trigger.shifts.push({
            change: Number(m3[2]),
            conditionMax: 10,
            conditionMin: -10,
            scale: this.parseScale(m3[1]),
          });
          continue;
        }
      }
    }
    return trigger;
  }

  async run() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // https://docs.google.com/spreadsheets/d/1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A
    const spreadsheetId = '1BsdcTYZ4Kvv3oTB1bJsq5VfsLKhuFS5_cEOMV_CJggc';

    {
      // Parse level descriptions
      const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId, range: 'Сводка по  шкалам!B3:E11' });
      const data = response.data.values;
      if (!data) {
        throw new Error('Failed to get spreadsheet range');
      }
      const scales: EthicScale[] = ['violence', 'control', 'individualism', 'mind'];
      for (let i = 0; i < 4; ++i) {
        for (let l = -4; l <= 4; ++l) {
          const r = l + 4;
          this.ethicLevels.push({
            value: l,
            scale: scales[i],
            description: data[r][i],
            triggers: [],
          });
        }
      }
    }

    {
      // Parse level triggers
      const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId, range: 'Триггеры по шкалам!A2:H500' });
      const data = response.data.values;
      if (!data) {
        throw new Error('Failed to get spreadsheet range');
      }
      for (const r of data) {
        const scale = this.parseScale(r[0]);
        const value = Number(r[1]);
        const level = this.ethicLevels.find((l) => l.scale == scale && l.value == value);
        if (level) level.triggers.push(this.parseTrigger(r.slice(2)));
      }
    }

    {
      // Parse crysises
      const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId, range: 'Кризисные триггеры!A2:G500' });
      const data = response.data.values;
      if (!data) {
        throw new Error('Failed to get spreadsheet range');
      }
      for (const r of data) {
        if (r[0]?.length) {
          this.allCrysises.push(this.parseTrigger(r.slice(1)));
          if (r[0] != `#${this.allCrysises.length}`) throw new Error(`Unexpected crysis number: ${r[0]}`);
        }
      }
    }

    console.log(`export const kAllCrysises: EthicTrigger[] = ${JSON.stringify(this.allCrysises)};`);
    console.log(`export const kEthicLevels: EthicLevel[] = ${JSON.stringify(this.ethicLevels)};`);
  }
}

new SpreadsheetProcessor().run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
