import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/db";

interface CustomRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user || user.token !== token) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
