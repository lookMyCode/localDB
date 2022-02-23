export type RealType = 'undefined' | 'bigint' | 'boolean' | 'string' | 'symbol' | 'function' | 'number' | 'NaN' | 'Infinity' | 'object' | 'null' | 'array';

export class RealTypeService {

  constructor() {}

  getType(item: any): RealType {
    if( ['undefined', 'bigint', 'boolean', 'string', 'symbol', 'function'].includes(typeof item) ) {
      return typeof item;
    } else if(typeof item === 'number') {
      return isNaN(item) ? 'NaN' : !isFinite(item) ? 'Infinity' : typeof item;
    } else if(typeof item === 'object') {
      return item === null ? 'null' : Array.isArray(item) ? 'array' : typeof item;
    } else {
      throw new Error('Type error');
    }
  }

  isUndefined(item: any): boolean {
    return this.getType(item) === 'undefined';
  }

  isNull(item: any): boolean {
    return this.getType(item) === 'null';
  }

  isBoolean(item: any): boolean {
    return this.getType(item) === 'boolean';
  }

  isNumber(item: any): boolean {
    return this.getType(item) === 'number';
  }

  isInfinity(item: any): boolean {
    return this.getType(item) === 'Infinity';
  }

  isNaN(item: any): boolean {
    return this.getType(item) === 'NaN';
  }

  isBigInt(item: any): boolean {
    return this.getType(item) === 'bigint';
  }

  isString(item: any): boolean {
    return this.getType(item) === 'string';
  }

  isFunction(item: any): boolean {
    return this.getType(item) === 'function';
  }

  isArray(item: any): boolean {
    return this.getType(item) === 'array';
  }

  isObject(item: any): boolean {
    return this.getType(item) === 'object';
  }

  isSymbol(item: any): boolean {
    return this.getType(item) === 'symbol';
  }
}