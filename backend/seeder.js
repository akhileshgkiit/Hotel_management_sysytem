const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const Review = require('./models/Review');
const Booking = require('./models/Booking');

// Load environment variables
dotenv.config();

// Seeding Data
const users = [
  {
    name: 'Super Admin',
    email: 'admin@luxestay.com',
    password: 'password123',
    role: 'admin',
    phone: '9876543210',
    isVerified: true,
  },
  {
    name: 'Mumbai Admin',
    email: 'mumbai_admin@luxestay.com',
    password: 'password123',
    role: 'hotelAdmin',
    phone: '9876543211',
    isVerified: true,
  },
  {
    name: 'Delhi Admin',
    email: 'delhi_admin@luxestay.com',
    password: 'password123',
    role: 'hotelAdmin',
    phone: '9876543212',
    isVerified: true,
  },
  {
    name: 'Goa Admin',
    email: 'goa_admin@luxestay.com',
    password: 'password123',
    role: 'hotelAdmin',
    phone: '9876543213',
    isVerified: true,
  },
  {
    name: 'Bangalore Admin',
    email: 'bangalore_admin@luxestay.com',
    password: 'password123',
    role: 'hotelAdmin',
    phone: '9876543214',
    isVerified: true,
  },
  {
    name: 'Regular Customer',
    email: 'user@luxestay.com',
    password: 'password123',
    role: 'user',
    phone: '9876543215',
    isVerified: true,
  },
];

const hotelsData = [
  {
    adminEmail: 'mumbai_admin@luxestay.com',
    hotelName: 'The Oberoi Mumbai',
    description: 'Located on Marine Drive, The Oberoi Mumbai offers luxury accommodations with stunning views of the Arabian Sea. Featuring an outdoor heated pool, 24-hour spa services, and multiple award-winning dining options.',
    address: 'Nariman Point, Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'Pool', 'Fitness Center', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Valet Parking'],
    status: 'approved',
  },
  {
    adminEmail: 'delhi_admin@luxestay.com',
    hotelName: 'The Leela Palace New Delhi',
    description: 'Set in New Delhi’s prestigious Diplomatic Enclave, The Leela Palace is a blend of Lutyens’ architecture and royal Indian culture. It features a rooftop temperature-controlled swimming pool, a luxurious spa, and world-class culinary experiences.',
    address: 'Chanakyapuri, Diplomatic Enclave',
    city: 'Delhi',
    state: 'Delhi',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Airport Shuttle', 'Fitness Center'],
    status: 'approved',
  },
  {
    adminEmail: 'goa_admin@luxestay.com',
    hotelName: 'W Goa Resort',
    description: 'Overlooking Vagator Beach, W Goa offers a vibrant coastal retreat. Guests can enjoy the rock pool set against a dramatic cliff backdrop, private beach access, a world-class wellness spa, and trendy lounge bars.',
    address: 'Vagator Beach, Bardez',
    city: 'Goa',
    state: 'Goa',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'Pool', 'Beachfront', 'Spa', 'Restaurant', 'Bar', 'Nightclub', 'Room Service'],
    status: 'approved',
  },
  {
    adminEmail: 'bangalore_admin@luxestay.com',
    hotelName: 'The Ritz-Carlton Bangalore',
    description: 'Centrally located in the business district, The Ritz-Carlton Bangalore features contemporary design coupled with traditional jaali screen motifs. Offers a rooftop bar, 24-hour fitness center, luxury spa, and highly curated dining venues.',
    address: '99 Residency Road',
    city: 'Bangalore',
    state: 'Karnataka',
    images: [
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Executive Lounge', 'Fitness Center'],
    status: 'approved',
  },
];

const roomsData = [
  {
    roomType: 'Single Room',
    description: 'Perfect for solo travelers. Comfortably furnished with a queen-sized bed, writing desk, and en-suite modern bathroom.',
    price: 3500,
    capacity: 1,
    images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'],
    availableRooms: 10,
  },
  {
    roomType: 'Double Room',
    description: 'Spacious room featuring a king-sized bed, cozy sitting area, flat-screen TV, and large windows with beautiful city or garden views.',
    price: 5500,
    capacity: 2,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'],
    availableRooms: 8,
  },
  {
    roomType: 'Deluxe Room',
    description: 'Premium room with elegant decor, high-end linens, luxury bath amenities, high-speed Wi-Fi, and a complimentary mini-bar.',
    price: 8500,
    capacity: 3,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'],
    availableRooms: 6,
  },
  {
    roomType: 'Suite Room',
    description: 'The ultimate luxury experience. Separate living room and bedroom, marble bathroom with a deep soaking tub, and exclusive lounge access.',
    price: 18000,
    capacity: 4,
    images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80'],
    availableRooms: 3,
  },
];

const reviewsData = [
  {
    rating: 5,
    comment: 'Absolutely stunning property! The hospitality was world-class, and the amenities were top-notch. Highly recommended!',
  },
  {
    rating: 4,
    comment: 'Wonderful stay. The rooms were clean, and the staff was very cooperative. Food was excellent, though a bit expensive.',
  },
];

const importData = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    console.log('Clearing old database records...');
    await Booking.deleteMany();
    await Review.deleteMany();
    await Room.deleteMany();
    await Hotel.deleteMany();
    await User.deleteMany();
    console.log('Old records cleared successfully.');

    // 2. Create Users
    console.log('Seeding Users...');
    const createdUsers = [];
    for (const u of users) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    console.log(`Successfully seeded ${createdUsers.length} users.`);

    // Extract regular user to author reviews
    const regularUser = createdUsers.find((u) => u.role === 'user');

    // 3. Create Hotels
    console.log('Seeding Hotels and Rooms...');
    for (const hData of hotelsData) {
      const adminUser = createdUsers.find((u) => u.email === hData.adminEmail);
      if (!adminUser) {
        console.error(`Admin user not found for email: ${hData.adminEmail}`);
        continue;
      }

      // Create Hotel
      const hotel = await Hotel.create({
        hotelAdmin: adminUser._id,
        hotelName: hData.hotelName,
        description: hData.description,
        address: hData.address,
        city: hData.city,
        state: hData.state,
        images: hData.images,
        amenities: hData.amenities,
        status: hData.status,
      });

      // Create Rooms for this Hotel
      for (const rData of roomsData) {
        await Room.create({
          hotelId: hotel._id,
          roomType: rData.roomType,
          description: rData.description,
          price: rData.price,
          capacity: rData.capacity,
          images: rData.images,
          availableRooms: rData.availableRooms,
        });
      }

      // Create Reviews for this Hotel (triggers schema middleware to compute avg rating)
      if (regularUser) {
        for (const rev of reviewsData) {
          await Review.create({
            userId: regularUser._id,
            hotelId: hotel._id,
            rating: rev.rating,
            comment: rev.comment,
          });
        }
      }

      console.log(`Seeded hotel "${hotel.hotelName}" with rooms and reviews.`);
    }

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
