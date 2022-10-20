
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allAttacks = [];

const loadAttacks = async () => {
  const files = await readdir('content/data/attacks', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    const formattedData = Object.keys(data)
      .map(attackKey => ({ name: attackKey, ...data[attackKey] }));

    allAttacks.push(...formattedData);
  });

  const sortedItems = sortBy(allAttacks, item => item.name)
    .reduce((acc, attack) => {
      acc[attack.name] = attack;
      return acc;
    }, {});

  fs.writeFileSync('content/data/attacks/attacks.json', JSON.stringify(sortedItems));
};

loadAttacks();

console.log('☑ Attacks loaded.');

