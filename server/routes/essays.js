import express from "express";
import Essay from "../models/Essay.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { essaySchema, gradeSchema } from "../schemas/essays.js";

const router = express.Router();

router.post("/", validateSchema(essaySchema), async (req, res, next) => {
  try {
    const { title, content, courseId } = req.body;
    const studentId = req.user._id;

    const essay = new Essay({
      title,
      content,
      studentId,
      courseId,
    });

    await essay.save();
    await essay.populate("studentId", "name email");

    res.status(201).json(essay);
  } catch (error) {
    next(error);
  }
});

router.get("/student/:id", async (req, res, next) => {
  try {
    const essays = await Essay.find({ studentId: req.params.id })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json(essays);
  } catch (error) {
    next(error);
  }
});

router.get("/teacher", async (req, res, next) => {
  try {
    const essays = await Essay.find()
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json(essays);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/grade",
  validateSchema(gradeSchema),
  async (req, res, next) => {
    try {
      const { score } = req.body;

      const essay = await Essay.findByIdAndUpdate(
        req.params.id,
        { score },
        { new: true }
      ).populate("studentId", "name email");

      if (!essay) {
        return res.status(404).json({ error: "Essay not found" });
      }

      res.json(essay);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
