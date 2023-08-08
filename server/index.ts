import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import userRouter from './routes/userRoutes';

const app = express();
//============= Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to the Authentication API!');
});

//============= Routes
app.use('/api/users', userRouter);

//============= Server
const PORT = process.env.PORT || 5000;
const CONNECTION_URI = process.env.MONGO_URI || '';

mongoose.set('strictQuery', false);
mongoose
  .connect(CONNECTION_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
