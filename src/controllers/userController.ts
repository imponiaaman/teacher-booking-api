import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Session from "../models/Session";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, phone } = req.body;
    if (!fullName || !email || !phone) throw new AppError(400, "fullName, email and phone are required");
    const user = await User.create({ fullName, email, phone });
    res.status(201).json(user);
  } catch (e) { next(e); }
}


export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find()
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments()
    ]);

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit
      }
    });

  } catch (error) {
    next(error);
  }
}

export async function getUserSessions(req: Request, res: Response, next: NextFunction) {
  try {

const userId = String(req.params.id);

if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "Invalid user ID");
}



    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, "Invalid user ID");
    const userExists = await User.exists({ _id: req.params.id });
    if (!userExists) throw new AppError(404, "User not found");
    const result = await Session.aggregate([
     { $match: { userId: new mongoose.Types.ObjectId(String(req.params.id)) } },
      { $lookup: { from: "teachers", localField: "teacherId", foreignField: "_id", as: "teacher" } },
      { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
      { $sort: { startTime: 1 } },
      { $project: { startTime: 1, endTime: 1, status: 1, completedAt: 1, teacher: { fullName: "$teacher.fullName", specialization: "$teacher.specialization", email: "$teacher.email" } } }
    ]);
    const now = new Date();
    res.json({
      upcomingSessions: result.filter(s => s.status === "BOOKED" && new Date(s.startTime) >= now),
      completedSessions: result.filter(s => s.status === "COMPLETED")
    });
  } catch (e) { next(e); }
  
}
