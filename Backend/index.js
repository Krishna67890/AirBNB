import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Server is running with Local MongoDB!', 
        status: 'OK',
        database: 'MongoDB Local',
        timestamp: new Date().toISOString()
    });
});

// Mock user endpoint (temporary)
app.get('/api/user/currentuser', (req, res) => {
    res.json({ 
        user: { 
            id: '1', 
            name: 'Test User', 
            email: 'test@example.com' 
        } 
    });
});

// Mock listings endpoint (temporary)
app.get('/api/listing/get', (req, res) => {
    res.json([
        {
            _id: '1',
            title: 'Beautiful Beach House',
            description: 'Amazing beachfront property',
            rent: 2500,
            city: 'Goa',
            landMark: 'Near Main Beach',
            category: 'Villa',
            image1: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
            image2: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
            image3: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
            createdAt: new Date().toISOString()
        },
        {
            _id: '2',
            title: 'City Center Apartment',
            description: 'Modern apartment in downtown',
            rent: 1800,
            city: 'Mumbai', 
            landMark: 'Downtown',
            category: 'Flat',
            image1: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
            image2: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
            image3: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4',
            createdAt: new Date().toISOString()
        }
    ]);
});

// Mock listing creation endpoint (temporary)
app.post('/api/listing/add', (req, res) => {
    console.log('Create listing called with data:', req.body);
    
    const newListing = {
        _id: 'mock-' + Date.now(),
        title: req.body.title,
        description: req.body.description,
        rent: req.body.rent,
        city: req.body.city,
        landMark: req.body.landMark,
        category: req.body.category,
        image1: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
        image2: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
        image3: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
        createdAt: new Date().toISOString()
    };
    
    res.json({ 
        message: 'Listing created successfully!',
        listing: newListing,
        _id: newListing._id
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log(`🗄️  Using Local MongoDB`);
    
    // Connect to local MongoDB
    connectDb();
});