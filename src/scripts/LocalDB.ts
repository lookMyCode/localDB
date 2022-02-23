import { v4 as uuidv4 } from 'uuid';

import { RealTypeService } from './libs/real-type';
import TableColumn from './dtos/TableColumn';
import { LocalStoreService } from './libs/local-store';
import { ITable, IDB, IAnyObj, ITableRow, ITableItemToInsert, ISelectItem, ITableForSelectRow, ISelectConfig, IJoinConfig } from './models/interfaces';
import TableForSelect from './dtos/TableForSelect';
import SelectBuilder from './SelectBuilder';


const PREFIX = '__LocalDB__';

export default class LocalDB {
  private prefix: string = PREFIX;
  declare private name: string;

  private realType = new RealTypeService();
  private localStore = new LocalStoreService();

  constructor(config: {name: string}) {
    if (LocalDB.issetDB(config.name)) throw new Error(`Database "${config.name}" already exist`);
    this.name = config.name;
    this.setDB({tables: []});
  }

  static issetDB(name: string): boolean {
    const localStore = new LocalStoreService();
    return !!localStore.getItem(`${PREFIX}${name}`);
  }

  static removeDB(name: string): void {
    const localStore = new LocalStoreService();
    localStore.removeItem(`${PREFIX}${name}`);
  }

  get dbName(): string {
    return `${this.prefix}${this.name}`;
  }

  get db(): IDB {
    return this.localStore.getItem(this.dbName);
  }

  public createTable(config: ITable) {
    if (this.issetTable(config?.name)) throw new Error(`Table "${config?.name}" already is created`);

    this.addTable(config);
  }

  public createTableIfNotExist(config: ITable) {
    if (!this.issetTable(config?.name)) {
      this.addTable(config);
    }
  }

  public remove(tableName: string, whereFunc: Function = () => false): ITableRow[] {
    if (!this.issetTable(tableName)) throw new Error(`Table "${tableName}" is not exist`);

    let table = this.getTable(tableName);
    const tableRows: ITableRow[] = table.rows;
    const rows: ITableRow[] = [];
    const removedRows: ITableRow[] = [];

    for (let i = 0, len = tableRows.length; i < len; i++) {
      const row = tableRows[i];
      if (!whereFunc.call(null, row)) {
        rows.push(row);
      } else {
        removedRows.push(row);
      }
    }

    table.rows = rows;

    this.replaceTable(table);

    return removedRows;
  }

  public insert(tableName: string, values: IAnyObj): IAnyObj {
    if (!this.issetTable(tableName)) throw new Error(`Table "${tableName}" is not exist`);

    const table = this.getTable(tableName);
    const tableCols = table.columns;
    const items: ITableItemToInsert[] = [];
    const row: IAnyObj = {};

    for (let i = 0, len = tableCols.length; i < len; i++) {
      items.push({
        ...tableCols[i],
        value: undefined
      });
    }

    for (let k in values) {
      const item = items.find(x => x.name === k);
      if (!item) continue;

      item.value = values[k];
    }
    
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      
      if (item.value === undefined && item.default !== undefined) item.value = item.default;
      if (item.required && item.value === undefined) throw new Error(`"${item.name}" is required`);
      if (item.value === undefined && this.realType.getType(item.value) !== item.type) item.value = undefined;
      if (item.value !== undefined && this.realType.getType(item.value) !== item.type) throw new Error(`"${item.name}" has type "${this.realType.getType(item.value)}", but must have the "${item.type}"`);
      row[item.name] = item.value;
    }

    row._id = uuidv4();
    table.rows.push(row);
    this.replaceTable(table);

    return row;
  }

  public update(tableName: string, values: IAnyObj, whereFunc: Function): IAnyObj[] {
    if (!this.issetTable(tableName)) throw new Error(`Table "${tableName}" is not exist`);
    if (values._id) throw new Error('"_id" do not allow to change');

    const table = this.getTable(tableName);
    const tableCols = table.columns;
    const tableRows = table.rows;
    const tempValues: IAnyObj = {};

    for (let k in values) {
      if (tableCols.map(col => col.name).includes(k)) {
        tempValues[k] = values[k];
      }
    }

    values = JSON.parse(JSON.stringify(tempValues));

    const items: ITableItemToInsert[] = [];
    
    for (let i = 0, len = tableCols.length; i < len; i++) {
      const tableCol = tableCols[i];
      if (Object.keys(values).includes(tableCol.name)) {
        items.push({
          ...tableCol,
          value: undefined
        });
      }
    }

    for (let k in values) {
      const item = items.find(x => x.name === k);
      if (!item) continue;

      item.value = values[k];
    }
    
    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      
      if (item.value === undefined && item.default !== undefined) item.value = item.default;
      if (item.required && item.value === undefined) throw new Error(`"${item.name}" is required`);
      if (item.value === undefined && this.realType.getType(item.value) !== item.type) item.value = undefined;
      if (item.value !== undefined && this.realType.getType(item.value) !== item.type) throw new Error(`"${item.name}" has type "${this.realType.getType(item.value)}", but must have the "${item.type}"`);
    }

    const selectedRows: IAnyObj[] = [];
    const rows: IAnyObj[] = [];
    
    for (let i = 0, len = tableRows.length; i < len; i++) {
      const x = tableRows[i];
      if (whereFunc.call(null, x)) {
        selectedRows.push(x);
      }
    }
    
    for (let i = 0, len = selectedRows.length; i < len; i++) {
      rows.push({
        ...selectedRows[i],
        ...values
      });
    }
    
    for (let i = 0, l1 = rows.length; i < l1; i++) {
      const row = rows[i];

      for (let j = 0, l2 = tableRows.length; j < l2; j++) {
        if (tableRows[j]._id === row._id) {
          tableRows[j] = {...row}
        }
      }
    }
    
    this.replaceTable(table);

    return rows;
  }

  public select(selectConfig: ISelectConfig) {
    return new SelectBuilder(this).select(selectConfig);
  }

  private setDB(db: IDB) {
    this.localStore.setItem(this.dbName, {tables: db.tables});
  }

  private issetTable(table: string): boolean {
    return !!this.db.tables.find(x => x.name === table);
  }

  private addTable(config: ITable) {
    if (!config.name) throw new Error('Table name is required');
    if (!config?.columns.length) throw new Error('Columns not found');

    const {columns} = config;

    for (let k in columns) {
      const tableColumn = new TableColumn(columns[k]);

      if (tableColumn.default && tableColumn.type !== this.realType.getType(tableColumn.default)) {
        throw new Error('"default" must have type as "type"');
      }
    }

    const db = this.db;
    db.tables.push(config);
    this.setDB(db);
  }

  private getTable(name: string): ITable | undefined {
    let table: ITable | undefined;
    const tables = this.db.tables;

    for (let i = 0, len = tables.length; i < len; i++) {
      if (table) break;
      if (tables[i].name === name) {
        table = tables[i];
        break;
      }
    }

    return table;
  }

  private replaceTable(table: ITable) {
    const db = this.db;
    db.tables = db.tables.filter(x => x.name !== table.name);
    db.tables.push(table);
    this.setDB(db);
  }
}