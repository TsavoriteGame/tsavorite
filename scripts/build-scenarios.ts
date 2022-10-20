const { getItemById, getMonsterByName } = require('../content/getters');

const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const md5 = require('md5');
const { sortBy } = require('lodash');

const allScenarios = [];

const fillScenarios = () => {
  allScenarios.forEach(item => {
    Object.keys(item.worlds).forEach(worldId => {
      const world = item.worlds[worldId];
      world.id = +worldId;

      const allLayoutNodes = world.layout.flat();
      allLayoutNodes.forEach(nodeId => {
        const node = item.nodes[nodeId];
        node.id = +nodeId;

        node.landmarkData = node.landmarkData || {};
      });

      for(let y = 0; y < world.layout.length; y++) {
        for(let x = 0; x < world.layout[y].length; x++) {
          world.layout[y][x] = { id: world.layout[y][x] };
        }
      }
    });

    item.hash = md5(JSON.stringify(item));
  });
};

const loadScenarios = async () => {
  const files = await readdir('content/data/scenarios', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allScenarios.push(data);
  });

  fillScenarios();

  const sortedItems = sortBy(allScenarios, item => item.name);
  fs.writeFileSync('content/data/scenarios/scenarios.json', JSON.stringify(sortedItems));
};

loadScenarios();

console.log('☑ Scenarios loaded.');

