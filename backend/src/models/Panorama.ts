import { Document, Schema, model } from "mongoose";

export interface IPanorama extends Document {
  name: string;
  filename: string;
  originalName: string;
  previewPath: string;
  thumbnailPath: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  isBookmarked: boolean;
  previewUrl: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const panoramaSchema = new Schema(
  {
    name: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    previewPath: { type: String, required: true },
    thumbnailPath: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    isBookmarked: { type: Boolean, default: false },
    previewUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

panoramaSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default model<IPanorama>("Panorama", panoramaSchema);
