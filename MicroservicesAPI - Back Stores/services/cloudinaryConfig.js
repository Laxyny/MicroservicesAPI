require('dotenv').config(); 
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key:    process.env.api_key,
    api_secret: process.env.api_secret
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'boutiques',
        allowed_formats: ['jpg', 'png'],
    },
});

/*const storageProduct = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'produits',
        allowed_formats: ['jpg', 'png'],
    },
});*/


const upload = multer({ storage });
//const uploadProduct = multer({ storageProduct });

module.exports = { cloudinary, upload };
