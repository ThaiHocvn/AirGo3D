jest.mock("../controllers/images.controller", () => ({
  previewHandler: (req: any, res: any) => {
    res.status(404).send("Not found (mocked)");
  },
  thumbnailHandler: (req: any, res: any) => {
    res.status(404).send("Not found (mocked)");
  },
}));
