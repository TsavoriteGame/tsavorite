import { decreaseDescriptorLevel, getDescriptorLevel, getPrimaryPartOfItem } from '../helpers';
import { Descriptor, Interaction, ItemConfig, MiddlewareType,
  PostReactionMiddleware, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

function balanceOpposites(item: ItemConfig, a: Descriptor, b: Descriptor) {
  while (getDescriptorLevel(item, a) > 0 && getDescriptorLevel(item, b) > 0) {
    decreaseDescriptorLevel(item, a, 1);
    decreaseDescriptorLevel(item, b, 1);
  }
}

export class CraftingDescriptorBalance implements PostReactionMiddleware {

  triggers: MiddlewareType[] = ['postreaction'];

  isEnabled() {
    return true;
  }

  shouldPostFire(args: ReactionExtendedArgs, response: ReactionResponse) {
    return args.sourceItem.interaction
        && args.sourceItem.interaction.name === Interaction.Tailors
        && getPrimaryPartOfItem(args.targetItem).primaryDescriptor === Descriptor.Sticky
        && response.extraItems !== undefined && response.extraItems.length > 0;
  }

  shouldPostBlock() {
    return false;
  }

  post(args: ReactionExtendedArgs, response: ReactionResponse) {
    if (response.extraItems.length === 0) return response;

    const item = response.extraItems[0];

    balanceOpposites(item, Descriptor.Hot, Descriptor.Cold);
    balanceOpposites(item, Descriptor.Blazing, Descriptor.Frozen);

    return response;
  }
}
