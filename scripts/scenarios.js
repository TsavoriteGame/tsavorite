
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allScenarios = [];

const validateScenarios = () => {
  allScenarios.forEach(item => {

    if (!item.name) {
      throw new Error(`Scenario ${JSON.stringify(item)} is missing a name`);
    }

    Object.keys(item.worlds).forEach(worldId => {
      const world = item.worlds[worldId];
      world.id = +worldId;

      if(!world.name) {
        throw new Error(`Scenario ${item.name} is missing a name for world ${worldId}`);
      }

      const allNodes = world.layout.flat();
      allNodes.forEach(nodeId => {
        const node = item.nodes[nodeId];
        node.id = +nodeId;

        if(!node) {
          throw new Error(`Scenario ${item.name} is missing node ${nodeId}`);
        }

        if(!node.name) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing a name`);
        }

        if(!node.icon) {
          throw new Error(`Scenario ${item.name} node ${nodeId} is missing an icon`);
        }
      });
    });

    const allNodes = Object.values(item.nodes);

    const hasSpawn = allNodes.find(node => node.playerSpawnLocation);
    if(!hasSpawn) {
      throw new Error(`Scenario ${item.name} is missing a player spawn location`);
    }

  });
};

const loadScenarios = async () => {
  const files = await readdir('content/scenarios', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allScenarios.push(data);
  });

  validateScenarios();

  const sortedItems = sortBy(allScenarios, item => item.name);
  fs.writeFileSync('content/scenarios/scenarios.json', JSON.stringify(sortedItems));
};

loadScenarios();

