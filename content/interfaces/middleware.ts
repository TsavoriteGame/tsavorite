import { ReactionExtendedArgs, ReactionResponse } from './item';

export type MiddlewareType = 'prereaction' | 'postreaction' | 'precombine' | 'postcombine';

export interface Middleware {
  triggers: MiddlewareType[];
  isEnabled: () => boolean;
}

// reaction middleware
export type PreReactionMiddleware = Middleware & {
  shouldPreFire: (args: ReactionExtendedArgs) => boolean;

  shouldPreBlock: (args: ReactionExtendedArgs) => boolean;

  pre: (args: ReactionExtendedArgs) => ReactionResponse;
};

export type PostReactionMiddleware = Middleware & {
  shouldPostFire: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  shouldPostBlock: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  post: (args: ReactionExtendedArgs, result: ReactionResponse) => ReactionResponse;
};

// combine middleware
export type PreCombineMiddleware = Middleware & {
  shouldPreFire: (args: ReactionExtendedArgs) => boolean;

  shouldPreBlock: (args: ReactionExtendedArgs) => boolean;

  pre: (args: ReactionExtendedArgs) => ReactionResponse;
};

export type PostCombineMiddleware = Middleware & {
  shouldPostFire: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  shouldPostBlock: (args: ReactionExtendedArgs, result: ReactionResponse) => boolean;

  post: (args: ReactionExtendedArgs, result: ReactionResponse) => ReactionResponse;
};
