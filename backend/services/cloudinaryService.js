const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} fileBuffer 
 * @param {String} folder 
 * @returns {Promise<String>} Image URL
 */
const uploadImage = (fileBuffer, folder = 'hotel_booking') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary configuration keys are default placeholder keys
    const isPlaceholderKey =
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY.includes('12345') ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'hotel_booking_cloud';

    if (isPlaceholderKey) {
      console.log('Cloudinary credentials are default placeholders. Returning mock URL.');
      // Random high quality hotel images
      const mockImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      ];
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      return resolve(mockImages[randomIndex]);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error.message || error);
          // Gracefully fallback to a mock URL on connection error
          return resolve('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80');
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadImage };
