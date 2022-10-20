
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allAttacks = [];

const validateAttacks = () => {
  allAttacks.forEach(item => {
    console.log(item);
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
  const attacks = await fs.readJson('content/data/attacks/attacks.json');
  allAttacks.push(...Object.values(attacks));

  validateAttacks();
};

loadAttacks();

console.log('☑ Attacks validated.');

