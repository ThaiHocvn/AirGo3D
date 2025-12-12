import mongoose from "mongoose";
import Panorama from "../../models/Panorama";
import { resolvers } from "../../graphql/resolvers";

jest.mock("../../middlewares/validateUpload", () => ({
  validateUpload: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../utils/fileUpload", () => ({
  deleteFile: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../minioClient", () => ({
  BUCKET: "test-bucket",
  minioClient: {
    putObject: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock("fs/promises", () => ({
  writeFile: jest.fn().mockResolvedValue(true),
}));

jest.mock("sharp", () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from("thumbnail")),
  }));
});

import { Readable } from "stream";
import { deleteFile } from "../../utils/fileUpload";

describe("GraphQL Resolvers", () => {
  const ctx = { req: { ip: "127.0.0.1", get: () => "jest-agent" } };

  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/airgo3d-test");
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Panorama.deleteMany({});
    jest.clearAllMocks();
  });

  describe("Query panoramas", () => {
    it("returns empty array when no items exist", async () => {
      const res = await resolvers.Query.panoramas({}, {}, ctx);
      expect(res).toEqual({ items: [], total: 0 });
    });

    it("returns items when exists", async () => {
      const item = await Panorama.create({
        name: "Test Panorama",
        filename: "a.jpg",
        originalName: "a.jpg",
        size: 1234,
        mimeType: "image/jpeg",
        thumbnailUrl: "u/t",
        previewUrl: "u/p",
        thumbnailPath: "/t",
        previewPath: "/p",
      });

      const res = await resolvers.Query.panoramas({}, {}, ctx);

      expect(res.items.length).toBe(1);
      expect(res.items[0].name).toBe(item.name);
    });

    it("filters by search keyword", async () => {
      await Panorama.create([
        {
          name: "Beach View",
          filename: "1.jpg",
          originalName: "1.jpg",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "t",
          previewUrl: "p",
          thumbnailPath: "/t",
          previewPath: "/p",
        },
        {
          name: "City Night",
          filename: "2.jpg",
          originalName: "2.jpg",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "t2",
          previewUrl: "p2",
          thumbnailPath: "/t2",
          previewPath: "/p2",
        },
      ]);

      const res = await resolvers.Query.panoramas({}, { search: "beach" }, ctx);

      expect(res.items.length).toBe(1);
      expect(res.items[0].name).toBe("Beach View");
    });

    it("filters by bookmark", async () => {
      await Panorama.create([
        {
          name: "A",
          filename: "1.jpg",
          originalName: "1.jpg",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "u1",
          previewUrl: "u1p",
          thumbnailPath: "/t1",
          previewPath: "/p1",
          isBookmarked: true,
        },
        {
          name: "B",
          filename: "2.jpg",
          originalName: "2.jpg",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "u2",
          previewUrl: "u2p",
          thumbnailPath: "/t2",
          previewPath: "/p2",
          isBookmarked: false,
        },
      ]);

      const res = await resolvers.Query.panoramas(
        {},
        { isBookmarked: true },
        ctx
      );

      expect(res.items.length).toBe(1);
      expect(res.items[0].isBookmarked).toBe(true);
    });
  });

  describe("Query panoramaStats", () => {
    it("returns correct stats", async () => {
      await Panorama.create([
        {
          name: "P1",
          filename: "1.jpg",
          originalName: "1",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "t1",
          previewUrl: "p1",
          thumbnailPath: "/t1",
          previewPath: "/p1",
          isBookmarked: true,
        },
        {
          name: "P2",
          filename: "2.jpg",
          originalName: "2",
          size: 1,
          mimeType: "image/jpeg",
          thumbnailUrl: "t2",
          previewUrl: "p2",
          thumbnailPath: "/t2",
          previewPath: "/p2",
          isBookmarked: false,
        },
      ]);

      const res = await resolvers.Query.panoramaStats();

      expect(res.total).toBe(2);
      expect(res.bookmarked).toBe(1);
      expect(res.unbookmarked).toBe(1);
    });
  });

  describe("Mutation uploadPanorama", () => {
    it("uploads panorama and saves to DB", async () => {
      const fakeFile = {
        createReadStream: () => {
          const stream = new Readable();
          stream.push(Buffer.from("fake-image-data"));
          stream.push(null);
          return stream;
        },
        filename: "test.jpg",
        mimetype: "image/jpeg",
        encoding: "7bit",
      };

      const args = {
        name: "Uploaded Panorama",
        file: Promise.resolve(fakeFile),
      };

      const result = await resolvers.Mutation.uploadPanorama({}, args, ctx);

      expect(result.name).toBe("Uploaded Panorama");
      expect(result.filename).toMatch(/panorama-/);

      const stored = await Panorama.findOne({ name: "Uploaded Panorama" });
      expect(stored).not.toBeNull();
    });
  });

  describe("Mutation toggleBookmark", () => {
    it("toggles bookmark correctly", async () => {
      const p = await Panorama.create({
        name: "X",
        filename: "1.jpg",
        originalName: "1",
        size: 1,
        mimeType: "image/jpeg",
        thumbnailUrl: "t",
        previewUrl: "p",
        thumbnailPath: "/t",
        previewPath: "/p",
        isBookmarked: false,
      });

      const res = await resolvers.Mutation.toggleBookmark(
        {},
        { id: p._id },
        ctx
      );

      expect(res.isBookmarked).toBe(true);

      const updated = await Panorama.findById(p._id);
      expect(updated?.isBookmarked).toBe(true);
    });
  });

  describe("Mutation deletePanorama", () => {
    it("deletes panorama and calls deleteFile", async () => {
      const p = await Panorama.create({
        name: "DeleteMe",
        filename: "del.jpg",
        originalName: "del",
        size: 1,
        mimeType: "image/jpeg",
        thumbnailUrl: "t",
        previewUrl: "p",
        thumbnailPath: "/t",
        previewPath: "/p",
      });

      const result = await resolvers.Mutation.deletePanorama(
        {},
        { id: p._id },
        ctx
      );

      expect(result).toBe(true);
      expect(deleteFile).toHaveBeenCalledWith("del.jpg");

      const exists = await Panorama.findById(p._id);
      expect(exists).toBeNull();
    });
  });
});
