import mongoose, { InferSchemaType } from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, min: 2, max: 50 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, min: 6 },
  },
  {
    timestamps: true,
  }
);

export type UserType = InferSchemaType<typeof UserSchema>;

export default mongoose.model('User', UserSchema);
