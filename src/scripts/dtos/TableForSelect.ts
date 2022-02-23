import { ITable, ITableForSelectRow, ITableRow } from './../models/interfaces';
import TableColumn from './TableColumn';

export default class TableForSelect {
  rows: ITableForSelectRow[] = [];

  constructor(table: ITable) {
    const tableRows: ITableRow[] = table.rows;
    const tableCols: TableColumn[] = table.columns;
    const rows: ITableForSelectRow[] = [];

    for (let i = 0, l1 = tableRows.length; i < l1; i++) {
      const tableRow = tableRows[i];
      const row: ITableForSelectRow = {};
      
      for (let k in tableRow) {
        let tableCol;

        for (let j = 0, l2 = tableCols.length; j < l2; j++) {
          const x = tableCols[j];

          if (x.name === k || k === '_id') {
            tableCol = x;
          }
        }

        if (!tableCol) continue;

        row[k] = {
          value: tableRow[k],
          type: tableCol.type
        }
      }

      rows.push(row);
    }

    this.rows = rows;
  }
}