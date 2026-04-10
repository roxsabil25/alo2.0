const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = "public/uploads/";

        // যদি ইউআরএল এ 'blog' শব্দটি থাকে, তবে blogs ফোল্ডারে সেভ হবে
        if (req.originalUrl.includes("blog")) {
            dest = "public/uploads/blogs/";
        }

        // ফোল্ডার না থাকলে তৈরি করে নেবে
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // ফাইলের নাম ইউনিক করা এবং স্পেস রিমুভ করা
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = upload;