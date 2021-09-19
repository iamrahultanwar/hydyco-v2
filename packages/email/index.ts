import nodemailer from "nodemailer";
import { Router, Request, Response } from "express";
import data from "./email.json";
import { createSkipFile } from "../core/common/file";
import * as Eta from "eta";
Eta.defaultConfig.tags = ["{{", "}}"];
Eta.defaultConfig.varName = "vars";
createSkipFile("email", data); // create email json for admin to view it

const router = Router();
let smtp;
let Model;
const EmailPlugin = (config, HydycoModel) => {
  // connected
  smtp = nodemailer.createTransport(config);
  Model = HydycoModel;

  router.post("/send-mail", async (request, response) => {
    try {
      const { emailCode, to, from, bcc, cc } = request.body;
      await sendMail(emailCode, { to, from });
      return response.send({ status: true, message: "Mail Sent" });
    } catch (error) {
      return response
        .status(500)
        .send({ status: false, message: error.message });
    }
  });

  return router;
};

const sendMail = async (emailCode: string, mailOptions, vars = {}) => {
  if (!smtp) {
    throw new Error("Mailer not registered");
  }

  const Email = new Model("email").Model();

  const emailData: any = await Email.findOne({ emailCode }).lean();
  if (!emailData) return Promise.reject("email code is invalid");
  const renderHtml = Eta.render(emailData.html, {
    ...emailData.config,
    ...vars,
  });
  const mailData = {
    subject: emailData.subject,
    ...mailOptions,
    html: renderHtml,
  };
  smtp.sendMail(mailData);
};

export { EmailPlugin, sendMail };
