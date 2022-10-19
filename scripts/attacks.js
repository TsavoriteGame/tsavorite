
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allAttacks = [];

const validateAttacks = () => {
  allAttacks.forEach(item => {
    if (!item.name) {
      throw new Error(`Attack ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Attack ${item.name} is missing an icon`);
    }

    if(!item.damage) {
      throw new Error(`Attack ${item.name} is missing damage`);
    }

    if(!item.castTime) {
      throw new Error(`Attack ${item.name} is missing castTime`);
    }

  });
};

const loadAttacks = async () => {
  const files = await readdir('content/data/attacks', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    const formattedData = Object.keys(data)
      .map(attackKey => {
        return { name: attackKey, ...data[attackKey] };
      });

    allAttacks.push(...formattedData);
  });

  validateAttacks();

  const sortedItems = sortBy(allAttacks, item => item.name)
    .reduce((acc, attack) => {
      acc[attack.name] = attack;
      return acc;
    }, {});

  fs.writeFileSync('content/data/attacks/attacks.json', JSON.stringify(sortedItems));
};

loadAttacks();

