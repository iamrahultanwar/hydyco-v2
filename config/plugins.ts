export default {
  auth: {
    secretOrKey: "random",
    expiresIn: 30000,
  },
  file: { uploadDir: "uploads", uploadUrl: process.env.UPLOAD_URL },
  email: {
    port: 1025,
    tls: {
      rejectUnauthorized: false,
    },
  },
};
