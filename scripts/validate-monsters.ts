const { getItemById } = require('../content/getters');
const { isFunctional } = require('../content/helpers');

const fs = require('fs-extra');
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
      if(!isFunctional(item.body[bodyKey])) {
        throw new Error(`Monster ${item.name} is missing a functional item for body:${bodyKey}`);
      }
    });

    Object.keys(item.equipment).forEach(bodyKey => {
      if(!isFunctional(item.equipment[bodyKey])) {
        throw new Error(`Monster ${item.name} is missing a functional item for equipment:${bodyKey}`);
      }
    });

  });
};

const loadMonsters = async () => {
  const monsters = await fs.readJson('content/data/monsters/monsters.json');
  allMonsters.push(...Object.values(monsters));

  validateMonsters();
};

loadMonsters();

console.log('☑ Monsters validated.');

