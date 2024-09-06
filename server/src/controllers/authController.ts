import type { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "@/db";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Registering user:", email);

    // Проверка наличия пользователя с таким email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        token: jwt.sign({ email }, process.env.JWT_SECRET as string),
      },
    });
    console.log("User registered successfully:", user.email);
    res.status(201).json({
      token: user.token,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for user:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.password, password))) {
      console.log("Login failed for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("Login successful for user:", email);
    res.json({
      token: user.token,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};

export const check = async (req: Request, res: Response) => {
  try {
    // The user object is attached to the request by the authMiddleware
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    // If we reach here, the token is valid
    res.json({
      message: "Token is valid",
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Error checking token" });
  }
};
