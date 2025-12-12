import mongoose from "mongoose";
import Panorama, { IPanorama } from "../../models/Panorama";

describe("Panorama Model", () => {
  beforeAll(async () => {
    const mongoURI = "mongodb://localhost:27017/airgo3d-test";

    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Panorama.deleteMany({});
  });

  it("should create a panorama", async () => {
    const panoramaData: Partial<IPanorama> = {
      name: "Test Panorama",
      filename: "test-panorama.jpg",
      originalName: "test.jpg",
      previewPath: "/uploads/test-panorama.jpg",
      thumbnailPath: "/uploads/test-panorama-thumbnail.jpg",
      size: 1024000,
      mimeType: "image/jpeg",
      isBookmarked: false,
    };

    const savedPanorama = await new Panorama(panoramaData).save();

    expect(savedPanorama._id).toBeDefined();
    expect(savedPanorama.name).toBe("Test Panorama");
    expect(savedPanorama.isBookmarked).toBe(false);
  });

  it("should set default values for missing fields", async () => {
    const panoramaData: Partial<IPanorama> = {
      name: "Test Panorama Defaults",
      filename: "test-default.jpg",
      originalName: "test-default.jpg",
      previewPath: "/uploads/test-default.jpg",
      thumbnailPath: "/uploads/test-default-thumbnail.jpg",
      size: 1024000,
      mimeType: "image/jpeg",
    };

    const savedPanorama = await new Panorama(panoramaData).save();

    expect(savedPanorama.isBookmarked).toBe(false);
    expect(savedPanorama.createdAt).toBeInstanceOf(Date);
    expect(savedPanorama.updatedAt).toBeInstanceOf(Date);
  });
});
