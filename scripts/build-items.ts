const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allItems = [];

const itemNames = {};

const assignItemIds = () => {
  allItems.forEach((item) => {
    let id = item.name.split(' ').join('') + '-1';

    if(itemNames[id]) {
      let i = 1;
      do {
        id = `${item.name.split(' ').join('')}-${i}`;
        i++;
      } while(itemNames[id]);
    }

    item.id = id;
    itemNames[id] = true;
  });
};

const loadItems = async () => {
  const files = await readdir('content/data/items', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allItems.push(...data);
  });

  assignItemIds();

  const sortedItems = sortBy(allItems, item => item.name);
  fs.writeFileSync('content/data/items/items.json', JSON.stringify(sortedItems));
};

loadItems();

console.log('☑ Items loaded.');

