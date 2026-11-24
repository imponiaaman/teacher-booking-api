
import { Request, Response, NextFunction } from "express";
import Teacher from "../models/Teacher";
import { AppError } from "../utils/AppError";

export async function createTeacher(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      fullName,
      email,
      specialization,
      experience
    } = req.body;

    if (!fullName || !email || !specialization || experience === undefined || experience === null) {
      throw new AppError(
        400,
        "fullName, email, specialization and experience are required"
      );
    }

    if (typeof experience !== "number" || experience < 0) {
      throw new AppError(400, "Experience must be a non-negative number");
    }

    const existingTeacher = await Teacher.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingTeacher) {
      throw new AppError(409, "Teacher email already exists");
    }

    const teacher = await Teacher.create({
      fullName,
      email,
      specialization,
      experience
    });

    res.status(201).json({
      message: "Teacher created successfully",
      data: teacher
    });

  } catch (error) {
    next(error);
  }
}
