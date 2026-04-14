import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prismaClient } from "../utils/generatedClient";
import type { RegisterInput, LoginInput } from "../validators/user.schema";

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prismaClient.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw { status: 409, message: "Email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prismaClient.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await prismaClient.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};