const { getAttackByName } = require('../content/getters');

const fs = require('fs-extra');
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

const validateItems = () => {
  allItems.forEach(item => {
    if (!item.name) {
      throw new Error(`Item ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Item ${item.name} is missing an icon`);
    }

    if(item.parts.length === 0) {
      throw new Error(`Item ${item.name} is missing parts`);
    }

    item.parts.forEach(part => {
      if(!part.name) {
        throw new Error(`Item ${item.name} is missing a part name`);
      }

      if(!part.primaryDescriptor) {
        throw new Error(`Item ${item.name} is missing a primary descriptor`);
      }

      const allDescriptorKeys = Object.keys(part.descriptors || {});
      if(allDescriptorKeys.length === 0) {
        throw new Error(`Item ${item.name} is missing descriptors`);
      }

      allDescriptorKeys.forEach(key => {
        const descriptor = part.descriptors[key];
        if(!descriptor) {
          throw new Error(`Item ${item.name} is missing a descriptor for ${key}`);
        }

        if(!descriptor.level) {
          throw new Error(`Item ${item.name} is missing a level for ${key}`);
        }
      });
    });

    if(item.interaction) {
      if(!item.interaction.name) {
        throw new Error(`Item ${item.name} is missing an interaction name`);
      }

      if(!item.interaction.level) {
        throw new Error(`Item ${item.name} is missing an interaction level`);
      }
    }

    if(item.attacks) {
      item.attacks.forEach(attackName => {
        const attack = getAttackByName(attackName);
        if(!attack) {
          throw new Error(`Item ${item.name} is referencing an invalid attack ${attackName}`);
        }
      });
    }
  });
};

const loadItems = async () => {
  const items = await fs.readJson('content/data/items/items.json');
  allItems.push(...items);

  validateItems();
};

loadItems();

console.log('☑ Items validated.');

