import TableColumn from '../dtos/TableColumn';
import { RealType } from '../libs/real-type';

export interface IDB {
  tables: ITable[]
}

export interface ITableRow {
  [name: string]: any
}

export interface ITable {
  name: string,
  columns: TableColumn[],
  rows: ITableRow[]
}

export interface IAnyObj {
  [key: string]: any
}

export interface ITableItemToInsert extends TableColumn {
  value: any
}

export interface ITableForSelectRow {
  [name: string]: {
    value: any,
    type: RealType,
  }
}

export interface ISelectConfigKey {
  key: string,
  as?: string
}

export interface ISelectItem extends ISelectConfigKey {
  table: string,
}

export interface ISelectConfig {
  keys: ISelectConfigKey[] | '*',
  table: string
}

export interface IJoinConfig extends ISelectConfig {
  keys: ISelectConfigKey[],
  mainTableKey: string,
  joinTableKey: string,
}