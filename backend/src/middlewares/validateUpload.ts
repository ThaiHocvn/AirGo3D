export const validateUpload = async (
  filePromise: any,
  name: string
): Promise<void> => {
  const file = await filePromise;
  if (!file) throw new Error("File is required");
  if (!name || name.trim() === "") throw new Error("Name is required");

  // Allow image: image/jpeg, image/png, image/webp, image/gif...
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
};
