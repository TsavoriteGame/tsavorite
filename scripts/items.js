
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

// TODO: validate items

const allItems = [];

const loadItems = async () => {
  const files = await readdir('content/items', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allItems.push(...data);
  });

  const sortedItems = sortBy(allItems, item => item.name);

  fs.writeFileSync('content/items/items.json', JSON.stringify(sortedItems));
};

loadItems();

