import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Conectado ao MongoDB Atlas');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin já existe!');
      
      // Atualizar tipo para admin caso esteja incorreto
      if (existingAdmin.tipo !== 'admin') {
        existingAdmin.tipo = 'admin';
        await existingAdmin.save();
        console.log('✅ Tipo do usuário atualizado para admin');
      }
      
      process.exit(0);
    }

    // Criar novo admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      tipo: 'admin',
    });

    await admin.save();
    
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

createAdmin();
