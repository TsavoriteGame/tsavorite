import { Descriptor, Interaction } from './item';

export interface IRecipeIngredient {
  name: string;
  descriptor: Descriptor;
  level: number;
}

export interface IRecipe {
  name: string;
  description?: string;
  interaction: Interaction;
  produces: string;
  ingredients: IRecipeIngredient[];
}
