// express router to handle file uploads

import { Router, Request, Response } from "express";
import path from "path";
import multer from "multer";

import data from "./file.json";
import { writeMappingFile } from "../core/common/file";
import { rootPath } from "../core/common/path";

writeMappingFile("file", data); // create file json for admin to view it

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * Express router to handle file upload
 * @param {string} uploadDir - Directory for uploading files from root folder
 * @return {Router} router - Express router
 */
const FilePlugin = ({ uploadDir = "uploads", uploadUrl }, HydycoModel) => {
  var router = Router();
  const File = new HydycoModel("file").Model();

  router.get("/file/get/:fileName", (req, res) => {
    const { fileName } = req.params;
    return res.sendFile(path.join(rootPath, uploadDir, fileName));
  });

  router.post(
    "/file/:field",
    (req, res, next) => {
      const { field } = req.params;
      upload.single(field)(req, res, next);
    },
    async function (req: any, res, next) {
      const { field } = req.params;
      req.file.fieldname = field;
      const file = await File.create({
        ...req.file,
        path: "/admin/file/get/" + req.file.filename,
      });
      if (field === "upload") {
        return res.send({
          uploaded: true,
          url: uploadUrl + file.filename,
        });
      }
      return res.send(file._id);
    }
  );

  router.post("/file/create/url", async (req, res) => {
    const { url } = req.body;

    return res.send(url.toString());
  });

  return router;
};

export { FilePlugin };
