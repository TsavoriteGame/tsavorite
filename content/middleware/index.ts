
import { Middleware, PostMiddleware, PreMiddleware } from '../interfaces';
import { BreakItems } from './break-items';
import { DiluteCorrosive } from './dilute-corrosive';
import { GlassShatter } from './glass-shatter';
import { IgniteCombustible } from './ignite-combustible';

const allMiddleware = [BreakItems, DiluteCorrosive, GlassShatter, IgniteCombustible];

export function getAllMiddleware(): Middleware[] {
  return allMiddleware.map(proto => new proto());
}

export function getPreMiddleware(middlewareInstances: Middleware[]): PreMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('pre')) as PreMiddleware[];
};

export function getPostMiddleware(middlewareInstances: Middleware[]): PostMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('post')) as PostMiddleware[];
};
