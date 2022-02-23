import { RealType, RealTypeService } from './real-type';

interface IStorage {
  type: RealType,
  value: any
}

export class LocalStoreService {
  declare private storage: {[key: string]: IStorage} | null;
  private readonly __STORAGE: string = '__storage';

  private realType = new RealTypeService();

  private ls = window.localStorage;
  constructor() {
    this.getStorage();
  }

  setItem(key: string, value: any): void {
    this.storage = this.storage || {};
    if (this.realType.isFunction(value)) {
      console.error('Value must be not a function');
      return;
    }

    const val: IStorage = {
      type: this.realType.getType(value),
      value
    }
    
    this.storage[key] = JSON.parse(JSON.stringify(val));
    this.saveStorage();
  }

  getItem(key: string): any {
    try {
      const value = this.getValue(key);
      if (value) {
        return value;
      }

      this.storage = JSON.parse(this.ls.getItem(this.__STORAGE) as string);
      return this.getValue(key);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  removeItem(key: string) {
    this.storage = this.storage || {};
    delete this.storage[key];
    this.saveStorage();
  }

  clear() {
    this.storage = null;
    this.saveStorage();
  }

  clearAll() {
    this.ls.clear();
  }

  saveStorage() {
    this.storage = this.storage || {};
    this.ls.setItem(this.__STORAGE, JSON.stringify(this.storage));
  }

  getValue(key: string): any {
    this.storage = this.storage || {};
    try {
      if (this.storage[key]) {
        if (this.storage[key].type === 'NaN') return NaN;

        if (this.storage[key].type === 'Infinity') {
          if (this.realType.isInfinity(this.storage[key].value)) return this.storage[key].value;
          if (!this.realType.isString(this.storage[key].value)) throw new Error('Unknown error (Infinity)');
          if (this.storage[key].value === 'Infinity') return Infinity;
          if (this.storage[key].value === '-Infinity') return -Infinity;
          throw new Error('Unknown error (Infinity)');
        }

        if (this.storage[key].type === 'boolean') {
          if (this.realType.isBoolean(this.storage[key].value)) return this.storage[key].value;
          if (this.storage[key].value === 'true') return true;
          if (this.storage[key].value === 'false') return false;
          throw new Error('Unknown error (boolean)');
        }

        if (this.storage[key].type === 'null') return null;
        if (this.storage[key].type === 'undefined') return undefined;

        return this.storage[key].value;
      }
    } catch (err) {
      console.error('Error in getValue');
      console.error(err);
      return undefined;
    }
  }

  getStorage(): {[key: string]: IStorage} {
    try {
      this.storage = JSON.parse(this.ls.getItem(this.__STORAGE) as string) || {};
    } catch (_) {
      this.storage = {};
    }
    
    return this.storage!;
  }
}