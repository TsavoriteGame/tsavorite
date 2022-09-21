import { balanceOppositeDescriptors, getPrimaryPartOfItem } from '../helpers';
import { Descriptor, Interaction, MiddlewareType,
  PostReactionMiddleware, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

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

    balanceOppositeDescriptors(item, Descriptor.Hot, Descriptor.Cold);
    balanceOppositeDescriptors(item, Descriptor.Blazing, Descriptor.Frozen);

    return response;
  }
}
