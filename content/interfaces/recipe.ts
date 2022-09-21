import { Descriptor, Interaction } from './item';

export interface RecipeIngredient {
  name: string;
  descriptor: Descriptor;
  level: number;
}

export interface Recipe {
  name: string;
  description?: string;
  icon: string;
  descriptor: Descriptor;
  interaction: Interaction;
  ingredients: RecipeIngredient[];
}
