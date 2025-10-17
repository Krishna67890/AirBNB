import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landMark: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image1: {
        type: String,
        default: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739'
    },
    image2: {
        type: String,
        default: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
    },
    image3: {
        type: String,
        default: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
    }
}, {
    timestamps: true
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;