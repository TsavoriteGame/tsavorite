import { decreaseDescriptorLevelForPart, getDescriptorLevel, getPartWithDescriptor, increaseDescriptorLevelForPart } from '../helpers';
import { Descriptor, Interaction, IItemConfig, MiddlewareType,
  PostReactionMiddleware, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

export function shouldCombust(item: IItemConfig) {
  return getDescriptorLevel(item, Descriptor.Combustible) > 0;
}

/**
 * We check if the target item is AT ALL combustible, and set it on fire if so.
 */
export class IgniteCombustible implements PostReactionMiddleware {

  triggers: MiddlewareType[] = ['postreaction'];

  // this is enabled by default
  isEnabled() {
    return true;
  }

  /*
   * Here, we only check if we have glass and it should shatter (temperature-wise)
   */
  shouldPostFire(args: IReactionExtendedArgs, response: IReactionResponse) {
    return args.sourceItem.interaction
        && args.sourceItem.interaction.name === Interaction.Ignites
        && response.newTarget
        && shouldCombust(response.newTarget);
  }

  // this should never block other post- middleware
  shouldPostBlock() {
    return false;
  }

  post(args: IReactionExtendedArgs, response: IReactionResponse) {
    const part = getPartWithDescriptor(args.targetItem, Descriptor.Combustible);
    increaseDescriptorLevelForPart(part, Descriptor.Blazing, 1);
    increaseDescriptorLevelForPart(part, Descriptor.Hot, 1);
    decreaseDescriptorLevelForPart(part, Descriptor.Combustible, 1);

    if(response.success)
      response.message = `${response.message} Target combusted!`;
    else
      response.message = 'Target combusted!';

    response.success = true;

    return response;
  }
}
