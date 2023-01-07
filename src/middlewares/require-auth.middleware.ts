import { verifyAuthToken } from "../helpers";
import { IAuthTokenPayload } from "../interfaces";
import { UnauthorizedError } from "../exceptions";
import { NextFunction, Request, Response } from "express";

/**
 * @function requireAuth
 * @param {Array<Role>} allowedRoles
 * @returns {Function}
 */
export const requireAuth = (forAdmin?: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authTokenPayload: IAuthTokenPayload = verifyAuthToken(req.headers);

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
