import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Session from "../models/Session";
import Teacher from "../models/Teacher";
import User from "../models/User";
import { AppError } from "../utils/AppError";

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacherId, startTime, endTime } = req.body;
    if (!teacherId || !startTime || !endTime) throw new AppError(400, "teacherId, startTime and endTime are required");
    if (!mongoose.isValidObjectId(teacherId)) throw new AppError(400, "Invalid teacher ID");
    const start = new Date(startTime), end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new AppError(400, "Invalid date/time");
    if (end <= start) throw new AppError(400, "endTime must be greater than startTime");
    if (!(await Teacher.exists({ _id: teacherId }))) throw new AppError(404, "Teacher not found");
    const session = await Session.create({ teacherId, startTime: start, endTime: end });
    res.status(201).json(session);
  } catch (e) { next(e); }
}

export async function availableSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const timestamp = Number(req.query.dateTimestamp);
    if (!Number.isFinite(timestamp)) throw new AppError(400, "dateTimestamp must be a valid Unix timestamp in milliseconds");
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) throw new AppError(400, "Invalid timestamp");
    const dayStart = new Date(date); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(date); dayEnd.setHours(23,59,59,999);
    const sessions = await Session.aggregate([
      { $match: { status: "AVAILABLE", startTime: { $gte: dayStart, $lte: dayEnd } } },
      { $lookup: { from: "teachers", localField: "teacherId", foreignField: "_id", as: "teacher" } },
      { $unwind: "$teacher" },
      { $sort: { startTime: 1 } },
      { $project: { startTime: 1, endTime: 1, status: 1, teacher: { fullName: "$teacher.fullName", specialization: "$teacher.specialization", experience: "$teacher.experience" } } }
    ]);
    res.json(sessions);
  } catch (e) { next(e); }
}

export async function bookSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) throw new AppError(400, "Valid userId is required");
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, "Invalid session ID");
    if (!(await User.exists({ _id: userId }))) throw new AppError(404, "User not found");
    // Conditional update prevents two concurrent users from booking the same session.
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, status: "AVAILABLE", userId: null },
      { $set: { status: "BOOKED", userId } },
      { new: true }
    );
    if (!session) {
      const exists = await Session.exists({ _id: req.params.id });
      if (!exists) throw new AppError(404, "Session not found");
      throw new AppError(409, "Session is not available for booking");
    }
    res.json(session);
  } catch (e) { next(e); }
}

export async function completeSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(400, "Invalid session ID");
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, status: "BOOKED" },
      { $set: { status: "COMPLETED", completedAt: new Date() } },
      { new: true }
    );
    if (!session) {
      if (!(await Session.exists({ _id: req.params.id }))) throw new AppError(404, "Session not found");
      throw new AppError(409, "Only booked sessions can be completed");
    }
    res.json(session);
  } catch (e) { next(e); }
}
