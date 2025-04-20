import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { PrismaClient } from './src/generated/prisma';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get('/api/test', async (req: Request, res: Response) => {
  try {
    const productCount = await prisma.product.count();
    
    res.json({ 
      success: true,
      message: 'Backend API is running successfully!',
      timestamp: new Date(),
      databaseConnected: true,
      productCount
    });
  } catch (error) {
    console.error('Database error:', error);
    res.json({
      success: true, 
      message: 'Backend API is running but database connection failed!',
      timestamp: new Date(),
      databaseConnected: false
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 