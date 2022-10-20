
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy, isString } = require('lodash');

const items = require('../content/data/items/items.json');

const allBackgrounds = [];

const fillBackgrounds = () => {
  allBackgrounds.forEach(item => {
    Object.keys(item.body).forEach(bodyKey => {
      const itemRef = item.body[bodyKey];
      if(isString(itemRef)) {
        item.body[bodyKey] = items.find(i => i.id === itemRef);
        if(!item.body[bodyKey]) {
          throw new Error(`Monster ${item.name} body is referencing invalid item "${itemRef}"`);
        }

        return;
      }
    });
  });
};

const loadBackgrounds = async () => {
  const files = await readdir('content/data/backgrounds', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allBackgrounds.push(data);
  });

  fillBackgrounds();

  const sortedItems = sortBy(allBackgrounds, item => item.name);
  fs.writeFileSync('content/data/backgrounds/backgrounds.json', JSON.stringify(sortedItems));
};

loadBackgrounds();

console.log('☑ Backgrounds loaded.');
