import mongoose from "mongoose";
import Panorama from "../../models/Panorama";

describe("Panorama Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/airgo3d-test");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Panorama.deleteMany({});
  });

  it("should create a panorama", async () => {
    const saved = await Panorama.create({
      name: "Test Panorama",
      filename: "test.jpg",
      originalName: "test.jpg",
      previewPath: "/p",
      thumbnailPath: "/t",
      previewUrl: "url/p",
      thumbnailUrl: "url/t",
      size: 1000,
      mimeType: "image/jpeg",
      isBookmarked: false,
    });

    expect(saved._id).toBeDefined();
    expect(saved.name).toBe("Test Panorama");
    expect(saved.isBookmarked).toBe(false);
  });

  it("should set default values", async () => {
    const saved = await Panorama.create({
      name: "Default Panorama",
      filename: "d.jpg",
      originalName: "d.jpg",
      previewPath: "/p2",
      thumbnailPath: "/t2",
      previewUrl: "url/p2",
      thumbnailUrl: "url/t2",
      size: 1234,
      mimeType: "image/jpeg",
    });

    expect(saved.isBookmarked).toBe(false);
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });
});
