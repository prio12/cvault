import jwt from "jsonwebtoken";

export const generateToken = (user: any): string => {
  return jwt.sign({ id: user?.id, role: user?.role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};
