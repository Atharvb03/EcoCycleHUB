import mongoose from "mongoose";
import dotenv from "dotenv";
import Center from "./models/centerModel.js";

// Load env vars
dotenv.config();

const centers = [
  {
    name: 'Mashaallah Scrap (Shivtar)',
    type: 'recycle',
    address: 'Near Telephone Exchange, Shivtar, Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Scrap materials', 'General scrap'],
    location: { lat: 17.7186, lng: 73.3953 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Sonkar Scrap Merchant',
    type: 'recycle',
    address: 'Near Railway Station, Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Plastic', 'Paper', 'General scrap'],
    location: { lat: 17.7165, lng: 73.3930 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Kalpataru Environment & Engineering Services',
    type: 'both',
    address: 'Main Road, Sanmitra Nagar, Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Waste management', 'Water purifier repair'],
    location: { lat: 17.7220, lng: 73.3980 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Moreshwar and Ravindra Brothers',
    type: 'repair',
    address: 'Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Gas stove repair'],
    location: { lat: 17.7200, lng: 73.3960 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Unique Systems',
    type: 'repair',
    address: 'Samartha Nagar, Near MSEB Office/Government Godowns, Shivtar, Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Laptops', 'LED projectors', 'Routers', 'RO purifiers'],
    location: { lat: 17.7190, lng: 73.3940 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Classic Systems',
    type: 'repair',
    address: 'Teenbatti Naka, Near City Pride Anand Theatre, Khed Dapoli Road, Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Computer/laptop repairs and parts'],
    location: { lat: 17.7210, lng: 73.3970 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Omkar Computer Services',
    type: 'repair',
    address: 'Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Laptop repairs', 'CCTV services'],
    location: { lat: 17.7180, lng: 73.3960 },
    city: 'Khed',
    state: 'Maharashtra'
  },
  {
    name: 'Login Systems',
    type: 'repair',
    address: 'Khed, Ratnagiri',
    phone: 'Justdial',
    services: ['Computer and laptop repair'],
    location: { lat: 17.7170, lng: 73.3950 },
    city: 'Khed',
    state: 'Maharashtra'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    const count = await Center.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Database already has ${count} centers. Skipping seed.`);
      process.exit();
    }

    await Center.insertMany(centers);
    console.log("✅ Successfully seeded 8 centers!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
