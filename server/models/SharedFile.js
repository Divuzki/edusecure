import mongoose from "mongoose";

const sharedFileSchema = new mongoose.Schema(
  {
    filePath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passwordHash: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
sharedFileSchema.index({ expiresAt: 1 });
sharedFileSchema.index({ createdBy: 1 });

export default mongoose.model("SharedFile", sharedFileSchema);
