
const fs = require('fs-extra');
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
  const archetypes = await fs.readJson('content/data/archetypes/archetypes.json');
  allArchetypes.push(...archetypes);

  validateArchetypes();
};

loadArchetypes();

console.log('☑ Archetypes validated.');

