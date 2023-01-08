import RedisConnector from "../database/connectors/redis.connector";
import { ApiRateLimiterType } from "../constants/api-rate-limiter-type.const";

/**
 * @class RateLimitManager
 */
export class RateLimitManager {
  static REDIS_RATE_LIMIT_LIB_PREFIX = "ratelimit:";

  /**
   * @name getAppKey
   * @static
   * @param userId
   * @param rateLimitType
   * @returns
   */
  static getAppKey(userId: string, rateLimitType: ApiRateLimiterType): string {
    if (!userId) {
      throw new Error("Invalid user identifier");
    }
    return `${rateLimitType}_${userId}`;
  }

  /**
   * @name getCacheKey
   * @static
   * @param userId
   * @param rateLimitType
   * @returns
   */
  static getCacheKey(userId: string, rateLimitType: ApiRateLimiterType): string {
    return RateLimitManager.REDIS_RATE_LIMIT_LIB_PREFIX + this.getAppKey(userId, rateLimitType);
  }

  /**
   * @name reset
   * @static
   * @memberof RateLimitManager
   * @param userId
   * @param rateLimitType
   */
  static async reset(userId: string, rateLimitType: ApiRateLimiterType) {
    const redisClient = RedisConnector.getClient();
    if (!redisClient) {
      throw new Error();
    }

    const REDIS_LIB_KEY = this.getCacheKey(userId, rateLimitType);
    await redisClient.del(REDIS_LIB_KEY);
  }
}
