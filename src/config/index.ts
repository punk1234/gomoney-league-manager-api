import C from "../constants";
import { config as getEnvVariables } from "dotenv";
import apiRateLimitingConfig from "./api-rate-limiting.config";

getEnvVariables();

const { env } = process;

export default {
  PORT: Number(env.PORT || 8000),
  ENVIRONMENT: env.NODE_ENV || C.Environment.DEVELOPMENT,
  MONGODB_URL: env.MONGODB_URL || "",
  REDIS_URL: env.REDIS_URL || "",
  JWT_TOKEN_SECRET: env.JWT_TOKEN_SECRET || "",
  AUTH_TOKEN_TTL_IN_HOURS: `${env.AUTH_TOKEN_TTL_IN_HOURS || "6"}h`,

  API_RATE_LIMITING: apiRateLimitingConfig,
  FIXTURE_LINK_BASE_URL: env.FIXTURE_LINK_BASE_URL || "https://app.gomoney.go/football/fixtures"
};
