import { HydycoServer } from "./packages/core";
import { event } from "./packages/core/ioc";
import { sendMail } from "./packages/email";
import { job } from "./packages/core/ioc";

event.addListener("auth::register", (email) => {
  sendMail(
    "welcome-email",
    {
      to: email,
      from: "tech@hydyco.com",
      subject: "Welcome to Hydyco",
    },
    { name: email }
  )
    .then((res) => {
      console.log("Email Sent");
    })
    .catch((err) => {
      console.log(err);
    });
});

event.addListener("server::started", () => {
  job.addWorkerFunctions("sendMail", sendMail);

  setTimeout(() => {
    job.addTask("sendMail", [
      "welcome-email",
      {
        to: "mr.rahultawar@gmail.com",
        from: "tech@hydyco.com",
        subject: "Welcome to Hydyco",
      },
      { name: "mr.rahultawar@gmail.com" },
    ]);
  }, 3000);
});

HydycoServer.start();
