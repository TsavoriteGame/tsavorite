
import { IMiddleware, PostCombineMiddleware, PostReactionMiddleware, PreCombineMiddleware, PreReactionMiddleware } from '../interfaces';
import { BreakItems } from './break-items';
import { DiluteCorrosive } from './dilute-corrosive';
import { GlassShatter } from './glass-shatter';
import { IgniteCombustible } from './ignite-combustible';
import { RemoveLv0Interactable } from './remove-lv0-interactables';
import { TemperatureRegulation } from './temperature-regulation';

const allMiddleware = [BreakItems, DiluteCorrosive, GlassShatter,
  IgniteCombustible, TemperatureRegulation, RemoveLv0Interactable];

export function getAllMiddleware(): IMiddleware[] {
  return allMiddleware.map(proto => new proto());
}

export function getPreReactionMiddleware(middlewareInstances: IMiddleware[]): PreReactionMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('prereaction')) as PreReactionMiddleware[];
};

export function getPostReactionMiddleware(middlewareInstances: IMiddleware[]): PostReactionMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('postreaction')) as PostReactionMiddleware[];
};

export function getPreCombineMiddleware(middlewareInstances: IMiddleware[]): PreCombineMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('precombine')) as PreCombineMiddleware[];
};

export function getPostCombineMiddleware(middlewareInstances: IMiddleware[]): PostCombineMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('postcombine')) as PostCombineMiddleware[];
};
