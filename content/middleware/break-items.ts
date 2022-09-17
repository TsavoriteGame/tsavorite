import { getDescriptorLevel, isUnbreakable } from '../helpers';
import { Descriptor, Interaction, ItemConfig, MiddlewareType, PostMiddleware, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

// whether or not source should break when hitting target
export function shouldItemBreakWhenInteractingWith(sourceItem: ItemConfig, targetItem: ItemConfig): boolean {

  if(!sourceItem || !targetItem) return false;

  const isSourceGlass = getDescriptorLevel(sourceItem, Descriptor.Glass) > 0;

  const isSourceWood = getDescriptorLevel(sourceItem, Descriptor.Wood) > 0;

  const isSourceRock = getDescriptorLevel(sourceItem, Descriptor.Rock) > 0;
  const isTargetRock = getDescriptorLevel(targetItem, Descriptor.Rock) > 0;

  const sourceMetalLevel = getDescriptorLevel(sourceItem, Descriptor.Metal);
  const targetMetalLevel = getDescriptorLevel(targetItem, Descriptor.Metal);

  const isSourceUnbreakable = isUnbreakable(sourceItem);
  const isTargetUnbreakable = isUnbreakable(targetItem);

  // unbreakable is never breakable
  if(isSourceUnbreakable) return false;

  // if they're unbreakable, we always break
  if(isTargetUnbreakable) return true;

  // glass always breaks
  if(isSourceGlass) return true;

  // if we're wood and they're rock or metal, break
  if(isSourceWood && (isTargetRock || targetMetalLevel > 0)) return true;

  // if we're rock and they're metal, break
  if(isSourceRock && targetMetalLevel > 0) return true;

  // if they have more metal than me, we break
  if(sourceMetalLevel > 0 && targetMetalLevel > 0 && sourceMetalLevel < targetMetalLevel) return true;

  // no situation above occurs, don't break
  return false;
}

/**
 * We check if an item should break when hitting something physically, with force.
 */
export class BreakItems implements PostMiddleware {

  triggers: MiddlewareType[] = ['post'];

  // this is enabled by default
  isEnabled() {
 return true;
}

  /*
   * Here, we only check if we're carving or smashing. And only if we succeeded in interacting to begin with.
   */
  shouldPostFire(args: ReactionExtendedArgs, response: ReactionResponse & { checksBreaks: boolean }) {
    return response.success
        && response.checksBreaks
        && args.sourceItem.interaction
        && [Interaction.Carves, Interaction.Smashes].includes(args.sourceItem.interaction.name);
  }

  // this should never block other post- middleware
  shouldPostBlock() {
 return false;
}

  post(args: ReactionExtendedArgs, response: ReactionResponse) {
    const shouldSourceBreak = shouldItemBreakWhenInteractingWith(response.newSource, response.newTarget);
    const shouldTargetBreak = shouldItemBreakWhenInteractingWith(response.newTarget, response.newSource);

    if(response.newSource && shouldSourceBreak) {
      response.newSource = undefined;
      response.message = `${response.message} Source was broken!`;
    }

    if(response.newTarget && shouldTargetBreak) {
      response.newTarget = undefined;
      response.message = `${response.message} Target was broken!`;
    }

    return response;
  }
}
