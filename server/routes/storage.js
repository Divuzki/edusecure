import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import StorageConfig from "../models/StorageConfig.js";
import SharedFile from "../models/SharedFile.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { storageConfigSchema, shareLinkSchema } from "../schemas/storage.js";

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

router.post(
  "/test",
  validateSchema(storageConfigSchema),
  async (req, res, next) => {
    try {
      const { name, provider, config } = req.body;

      const storageConfig = new StorageConfig({
        name,
        provider,
        config,
      });

      await storageConfig.save();
      res.status(201).json(storageConfig);
    } catch (error) {
      next(error);
    }
  }
);

// Upload file endpoint
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const sharedFile = new SharedFile({
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdBy: req.user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    });

    await sharedFile.save();
    await sharedFile.populate("createdBy", "name email");

    res.status(201).json(sharedFile);
  } catch (error) {
    next(error);
  }
});

router.get("/files", async (req, res, next) => {
  try {
    const files = await SharedFile.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/share/:fileId",
  validateSchema(shareLinkSchema),
  async (req, res, next) => {
    try {
      const { password, expiresAt } = req.body;

      const file = await SharedFile.findById(req.params.fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Update file with sharing options
      file.passwordHash = password;
      file.expiresAt = new Date(expiresAt);
      await file.save();
      await file.populate("createdBy", "name email");

      res.json(file);
    } catch (error) {
      next(error);
    }
  }
);

// Download file endpoint
router.get("/download/:fileId", async (req, res, next) => {
  try {
    const file = await SharedFile.findById(req.params.fileId);
    if (!file || !file.isActive) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if file has expired
    if (file.expiresAt < new Date()) {
      return res.status(410).json({ error: "File has expired" });
    }

    // Increment access count
    file.accessCount += 1;
    await file.save();

    // Send file
    res.download(file.filePath, file.originalName);
  } catch (error) {
    next(error);
  }
});

export default router;
