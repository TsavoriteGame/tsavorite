
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy, isString } = require('lodash');

const items = require('../content/data/items/items.json');

const allMonsters = [];

const fillMonsters = () => {
  allMonsters.forEach(item => {
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

    Object.keys(item.equipment).forEach(bodyKey => {
      const itemRef = item.equipment[bodyKey];
      if(isString(itemRef)) {
        item.equipment[bodyKey] = items.find(i => i.id === itemRef);
        if(!item.equipment[bodyKey]) {
          throw new Error(`Monster ${item.name} equipment is referencing invalid item "${itemRef}"`);
        }

        return;
      }
    });

  });
};

const loadMonsters = async () => {
  const files = await readdir('content/data/monsters', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    const formattedData = Object.keys(data)
      .map(monsterKey => ({ name: monsterKey, ...data[monsterKey] }));

    allMonsters.push(...formattedData);
  });

  fillMonsters();

  const sortedItems = sortBy(allMonsters, item => item.name)
    .reduce((acc, attack) => {
      acc[attack.name] = attack;
      return acc;
    }, {});

  fs.writeFileSync('content/data/monsters/monsters.json', JSON.stringify(sortedItems));
};

loadMonsters();

console.log('☑ Monsters loaded.');

