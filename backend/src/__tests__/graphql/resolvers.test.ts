import { resolvers } from "../../graphql/resolvers";
import Panorama from "../../models/Panorama";
import mongoose from "mongoose";

describe("GraphQL Resolvers", () => {
  beforeAll(async () => {
    const mongoURI = "mongodb://localhost:27017/airgo3d-test=";

    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Panorama.deleteMany({});
  });

  describe("Query panoramas", () => {
    const mockContext = { req: { ip: "127.0.0.1", get: () => "test-agent" } };

    it("returns empty array when no panoramas exist", async () => {
      const res = await resolvers.Query.panoramas({}, {}, mockContext);
      expect(res).toEqual([]);
    });

    it("returns existing panoramas", async () => {
      const item = await new Panorama({
        name: "Test Panorama",
        filename: "a.jpg",
        originalName: "a.jpg",
        path: "/uploads/a.jpg",
        size: 1234,
        mimeType: "image/jpeg",
      }).save();

      const res = await resolvers.Query.panoramas({}, {}, mockContext);

      expect(res.length).toBe(1);
      expect(res[0].name).toBe(item.name);
    });

    it("filters by search text", async () => {
      await Panorama.create([
        {
          name: "Beach View",
          filename: "1.jpg",
          path: "/a",
          size: 1,
          mimeType: "image/jpeg",
        },
        {
          name: "City Night",
          filename: "2.jpg",
          path: "/b",
          size: 1,
          mimeType: "image/jpeg",
        },
      ]);

      const res = await resolvers.Query.panoramas(
        {},
        { search: "beach" },
        mockContext
      );

      expect(res.length).toBe(1);
      expect(res[0].name).toBe("Beach View");
    });

    it("filters by bookmark", async () => {
      await Panorama.create([
        {
          name: "A",
          filename: "1.jpg",
          path: "/a",
          size: 1,
          mimeType: "image/jpeg",
          isBookmarked: true,
        },
        {
          name: "B",
          filename: "2.jpg",
          path: "/b",
          size: 1,
          mimeType: "image/jpeg",
          isBookmarked: false,
        },
      ]);

      const res = await resolvers.Query.panoramas(
        {},
        { isBookmarked: true },
        mockContext
      );

      expect(res.length).toBe(1);
      expect(res[0].isBookmarked).toBe(true);
    });
  });

  describe("Query panoramaStats", () => {
    it("returns correct counts", async () => {
      await Panorama.create([
        {
          name: "P1",
          filename: "p1.jpg",
          originalName: "p1.jpg",
          path: "/uploads/p1.jpg",
          size: 1000,
          mimeType: "image/jpeg",
          isBookmarked: true,
        },
        {
          name: "P2",
          filename: "p2.jpg",
          originalName: "p2.jpg",
          path: "/uploads/p2.jpg",
          size: 1000,
          mimeType: "image/jpeg",
          isBookmarked: false,
        },
      ]);

      const res = await resolvers.Query.panoramaStats();

      expect(res.total).toBe(2);
      expect(res.bookmarked).toBe(1);
      expect(res.unbookmarked).toBe(1);
    });
  });
});
