import moongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await moongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1); // Exit process with failure
  }
};