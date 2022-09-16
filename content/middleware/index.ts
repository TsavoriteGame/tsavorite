
import { Middleware, PostMiddleware, PreMiddleware } from '../interfaces';
import { BreakItems } from './break-items';
import { GlassShatter } from './glass-shatter';

const allMiddleware = [BreakItems, GlassShatter];

export function getAllMiddleware(): Middleware[] {
  return allMiddleware.map(proto => new proto());
}

export function getPreMiddleware(middlewareInstances: Middleware[]): PreMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('pre')) as PreMiddleware[];
};

export function getPostMiddleware(middlewareInstances: Middleware[]): PostMiddleware[] {
  return middlewareInstances.filter(inst => inst.triggers.includes('post')) as PostMiddleware[];
};
