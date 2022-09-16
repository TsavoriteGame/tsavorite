import { ReactionExtendedArgs, ReactionResponse } from './content-types';

export type MiddlewareType = 'pre' | 'post';

export interface Middleware {
  triggers: MiddlewareType[];
  isEnabled: () => boolean;
}

export type PreMiddleware = Middleware & {
  shouldPreFire: (args: ReactionExtendedArgs) => boolean;

  shouldPreBlock: (args: ReactionExtendedArgs) => boolean;

  pre: (args: ReactionExtendedArgs) => ReactionResponse;
};

export type PostMiddleware = Middleware & {
  shouldPostFire: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  shouldPostBlock: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  post: (args: ReactionExtendedArgs, result: ReactionResponse) => ReactionResponse;
};
