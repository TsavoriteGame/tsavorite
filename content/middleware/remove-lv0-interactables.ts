import { MiddlewareType, PostReactionMiddleware, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

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
  shouldPostFire(args: IReactionExtendedArgs, response: IReactionResponse) {
    return response.success
        && response.newSource
        && response.newSource.interaction
        && response.newSource.interaction.level <= 0;
  }

  // this should never block other post- middleware
  shouldPostBlock() {
    return false;
  }

  post(args: IReactionExtendedArgs, response: IReactionResponse) {
    response.newSource = undefined;
    response.message = `${response.message} Source broke!`;

    return response;
  }
}
