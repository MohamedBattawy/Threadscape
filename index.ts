import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { PrismaClient } from './src/generated/prisma';

import authRoutes from './routes/authRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import productImageRoutes from './routes/productImageRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Set security headers with helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || ""],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
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
app.use('/api/product-images', productImageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 