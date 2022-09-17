import { decreaseDescriptorLevelForPart, getDescriptorLevel, getPartWithDescriptor } from '../helpers';
import { Descriptor, Interaction, ItemConfig, MiddlewareType, PostMiddleware, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

export function shouldDilute(item: ItemConfig) {
  return !!getPartWithDescriptor(item, Descriptor.Corrosive) && 0 < getDescriptorLevel(item, Descriptor.Container);
}

/**
 * We check if the target item has any corrosive element, and if so dilute that corrosive
 */
export class DiluteCorrosive implements PostMiddleware {

  triggers: MiddlewareType [] = ['post'];

  isEnabled() { return true; }

  shouldPostFire(args: ReactionExtendedArgs, response: ReactionResponse) {
    return args.sourceItem.interaction
        && args.sourceItem.interaction.name === Interaction.Wets
        && response.newTarget
        && shouldDilute(response.newTarget);
  }

  shouldPostBlock() { return false; }

  post(args: ReactionExtendedArgs, response: ReactionResponse) {

    const part = getPartWithDescriptor(args.targetItem, Descriptor.Corrosive);
    decreaseDescriptorLevelForPart(part, Descriptor.Corrosive, 1);

    if (response.success)
      response.message = `${response.message} Acid diluted!`;
    else
      response.message = `Acid diluted!`;

    response.success = true;

    return response;
  }
}
