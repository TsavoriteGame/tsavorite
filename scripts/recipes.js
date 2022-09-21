
const fs = require('fs');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allRecipes = [];

const validateIngredients = (recipe) => {
  if (!recipe.ingredients) return false;
  let valid = true;
  recipe.ingredients.forEach(ingredient => {
    if (!valid) return;
    if (!ingredient.name || !ingredient.descriptor || !ingredient.level) valid = false;
  });

  return valid;
}

const validateRecipes = () => {
  allRecipes.forEach(item => {
    if (!item.name || !item.icon || !item.descriptor
     || !item.interaction || !validateIngredients(item)) {
      throw new Error(`Recipe ${JSON.stringify(item)} is missing a name`);
    }
  });
};

const loadRecipes = async () => {
  const files = await readdir('content/recipes', ['*.json']);
  files.forEach(file => {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    allRecipes.push(...data);
  });

  validateRecipes();

  const sortedRecipes = sortBy(allRecipes, item => item.name);
  fs.writeFileSync('content/recipes/recipes.json', JSON.stringify(sortedRecipes));
};

loadRecipes();
