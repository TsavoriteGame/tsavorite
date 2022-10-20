
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allRecipes = [];

const loadRecipes = async () => {
  const files = await readdir('content/data/recipes', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allRecipes.push(...data);
  });

  const sortedRecipes = sortBy(allRecipes, item => item.name);
  fs.writeFileSync('content/data/recipes/recipes.json', JSON.stringify(sortedRecipes));
};

loadRecipes();

console.log('☑ Recipes loaded.');
