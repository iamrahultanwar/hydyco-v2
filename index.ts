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
  console.log("We are up");
});

HydycoServer.start();
