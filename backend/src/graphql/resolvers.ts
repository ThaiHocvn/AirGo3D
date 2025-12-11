import * as fs from "fs";
import { GraphQLScalarType, Kind } from "graphql";
import { GraphQLUpload } from "graphql-upload-ts";
import * as path from "path";
import sharp from "sharp";
import logger from "../logger";
import Panorama from "../models/Panorama";
import { deleteFile, uploadDir } from "../utils/fileUpload";
import { validateUpload } from "../middlewares/validateUpload";
import { BUCKET, minioClient } from "../minioClient";

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

export const saveUploadedFile = async (file: any) => {
  const upload = await file;
  const { createReadStream, filename, mimetype } = upload;

  const uniqueSuffix = Date.now();
  const ext = path.extname(filename);
  const newFilename = `panorama-${uniqueSuffix}${ext}`;
  const thumbnailName = `panorama-${uniqueSuffix}-thumbnail${ext}`;

  // Read file stream into buffer
  const stream = createReadStream();
  const chunks: Buffer[] = [];

  const buffer: Buffer = await new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

  const size = buffer.length;

  // Upload original file to MinIO
  await minioClient.putObject(BUCKET, `uploads/${newFilename}`, buffer, size, {
    "Content-Type": mimetype,
  });

  // Create thumbnail
  const thumbnailBuffer = await sharp(buffer)
    .resize(200)
    .jpeg({ quality: 80 })
    .toBuffer();

  await minioClient.putObject(
    BUCKET,
    `uploads/${thumbnailName}`,
    thumbnailBuffer,
    thumbnailBuffer.length,
    { "Content-Type": "image/jpeg" }
  );

  // URLs
  const base = process.env.MINIO_PUBLIC_URL;
  const previewUrl = `${base}/${BUCKET}/uploads/${newFilename}`;
  const thumbnailUrl = `${base}/${BUCKET}/uploads/${thumbnailName}`;
  const previewPath = `${process.env.SERVER_URL}/api/image-preview/${newFilename}`;
  const thumbnailPath = `${process.env.SERVER_URL}/api/image-thumbnail/${thumbnailName}`;
  return {
    filename: newFilename,
    originalName: filename,
    mimeType: mimetype,
    size,
    previewPath,
    thumbnailPath,
    previewUrl,
    thumbnailUrl,
  };
};

export const resolvers = {
  Upload: GraphQLUpload,
  Date: DateScalar,
  JSON: JSONScalar,

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
        await validateUpload(file, name);

        const fileData = await saveUploadedFile(file);

        const panorama = new Panorama({
          name,
          filename: fileData.filename,
          originalName: fileData.originalName,
          previewPath: fileData.previewPath,
          thumbnailPath: fileData.thumbnailPath,
          size: fileData.size,
          mimeType: fileData.mimeType,
          previewUrl: fileData.previewUrl,
          thumbnailUrl: fileData.thumbnailUrl,
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
