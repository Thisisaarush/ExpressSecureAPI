const app = require("./app");
const connectWithDB = require("./configs/db");
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 8000;
connectWithDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port -> ${PORT}`);
});
