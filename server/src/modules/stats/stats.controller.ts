import { Request, Response, NextFunction } from 'express';
import * as statsService from './stats.service.js';
import { ValidationError } from '../../shared/errors.js';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await statsService.getStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getRecent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Done 🔴 TODO: Read the optional ?limit= query param (default 5). It must be a whole number from 1 to 10, otherwise throw a ValidationError (400). Pass it to the service.
    const rawLimit = req.query.limit
    const limit = rawLimit === undefined ? 5 : typeof rawLimit === 'string' ? Number(rawLimit) : NaN
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
      throw new ValidationError(`limit must be a whole number from 1 to 10`)
    }
    const result = await statsService.getRecent(limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
