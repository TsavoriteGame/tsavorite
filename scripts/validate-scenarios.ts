const { getItemById, getMonsterByName } = require('../content/getters');

const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const md5 = require('md5');
const { sortBy } = require('lodash');

const allScenarios = [];

const validateScenarios = () => {
  allScenarios.forEach(item => {

    if (!item.name) {
      throw new Error(`Scenario ${JSON.stringify(item)} is missing a name`);
    }

    Object.keys(item.worlds).forEach(worldId => {
      const world = item.worlds[worldId];

      if(!world.name) {
        throw new Error(`Scenario ${item.name} is missing a name for world ${worldId}`);
      }

      const allLayoutNodes = world.layout.flat();
      allLayoutNodes.forEach(nodeId => {
        const node = item.nodes[nodeId.id];

        if(!node) {
          throw new Error(`Scenario ${item.name} is missing node ${nodeId}`);
        }

        if(!node.name) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing a name`);
        }

        if(!node.landmark) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing a landmark`);
        }

        if(!node.icon) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing an icon`);
        }

        if(!node.description) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing a description`);
        }

        node.landmarkData = node.landmarkData || {};

        if(node.landmarkData.shopItems) {
          node.landmarkData.shopItems.forEach(shopItem => {
            const itemRef = getItemById(shopItem.item);
            if(!itemRef) {
              throw new Error(`Scenario ${item.name} node ${nodeId} has an invalid shop item ${shopItem.item}`);
            }

            if(!shopItem.cost || shopItem.cost <= 0) {
              throw new Error(`Scenario ${item.name} node ${nodeId} has an invalid shop item cost ${shopItem.cost}`);
            }
          });
        }

        if(node.landmarkData.monsters) {
          node.landmarkData.monsters.forEach(monster => {
            const monsterRef = getMonsterByName(monster.name);
            if(!monsterRef) {
              throw new Error(`Scenario ${item.name} node ${nodeId} has an invalid monster ${monster.name}`);
            }
          });
        }

        if(node.landmarkData.itemDrops) {
          node.landmarkData.itemDrops.forEach(itemDrop => {
            const itemRef = getItemById(itemDrop.itemId);
            if(!itemRef) {
              throw new Error(`Scenario ${item.name} node ${nodeId} has an invalid item drop ${itemDrop.itemId}`);
            }
          });
        }
      });
    });

    const allNodes = Object.values(item.nodes);

    const hasSpawn = allNodes.find((node: any) => node.playerSpawnLocation);
    if(!hasSpawn) {
      throw new Error(`Scenario ${item.name} is missing a player spawn location`);
    }

    item.hash = md5(JSON.stringify(item));

  });
};

const loadScenarios = async () => {
  const scenarios = await fs.readJson('content/data/scenarios/scenarios.json');
  allScenarios.push(...scenarios);

  validateScenarios();
};

loadScenarios();

console.log('☑ Scenarios validated.');

