import mongoose, { InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
      min: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please enter an Email'],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      validate: {
        validator: function (value: any) {
          // Use a regular expression to check for the desired pattern
          const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
          return passwordPattern.test(value);
        },
        message:
          'Password must contain at least one number, one uppercase letter, one lowercase letter, and be at least 6 characters long',
      },
    },
    image: {
      type: String,
      required: [true, 'Please enter an image'],
      default:
        'https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_1280.png',
    },
    bio: {
      type: String,
      min: [10, 'Bio must be at least 10 characters long'],
      max: [250, 'Bio must be at most 100 characters long'],
      default: 'Hello there!',
    },
    phone: {
      type: String,
      default: '+234',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving to database using the pre() hook method
UserSchema.pre('save', async function (next) {
  // function to hash the password before saving to database

  if (!this.isModified('password')) {
    return next(); // If the password is not modified, continue saving
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.get('password'), salt);
    this.set('password', hashedPassword);
    return next(); // Call the next() function to continue saving
  } catch (error) {
    console.log(error); // Pass any error to the next middleware
  }
});

export type UserType = InferSchemaType<typeof UserSchema>;

export default mongoose.model('User', UserSchema);
