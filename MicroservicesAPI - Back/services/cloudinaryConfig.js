const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: 'dnqtsijwl',
    api_key: '585543272674434',
    api_secret: 'H5HnyLMps6FOjf7ROxYJ8YYGZac'
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
