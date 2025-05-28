import mongoose from "mongoose";

const essaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    score: {
      overall: {
        type: Number,
        min: 0,
        max: 100,
      },
      grammar: {
        type: Number,
        min: 0,
        max: 100,
      },
      content: {
        type: Number,
        min: 0,
        max: 100,
      },
      structure: {
        type: Number,
        min: 0,
        max: 100,
      },
      feedback: {
        type: String,
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
essaySchema.index({ studentId: 1, courseId: 1 });
essaySchema.index({ submittedAt: -1 });

export default mongoose.model("Essay", essaySchema);
