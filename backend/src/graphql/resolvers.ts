import * as fs from "fs";
import { GraphQLScalarType, Kind } from "graphql";
import { GraphQLUpload } from "graphql-upload-ts";
import * as path from "path";
import sharp from "sharp";
import logger from "../logger";
import Panorama from "../models/Panorama";
import { deleteFile, uploadDir } from "../utils/fileUpload";

const DateScalar = new GraphQLScalarType<Date, string>({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new TypeError("Value is not a Date");
    }
    return value.toISOString();
  },
  parseValue(value: unknown): Date {
    if (typeof value !== "string") {
      throw new TypeError("Value is not a string");
    }
    return new Date(value);
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("AST kind is not STRING");
    }
    return new Date(ast.value);
  },
});

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "JSON custom scalar type",
  serialize(value: unknown) {
    return value;
  },
  parseValue(value: unknown) {
    return value;
  },
  parseLiteral(ast) {
    return (ast as any).value;
  },
});

const saveUploadedFile = async (
  file: any
): Promise<{
  filename: string;
  path: string;
  thumbnailPath: string;
  size: number;
  mimeType: string;
  originalName: string;
}> => {
  const upload = await file;
  const { createReadStream, filename, mimetype } = upload;

  const uniqueSuffix = Date.now();
  const ext = path.extname(filename);
  const newFilename = `panorama-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, newFilename);

  // Save original file using pipe (no more locked file!)
  const size = await new Promise<number>((resolve, reject) => {
    const rs = createReadStream();
    const ws = fs.createWriteStream(filePath);

    let totalSize = 0;

    rs.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
    });

    rs.pipe(ws);

    ws.on("finish", () => resolve(totalSize));
    ws.on("error", reject);
    rs.on("error", reject);
  });

  // Generate thumbnail
  const thumbnailPath = path.join(
    uploadDir,
    `panorama-${uniqueSuffix}-thumbnail${ext}`
  );

  await sharp(filePath)
    .resize(200, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  // Clear sharp cache to avoid Windows file lock
  sharp.cache(false);

  return {
    filename: newFilename,
    path: filePath,
    thumbnailPath,
    size,
    mimeType: mimetype,
    originalName: filename,
  };
};

export const resolvers = {
  Upload: GraphQLUpload,
  Date: DateScalar,
  JSON: JSONScalar,

  Panorama: {
    previewUrl: (parent: any) =>
      parent.previewUrl ||
      `${process.env.SERVER_URL}/api/image-preview/${parent.filename}`,
    thumbnailUrl: (parent: any) =>
      parent.thumbnailUrl ||
      `${process.env.SERVER_URL}/api/image-thumbnail/${parent.filename}`,
  },

  Query: {
    panoramas: async (
      _: any,
      args: {
        search?: string;
        isBookmarked?: boolean;
        limit?: number;
        offset?: number;
      },
      context: { req?: any }
    ) => {
      const { search, isBookmarked, limit = 100, offset = 0 } = args;

      try {
        const query: any = {};

        if (search) {
          query.name = { $regex: search, $options: "i" };
        }
        if (isBookmarked !== undefined) {
          query.isBookmarked = isBookmarked;
        }

        const total = await Panorama.countDocuments(query);

        const items = await Panorama.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .exec();

        return {
          items,
          total,
        };
      } catch (error) {
        logger.error("Error fetching panoramas:", error);
        throw error;
      }
    },

    panoramaStats: async (): Promise<{
      total: number;
      bookmarked: number;
      unbookmarked: number;
    }> => {
      try {
        const total = await Panorama.countDocuments();
        const bookmarked = await Panorama.countDocuments({
          isBookmarked: true,
        });
        return {
          total,
          bookmarked,
          unbookmarked: total - bookmarked,
        };
      } catch (error) {
        logger.error("Error fetching panorama stats:", error);
        throw error;
      }
    },
  },

  Mutation: {
    uploadPanorama: async (
      _: any,
      args: { file: any; name: string },
      context: { req?: any }
    ): Promise<any> => {
      const { file, name } = args;
      try {
        const fileData = await saveUploadedFile(file);

        const previewUrl = `${process.env.SERVER_URL}/api/image-preview/${fileData.filename}`;
        const thumbnailUrl = `${process.env.SERVER_URL}/api/image-thumbnail/${fileData.filename}`;

        const panorama = new Panorama({
          name,
          filename: fileData.filename,
          originalName: fileData.originalName,
          thumbnailPath: fileData.thumbnailPath,
          path: fileData.path,
          size: fileData.size,
          mimeType: fileData.mimeType,
          previewUrl,
          thumbnailUrl,
        });

        await panorama.save();

        return panorama;
      } catch (error) {
        logger.error("Error uploading panorama:", error);
        throw error;
      }
    },

    deletePanorama: async (
      _: any,
      args: { id: string },
      context: { req?: any }
    ): Promise<boolean> => {
      try {
        const panorama = await Panorama.findById(args.id);
        if (!panorama) throw new Error("Panorama not found");

        await deleteFile(panorama.filename);
        await Panorama.findByIdAndDelete(args.id);

        return true;
      } catch (error) {
        logger.error("Error deleting panorama:", error);
        throw error;
      }
    },

    toggleBookmark: async (
      _: any,
      args: { id: string },
      context: { req?: any }
    ): Promise<any> => {
      try {
        const panorama = await Panorama.findById(args.id);
        if (!panorama) throw new Error("Panorama not found");

        panorama.isBookmarked = !panorama.isBookmarked;
        panorama.updatedAt = new Date();
        await panorama.save();

        return panorama;
      } catch (error) {
        logger.error("Error toggling bookmark:", error);
        throw error;
      }
    },
  },
};
