
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allArchetypes = [];

const validateArchetypes = () => {
  allArchetypes.forEach(item => {
    if (!item.name) {
      throw new Error(`Archetype ${JSON.stringify(item)} is missing a name`);
    }

    if (!item.icon) {
      throw new Error(`Archetype ${item.name} is missing an icon`);
    }

  });
};

const loadArchetypes = async () => {
  const files = await readdir('content/data/archetypes', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allArchetypes.push(data);
  });

  validateArchetypes();

  const sortedItems = sortBy(allArchetypes, item => item.name);
  fs.writeFileSync('content/data/archetypes/archetypes.json', JSON.stringify(sortedItems));
};

loadArchetypes();

console.log('☑ Archetypes validated and loaded.');

