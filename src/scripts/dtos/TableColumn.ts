import { RealType } from "../libs/real-type"

export default class TableColumn {
  name: string;
  type: RealType;
  default?: any;
  required: boolean = false;
  comment?: string = '';

  constructor(config: TableColumn) {
    if (!config.name) throw new Error('Param "name" is required');
    if (!config.type) throw new Error('Param "name" is required');

    this.name = config.name;
    this.type = config.type;
    this.default = config.default;
    this.required = config.required || false;
    this.comment = config.comment || '';
  }
}