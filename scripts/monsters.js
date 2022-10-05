
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allMonsters = [];

const validateMonsters = () => {
  allMonsters.forEach(item => {
    if (!item.name) {
      throw new Error(`Attack ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Attack ${item.name} is missing an icon`);
    }

    if(!item.hp) {
      throw new Error(`Attack ${item.name} is missing hp`);
    }

    if(!item.attacks) {
      throw new Error(`Attack ${item.name} is missing attacks`);
    }

  });
};

const loadMonsters = async () => {
  const files = await readdir('content/monsters', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    const formattedData = Object.keys(data)
      .map(attackKey => {
        return { name: attackKey, ...data[attackKey] };
      });

    allMonsters.push(...formattedData);
  });

  validateMonsters();

  const sortedItems = sortBy(allMonsters, item => item.name)
    .reduce((acc, attack) => {
      acc[attack.name] = attack;
      return acc;
    }, {});

  fs.writeFileSync('content/monsters/monsters.json', JSON.stringify(sortedItems));
};

loadMonsters();

