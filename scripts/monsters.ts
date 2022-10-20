const { getItemById } = require('../content/getters');
const { isFunctional } = require('../content/helpers');

const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy, isString } = require('lodash');

const allMonsters = [];

const validateMonsters = () => {
  allMonsters.forEach(item => {
    if (!item.name) {
      throw new Error(`Monster ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Monster ${item.name} is missing an icon`);
    }

    if (!item.hp) {
      throw new Error(`Monster ${item.name} is missing hp`);
    }

    if(!item.body) {
      throw new Error(`Monster ${item.name} is missing a body`);
    }

    if(!item.body.head) {
      throw new Error(`Monster ${item.name} is missing a head item`);
    }

    if(!item.body.hands) {
      throw new Error(`Monster ${item.name} is missing a hands item`);
    }

    if(!item.body.body) {
      throw new Error(`Monster ${item.name} is missing a body item`);
    }

    if(!item.body.feet) {
      throw new Error(`Monster ${item.name} is missing a feet item`);
    }

    Object.keys(item.body).forEach(bodyKey => {
      const itemRef = item.body[bodyKey];
      if(isString(itemRef)) {
        item.body[bodyKey] = getItemById(itemRef);
        if(!item.body[bodyKey]) {
          throw new Error(`Monster ${item.name} body is referencing invalid item "${itemRef}"`);
        }

        return;
      }

      if(!isFunctional(item.body[bodyKey])) {
        throw new Error(`Monster ${item.name} is missing a functional item for body:${bodyKey}`);
      }
    });

    Object.keys(item.equipment).forEach(bodyKey => {
      const itemRef = item.equipment[bodyKey];
      if(isString(itemRef)) {
        item.equipment[bodyKey] = getItemById(itemRef);
        if(!item.equipment[bodyKey]) {
          throw new Error(`Monster ${item.name} equipment is referencing invalid item "${itemRef}"`);
        }

        return;
      }

      if(!isFunctional(item.equipment[bodyKey])) {
        throw new Error(`Monster ${item.name} is missing a functional item for equipment:${bodyKey}`);
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

  validateMonsters();

  const sortedItems = sortBy(allMonsters, item => item.name)
    .reduce((acc, attack) => {
      acc[attack.name] = attack;
      return acc;
    }, {});

  fs.writeFileSync('content/data/monsters/monsters.json', JSON.stringify(sortedItems));
};

loadMonsters();

console.log('☑ Monsters validated and loaded.');

