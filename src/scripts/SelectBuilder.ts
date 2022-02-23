import { RealType } from './libs/real-type';
import TableForSelect from "./dtos/TableForSelect";
import LocalDB from "./LocalDB";
import { IJoinConfig, ISelectConfig, ITableForSelectRow } from "./models/interfaces";


export default class SelectBuilder {
  localDB: LocalDB;
  tables: {[key: string]: TableForSelect} = {};
  result: ITableForSelectRow[] = [];

  constructor(localDB: LocalDB) {
    this.localDB = localDB;

    const db = this.localDB.db;
    const tables = db.tables;

    for (let i = 0, len = tables.length; i < len; i++) {
      const x = tables[i];
      this.tables[x.name] = new TableForSelect(x);
    }
  }

  public select(selectConfig: ISelectConfig): SelectBuilder {
    const tableRows = this.tables[selectConfig.table].rows;
    const fields = selectConfig.keys;
    const resultRows: ITableForSelectRow[] = [];

    for (let i = 0, l1 = tableRows.length; i < l1; i++) {
      const row = tableRows[i];
      const resultRow: ITableForSelectRow = {};

      if (fields === '*') {
        for (let k in row) {
          resultRow[k] = row[k];
        }
      } else {
        for (let j = 0, l2 = fields.length; j < l2; j++) {
          const field = fields[j];
          let {key, as} = field;
          const value = row[key];
          as = as ? as : key;
          resultRow[as] = value;
        }
      }

      resultRows.push(resultRow);
    }

    this.result = JSON.parse(JSON.stringify(resultRows));
    return this;
  }

  public where(whereFunc: Function): SelectBuilder {
    const result: ITableForSelectRow[] = this.result;
    const filteredResult: ITableForSelectRow[] = [];

    for (let i = 0, len = result.length; i < len; i++) {
      const x = result[i];
      if (whereFunc.call(null, x)) filteredResult.push(x);
    }

    this.result = JSON.parse(JSON.stringify(filteredResult));

    return this;
  }

  public leftJoin(joinConfig: IJoinConfig): SelectBuilder {
    const result: ITableForSelectRow[] = JSON.parse(JSON.stringify(this.result));
    const tableRows = this.tables[joinConfig.table].rows;
    const fields = joinConfig.keys;

    for (let i = 0, l1 = result.length; i < l1; i++) {
      const mainTableItem = result[i];
      let found: boolean = false;

      for (let j = 0, l2 = tableRows.length; j < l2; j++) {
        if (found) break;

        const joinTableItem = tableRows[j];
        found = mainTableItem[joinConfig.mainTableKey].value === joinTableItem[joinConfig.joinTableKey].value;
        if (found) {
          for (let k = 0, l3 = fields.length; k < l3; k++) {
            const field = fields[k];
            const as = field.as ? field.as : field.key;
            mainTableItem[as] = joinTableItem[field.key];
          }
          
          break;
        }
      }

      result[i] = mainTableItem;
    }

    this.result = JSON.parse(JSON.stringify(result));
    return this;
  }

  filter(keys: string[]): SelectBuilder {
    const result: ITableForSelectRow[] = [];

    for (let i = 0, l1 = this.result.length; i < l1; i++) {
      const x: ITableForSelectRow = {};

      for (let j = 0, l2 = keys.length; j < l2; j++) {
        const key = keys[j];
        x[key] = this.result[i][key];
      }

      result.push(x);
    }

    this.result = JSON.parse(JSON.stringify(result));
    return this;
  }

  orderBy(key: string, desc: boolean = false): SelectBuilder {
    const t: RealType | null | undefined = this.getKeyType(key);

    if (t === 'number' || t === 'bigint') {

    }

    if (t === 'string' || t === 'number' || t === 'bigint') {
      this.result = this.result.sort((a, b) => {
        const descInt: number = desc ? -1 : 1;
        if (a[key]?.value > b[key]?.value) return descInt;
        if (a[key]?.value < b[key]?.value) return -1 * descInt;
        return 0;
      });
    }

    if (t === 'boolean') {
      this.result = this.result.sort((a, b) => {
        const descInt: number = desc ? -1 : 1;
        if (a[key].value && !b[key].value) return descInt;
        if (!a[key].value && b[key].value) return -1 * descInt;
        return 0;
      });
    }

    return this;
  }

  public exec(): any[] {
    const result: any[] = [];

    for (let i = 0, len = this.result.length; i < len; i++) {
      const x = this.result[i];
      const y: any = {};

      for (let k in x) {
        y[k] = x[k].value;
      }

      result.push(y);
    }

    return result;
  }

  public count(): number {
    return this.result.length;
  }

  public avg(key: string): number | null {
    const t: RealType | null | undefined = this.getKeyType(key);
    if (t !== 'number' && t !== 'bigint') return null;

    const arr: (number|bigint)[] = [];
    let sum: number|bigint = 0;
    
    for (let i = 0, len = this.result.length; i < len; i++) {
      const x = this.result[i][key]?.value || 0;
      arr.push(x);
      sum += x;
    }

    return sum / arr.length
  }

  public min(key: string): number | null {
    const t: RealType | null | undefined = this.getKeyType(key);
    if (t !== 'number' && t !== 'bigint') return null;

    return Math.min(...this.result.map(x => x[key].value || 0));
  }

  public max(key: string): number | null {
    const t: RealType | null | undefined = this.getKeyType(key);
    if (t !== 'number' && t !== 'bigint') return null;

    return Math.max(...this.result.map(x => x[key].value || 0));
  }

  private getKeyType(key: string): RealType | null | undefined {
    let x: any;

    for (let i = 0, len = this.result.length; i < len; i++) {
      if (x) break;

      if (this.result[i][key]) {
        x = this.result[i];
        break;
      }
    }

    return x[key]?.type;
  }
}