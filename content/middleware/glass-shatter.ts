import { hasDescriptor } from '../helpers';
import { Descriptor, IItemConfig, MiddlewareType, PostReactionMiddleware, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

export function shouldShatter(item: IItemConfig) {
  const hasHot = hasDescriptor(item, Descriptor.Hot);
  const hasCold = hasDescriptor(item, Descriptor.Cold);
  const hasBlazing = hasDescriptor(item, Descriptor.Blazing);
  const hasFrozen = hasDescriptor(item, Descriptor.Frozen);
  const hasGlass = hasDescriptor(item, Descriptor.Glass);

  return (hasHot || hasBlazing) && (hasCold || hasFrozen) && hasGlass;
};

/**
 * We check if glass has hot and cold applied to it. If so, we shatter it.
 */
export class GlassShatter implements PostReactionMiddleware {

  triggers: MiddlewareType[] = ['postreaction'];

  // this is enabled by default
  isEnabled() {
    return true;
  }

  /*
   * Here, we only check if we have glass and it should shatter (temperature-wise)
   */
  shouldPostFire(args: IReactionExtendedArgs, response: IReactionResponse) {
    return response.success
        && response.newTarget
        && shouldShatter(response.newTarget);
  }

  // this should never block other post- middleware
  shouldPostBlock() {
    return false;
  }

  post(args: IReactionExtendedArgs, response: IReactionResponse) {
    response.newTarget = undefined;
    response.message = `${response.message} Target shattered due to temperature!`;

    return response;
  }
}
