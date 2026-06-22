import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tipo: 'admin' | 'vendedor' | 'supervisor' | 'gerente';
  vendedor_code?: string;
  codigo_supervisor?: string;
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: ['admin', 'vendedor', 'supervisor', 'gerente'],
    required: true,
  },
  vendedor_code: {
    type: String,
  },
  codigo_supervisor: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
