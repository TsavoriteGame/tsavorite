
import { Middleware, PostCombineMiddleware, PostReactionMiddleware, PreCombineMiddleware, PreReactionMiddleware } from '../interfaces';
import { BreakItems } from './break-items';
import { CraftingDescriptorBalance } from './crafting-descriptor-balance';
import { DiluteCorrosive } from './dilute-corrosive';
import { GlassShatter } from './glass-shatter';
import { IgniteCombustible } from './ignite-combustible';
import { TemperatureRegulation } from './temperature-regulation';

const allMiddleware = [BreakItems, CraftingDescriptorBalance, DiluteCorrosive, GlassShatter, IgniteCombustible, TemperatureRegulation];

export function getAllMiddleware(): Middleware[] {
  return allMiddleware.map(proto => new proto());
}

export function getPreReactionMiddleware(middlewareInstances: Middleware[]): PreReactionMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('prereaction')) as PreReactionMiddleware[];
};

export function getPostReactionMiddleware(middlewareInstances: Middleware[]): PostReactionMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('postreaction')) as PostReactionMiddleware[];
};

export function getPreCombineMiddleware(middlewareInstances: Middleware[]): PreCombineMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('precombine')) as PreCombineMiddleware[];
};

export function getPostCombineMiddleware(middlewareInstances: Middleware[]): PostCombineMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('postcombine')) as PostCombineMiddleware[];
};
