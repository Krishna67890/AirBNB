import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('💡 Please make sure MongoDB is running locally');
        console.log('💡 Run: mongod (in a separate terminal)');
        // Don't exit - let server run with mock data
    }
};

export default connectDb;