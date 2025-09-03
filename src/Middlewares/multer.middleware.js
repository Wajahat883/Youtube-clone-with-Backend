import multer from "multer";

// Storage engine define kiya
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Jis folder me file save hogi
    cb(null, "./Public/Temp");
  },
  filename: function (req, file, cb) {
    // File ka naam decide karna
    cb(null, file.originalname);
  }
});

// Upload middleware export kar diya
export const upload = multer({ storage });
