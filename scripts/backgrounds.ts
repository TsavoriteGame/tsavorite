const { getItemById } = require('../content/getters');
const { isFunctional } = require('../content/helpers');

const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy, isString } = require('lodash');

const allBackgrounds = [];

const validateBackgrounds = () => {
  allBackgrounds.forEach(item => {
    if (!item.name) {
      throw new Error(`Background ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Background ${item.name} is missing an icon`);
    }

    if (!item.description) {
      throw new Error(`Background ${item.name} is missing a description`);
    }

    if(!item.archetype) {
      throw new Error(`Background ${item.name} is missing an archetype`);
    }

    if(!item.goal) {
      throw new Error(`Background ${item.name} is missing a goal`);
    }

    if(!item.hp) {
      throw new Error(`Background ${item.name} is missing an hp value`);
    }

    if(!item.body) {
      throw new Error(`Background ${item.name} is missing a body`);
    }

    if(!item.body.head) {
      throw new Error(`Background ${item.name} is missing a head item`);
    }

    if(!item.body.hands) {
      throw new Error(`Background ${item.name} is missing a hands item`);
    }

    if(!item.body.body) {
      throw new Error(`Background ${item.name} is missing a body item`);
    }

    if(!item.body.feet) {
      throw new Error(`Background ${item.name} is missing a feet item`);
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
        throw new Error(`Background ${item.name} is missing a functional item for ${bodyKey}`);
      }
    });

    if(item.startingKit) {
      item.startingKit.forEach(kitItem => {
        const doesItemExist = getItemById(kitItem.itemId);
        if(!doesItemExist) {
          throw new Error(`Background ${item.name} is referencing invalid item "${kitItem.itemId}"`);
        }

        if(!kitItem.description) {
          throw new Error(`Background ${item.name} is missing a description for a starting kit item`);
        }

        if(!kitItem.icon) {
          throw new Error(`Background ${item.name} is missing an icon for a starting kit item`);
        }
      });
    }
  });
};

const loadBackgrounds = async () => {
  const files = await readdir('content/data/backgrounds', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allBackgrounds.push(data);
  });

  validateBackgrounds();

  const sortedItems = sortBy(allBackgrounds, item => item.name);
  fs.writeFileSync('content/data/backgrounds/backgrounds.json', JSON.stringify(sortedItems));
};

loadBackgrounds();

console.log('☑ Backgrounds validated and loaded.');
