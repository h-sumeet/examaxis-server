import type { Request, Response, NextFunction } from "express";

// global error handler
export const errorHandler = (
  err: { code?: number; message?: string; isOperational?: boolean },
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  res.status(err.code || 500).send({
    code: err.code || 500,
    status: "error",
    msg: err.isOperational ? err.message : "Internal Server Error",
  });
};

// 404 route Not Found handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  res.status(404).send({
    code: 404,
    status: "error",
    msg: "Resource not found",
  });
};
