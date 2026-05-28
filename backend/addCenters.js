// Script to add sample recycle/repair centers to database
// Run this with: node addCenters.js

import { config } from 'dotenv';
import mongoose from 'mongoose';
import Center from './models/centerModel.js';

config();

const centers = [
    {
        name: 'Green Earth Recycling Center',
        address: 'Pimpri, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        zipcode: '411019',
        phone: '+91 20 1234 5678',
        email: 'greenearth@example.com',
        type: 'recycle',
        location: {
            lat: 18.4595,
            lng: 73.8498
        }
    },
    {
        name: 'QuickFix Repair Shop',
        address: 'Chinchwad, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        zipcode: '411019',
        phone: '+91 20 8765 4321',
        email: 'quickfix@example.com',
        type: 'repair',
        location: {
            lat: 18.4550,
            lng: 73.8540
        }
    },
    {
        name: 'EcoCycle Center',
        address: 'Katraj, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        zipcode: '411046',
        phone: '+91 20 5678 1234',
        email: 'ecocycle@example.com',
        type: 'recycle',
        location: {
            lat: 18.4500,
            lng: 73.8500
        }
    },
    {
        name: 'Electro Repair Hub',
        address: 'Sinhagad Road, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        zipcode: '411051',
        phone: '+91 20 9988 7766',
        email: 'electrohub@example.com',
        type: 'repair',
        location: {
            lat: 18.4580,
            lng: 73.8525
        }
    },
    {
        name: 'Plastic & Paper Recycling Depot',
        address: 'Near Warje, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        zipcode: '411058',
        phone: '+91 20 3344 5566',
        email: 'plasticpaper@example.com',
        type: 'both',
        location: {
            lat: 18.4600,
            lng: 73.8480
        }
    }
];

async function addCenters() {
    try {
        // Connect to MongoDB (use MONGODB_URI from .env)
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing centers (optional - comment this out if you want to keep existing ones)
        // await Center.deleteMany({});
        // console.log('Cleared existing centers');

        // Add new centers
        const result = await Center.insertMany(centers);
        console.log(`Successfully added ${result.length} centers`);
        console.log('Centers added with IDs:', result.map(c => c._id));

        process.exit(0);
    } catch (error) {
        console.error('Error adding centers:', error);
        process.exit(1);
    }
}

addCenters();
