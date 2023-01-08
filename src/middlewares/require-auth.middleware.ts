import { verifyAuthToken } from "../helpers";
import { IAuthTokenPayload } from "../interfaces";
import { UnauthorizedError } from "../exceptions";
import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { SessionService } from "../services/session.service";

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
      if(authTokenPayload.sessionId !== userAuthSessionId) {
        throw new UnauthorizedError("Access denied!")
      }

      if (forAdmin === undefined || authTokenPayload.isAdmin === authTokenPayload.isAdmin) {
        req.auth = authTokenPayload;
        return next();
      }

      next(new UnauthorizedError("Access denied!"));
    } catch (err) {
      next(err);
    }
  };
};
