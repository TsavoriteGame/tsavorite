import { decreaseDescriptorLevelForPart, getDescriptorLevel, getPartWithDescriptor } from '../helpers';
import { Descriptor, Interaction, IItemConfig, MiddlewareType,
  PostReactionMiddleware, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

export function shouldDilute(item: IItemConfig) {
  return !!getPartWithDescriptor(item, Descriptor.Corrosive) && getDescriptorLevel(item, Descriptor.Container) > 0;
}

/**
 * We check if the target item has any corrosive element, and if so dilute that corrosive
 */
export class DiluteCorrosive implements PostReactionMiddleware {

  triggers: MiddlewareType [] = ['postreaction'];

  isEnabled() {
    return true;
  }

  shouldPostFire(args: IReactionExtendedArgs, response: IReactionResponse) {
    return args.sourceItem.interaction
        && args.sourceItem.interaction.name === Interaction.Wets
        && response.newTarget
        && shouldDilute(response.newTarget);
  }

  shouldPostBlock() {
    return false;
  }

  post(args: IReactionExtendedArgs, response: IReactionResponse) {

    const part = getPartWithDescriptor(args.targetItem, Descriptor.Corrosive);
    decreaseDescriptorLevelForPart(part, Descriptor.Corrosive, 1);

    if (response.success) {
      response.message = `${response.message} Acid diluted!`;
    } else {
      response.message = 'Acid diluted!';
    }

    response.success = true;

    return response;
  }
}
