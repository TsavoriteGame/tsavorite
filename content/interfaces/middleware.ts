import { IReactionExtendedArgs, IReactionResponse } from './item';

export type MiddlewareType = 'prereaction' | 'postreaction' | 'precombine' | 'postcombine';

export interface IMiddleware {
  triggers: MiddlewareType[];
  isEnabled: () => boolean;
}

// reaction middleware
export type PreReactionMiddleware = IMiddleware & {
  shouldPreFire: (args: IReactionExtendedArgs) => boolean;

  shouldPreBlock: (args: IReactionExtendedArgs) => boolean;

  pre: (args: IReactionExtendedArgs) => IReactionResponse;
};

export type PostReactionMiddleware = IMiddleware & {
  shouldPostFire: (args: IReactionExtendedArgs, result: IReactionResponse) => boolean;

  shouldPostBlock: (args: IReactionExtendedArgs, result: IReactionResponse) => boolean;

  post: (args: IReactionExtendedArgs, result: IReactionResponse) => IReactionResponse;
};

// combine middleware
export type PreCombineMiddleware = IMiddleware & {
  shouldPreFire: (args: IReactionExtendedArgs) => boolean;

  shouldPreBlock: (args: IReactionExtendedArgs) => boolean;

  pre: (args: IReactionExtendedArgs) => IReactionResponse;
};

export type PostCombineMiddleware = IMiddleware & {
  shouldPostFire: (args: IReactionExtendedArgs, result: IReactionResponse) => boolean;

  shouldPostBlock: (args: IReactionExtendedArgs, result: IReactionResponse) => boolean;

  post: (args: IReactionExtendedArgs, result: IReactionResponse) => IReactionResponse;
};
