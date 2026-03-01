import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import referralRoutes from './routes/referralRoutes';
import serviceRoutes from './routes/serviceRoutes';
import { loggerMiddleware } from './middlewares/logger-middleware';
import { clerkMiddleware } from '@clerk/express';
import webHooksRouter from './middlewares/webhooks/webhooks';
import { globalErrorHandlingMiddleware } from './errors/errors';
// Load env vars before using them
dotenv.config(); 

const server = express();
// Webhooks
server.use("/api/webhooks", webHooksRouter);
// Middleware
server.use(clerkMiddleware())
server.use(express.json());
server.use(loggerMiddleware);
// Routes
server.use('/api/users', userRoutes);
server.use('/api/referrals', referralRoutes);
server.use('/api/services', serviceRoutes);
// Global Error Handler (must be after all routes)
server.use(globalErrorHandlingMiddleware);
// Connect to Database
connectDB();
// Start Server
    const Port = process.env.PORT || 3000;
    server.listen(Port, () => {
      console.log(`🚀 Server is running on port ${Port}`);
      console.log(`📡 API: http://localhost:${Port}`);
    });

console.log("Hello world");

