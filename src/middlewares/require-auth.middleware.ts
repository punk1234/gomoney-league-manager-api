import C from "../constants";
import Container from "typedi";
import { verifyAuthToken } from "../helpers";
import { IAuthTokenPayload } from "../interfaces";
import { NextFunction, Request, Response } from "express";
import { SessionService } from "../services/session.service";
import { UnauthenticatedError, UnauthorizedError } from "../exceptions";

const sessionService = Container.get(SessionService);

/**
 * @function requireAuth
 * @param {boolean} forAdmin
 * @returns {Function}
 */
export const requireAuth = (forAdmin?: boolean) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authTokenPayload: IAuthTokenPayload = verifyAuthToken(req.headers);

      const userAuthSessionId = await sessionService.getUserSession(authTokenPayload.userId);
      if (authTokenPayload.sessionId !== userAuthSessionId) {
        throw new UnauthenticatedError(C.ResponseMessage.ERR_UNAUTHENTICATED);
      }

      if (forAdmin === undefined || authTokenPayload.isAdmin === authTokenPayload.isAdmin) {
        req.auth = authTokenPayload;
        return next();
      }

      next(new UnauthorizedError(C.ResponseMessage.ERR_UNAUTHORIZED));
    } catch (err) {
      next(err);
    }
  };
};
