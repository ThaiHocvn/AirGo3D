export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
};

export const validateUploadImage = (file: File) => {
  if (!file) throw new Error("File is required");

  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
};
