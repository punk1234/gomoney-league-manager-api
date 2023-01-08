import C from "../constants";

const { ApiRateLimiterType } = C;
const ONE_HOUR_WINDOW_IN_SECONDS = 3600;

export default {
  [ApiRateLimiterType.AUTH_LOGIN]: {
    window: ONE_HOUR_WINDOW_IN_SECONDS,
    limit: 10,
  },
};
