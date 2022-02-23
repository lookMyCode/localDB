import LocalDB from "./scripts/LocalDB";

LocalDB.removeDB('test')
if (!LocalDB.issetDB('test')) {
  const db = new LocalDB({name: 'test'});
  db.createTable({
    name: 'users', 
    rows: [],
    columns: [
      {
        name: 'name',
        type: 'string',
        required: true
      },
      {
        name: 'surname',
        type: 'string',
        required: true
      },
      {
        name: 'accept',
        type: 'boolean',
        required: true,
        default: true,
      },
      {
        name: 'age',
        type: 'number',
        required: false
      }
    ]
  });

  db.createTable({
    name: 'products', 
    rows: [],
    columns: [
      {
        name: 'name',
        type: 'string',
        required: true
      },
      {
        name: 'price',
        type: 'number',
        required: true
      },
      {
        name: 'currency',
        type: 'string',
        required: true
      },
      {
        name: 'user_id',
        type: 'string',
        required: true,
      },
    ]
  });

  db.insert('users', {
    name: 'Dima',
    surname: 'Medynskyi',
    accept: false,
    age: 28
  });
  
  const d = db.insert('users', {
    name: 'Dima',
    surname: 'Medynskyi',
    accept: true,
    age: 28
  });

  //db.remove('users', x => !x.accept);
  
  let m = db.insert('users', {
    name: 'Maks',
    surname: 'Medynskyi',
    accept: true,
    age: 22
  });

  db.insert('users', {
    name: 'Maryna',
    surname: 'Medynska',
    accept: true,
    age: 30
  });

  m = db.update(
    'users',
    {name: 'Maksim'},
    x => (x.name as string).toLowerCase() === 'maks'
  )[0];

  db.insert('products', {
    name: 'Product1',
    price: 100,
    currency: 'PLN', 
    user_id: d._id
  });

  db.insert('products', {
    name: 'Product2',
    price: 120,
    currency: 'PLN', 
    user_id: m._id
  });

  db.insert('products', {
    name: 'Product3',
    price: 150,
    currency: 'PLN', 
    user_id: 'test'
  });

  const data = db
    .select({
      table: 'users',
      keys: '*'
    })
    .where(x => x.surname.value.substring(0, 1).toLowerCase() === 'm')
    .leftJoin({
      table: 'products',
      keys: [
        {key: 'name', as: 'product_name'},
        {key: 'price'},
        {key: 'currency'},
      ],
      mainTableKey: '_id',
      joinTableKey: 'user_id'
    })
    .filter(['_id', 'name', 'surname', 'product_name', 'price', 'currency', 'accept'])
    .orderBy('accept', false)
    .exec();
  console.log(data)
}