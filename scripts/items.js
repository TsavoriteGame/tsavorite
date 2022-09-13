
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');

const allItems = [];

const loadItems = async () => {
  const files = await readdir('content/items', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allItems.push(...data);
  });

  fs.writeFileSync('content/items/items.json', JSON.stringify(allItems));
};

loadItems();

