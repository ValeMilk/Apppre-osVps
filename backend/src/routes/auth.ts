import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Schema de validação para registro
const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  tipo: z.enum(['admin', 'vendedor', 'supervisor', 'gerente']),
  vendedor_code: z.string().optional(),
  codigo_supervisor: z.string().optional(),
});

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register - Registro público (dev apenas)
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      ...data,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// POST /api/auth/admin-register - Registrar vendedor
router.post('/admin-register', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = registerSchema.parse({ ...req.body, tipo: 'vendedor' });

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      tipo: 'vendedor',
      vendedor_code: data.vendedor_code,
    });

    await user.save();

    res.status(201).json({ message: 'Vendedor criado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao registrar vendedor:', error);
    res.status(500).json({ error: 'Erro ao criar vendedor' });
  }
});

// POST /api/auth/supervisor-register - Registrar supervisor
router.post('/supervisor-register', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = registerSchema.parse({ ...req.body, tipo: 'supervisor' });

    if (!data.codigo_supervisor) {
      return res.status(400).json({ error: 'codigo_supervisor é obrigatório para supervisores' });
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      tipo: 'supervisor',
      codigo_supervisor: data.codigo_supervisor,
    });

    await user.save();

    res.status(201).json({ message: 'Supervisor criado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao registrar supervisor:', error);
    res.status(500).json({ error: 'Erro ao criar supervisor' });
  }
});

// POST /api/auth/gerente-register - Registrar gerente
router.post('/gerente-register', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = registerSchema.parse({ ...req.body, tipo: 'gerente' });

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      tipo: 'gerente',
    });

    await user.save();

    res.status(201).json({ message: 'Gerente criado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao registrar gerente:', error);
    res.status(500).json({ error: 'Erro ao criar gerente' });
  }
});

// GET /api/auth/users - Listar usuários (name, email)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        tipo: user.tipo,
        vendedor_code: user.vendedor_code,
        codigo_supervisor: user.codigo_supervisor,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        tipo: user.tipo,
        vendedor_code: user.vendedor_code,
        codigo_supervisor: user.codigo_supervisor,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// POST /api/auth/fix-admin - Dev: corrigir campo tipo do admin
router.post('/fix-admin', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.tipo = 'admin';
    await user.save();

    res.json({ message: 'Tipo do usuário atualizado para admin' });
  } catch (error) {
    console.error('Erro ao atualizar tipo:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo' });
  }
});

export default router;
