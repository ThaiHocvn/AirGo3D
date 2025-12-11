import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,

  accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",

  pathStyle: true,
  region: "us-east-1",
});

export const BUCKET = "airgo3d";
