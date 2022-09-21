import { MiddlewareType, PostReactionMiddleware, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

/**
 * We check if glass has hot and cold applied to it. If so, we shatter it.
 */
export class RemoveLv0Interactable implements PostReactionMiddleware {

  triggers: MiddlewareType[] = ['postreaction'];

  // this is enabled by default
  isEnabled() {
    return true;
  }

  /*
   * Here, we only check if we have glass and it should shatter (temperature-wise)
   */
  shouldPostFire(args: ReactionExtendedArgs, response: ReactionResponse) {
    return response.success
        && response.newSource
        && response.newSource.interaction
        && response.newSource.interaction.level <= 0;
  }

  // this should never block other post- middleware
  shouldPostBlock() {
    return false;
  }

  post(args: ReactionExtendedArgs, response: ReactionResponse) {
    response.newSource = undefined;
    response.message = `${response.message} Source broke!`;

    return response;
  }
}
