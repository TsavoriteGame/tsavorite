
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
}

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
      })
    });

    if(item.interaction) {
      if(!item.interaction.name) {
        throw new Error(`Item ${item.name} is missing an interaction name`);
      }

      if(!item.interaction.level) {
        throw new Error(`Item ${item.name} is missing an interaction level`);
      }
    }
  });
};

const loadItems = async () => {
  const files = await readdir('content/items', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allItems.push(...data);
  });

  assignItemIds();
  validateItems();

  const sortedItems = sortBy(allItems, item => item.name);
  fs.writeFileSync('content/items/items.json', JSON.stringify(sortedItems));
};

loadItems();

