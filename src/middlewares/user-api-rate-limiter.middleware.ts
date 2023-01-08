import config from "../config";
import rateLimiter from "redis-rate-limiter";
import { RateLimitManager } from "../helpers";
import { NextFunction, Request, Response } from "express";
import RedisConnector from "../database/connectors/redis.connector";
import { ApiRateLimiterType } from "../constants/api-rate-limiter-type.const";

/**
 * @function userRateLimiter
 * @param {ApiRateLimiterType} rateLimiterType
 * @returns {Function}
 */
export const userRateLimiter = (rateLimiterType: ApiRateLimiterType) => {
  const RATE_LIMIT_CONFIG = config.API_RATE_LIMITING[rateLimiterType];

  const getRedisKey = (userId: string) => {
    return RateLimitManager.getAppKey(userId, rateLimiterType);
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rateLimiterConfig = {
        redis: RedisConnector.getClient(),

        // NOTE: USE `userId` WHEN MORE FUNCTIONALITIES ARE SUPPORTED
        // ALSO, MAYBE SUPPORT `IP-ADDRESS` FOR UNIQUE-KEY
        key: (req: Request) => getRedisKey(req.body.email.toLowerCase()),
        ...RATE_LIMIT_CONFIG,
      };

      rateLimiter.middleware(rateLimiterConfig as any)(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
