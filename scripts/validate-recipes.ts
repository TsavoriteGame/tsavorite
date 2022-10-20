
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const yaml = require('js-yaml');
const { sortBy } = require('lodash');

const allRecipes = [];

const validateIngredients = (recipe) => {
  if (!recipe.ingredients) {
    return false;
  }
  let valid = true;
  recipe.ingredients.forEach(ingredient => {
    if (!valid) {
      return;
    }
    if (!ingredient.name || !ingredient.descriptor || !ingredient.level) {
      valid = false;
    }
  });

  return valid;
};

const validateRecipes = () => {
  allRecipes.forEach(item => {
    if (!item.name || !item.produces || !item.interaction
     || !validateIngredients(item)) {
      throw new Error(`Recipe ${JSON.stringify(item)} is missing a name`);
    }
  });
};

const loadRecipes = async () => {
  const recipes = await fs.readJson('content/data/recipes/recipes.json');
  allRecipes.push(...recipes);

  validateRecipes();
};

loadRecipes();

console.log('☑ Recipes validated.');
