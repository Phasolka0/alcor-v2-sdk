import { Token, Pool, Route } from '../entities';
export declare function computeAllRoutes(tokenIn: Token, tokenOut: Token, pools: Pool[], maxHops: number): Route<Token, Token>[];