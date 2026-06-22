import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    tipo: 'admin' | 'vendedor' | 'supervisor' | 'gerente';
    vendedor_code?: string;
    codigo_supervisor?: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    next();
  });
};

export const requireSupervisor = (req: AuthRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.tipo !== 'supervisor') {
      return res.status(403).json({ error: 'Acesso negado. Apenas supervisores.' });
    }
    next();
  });
};

export const requireGerente = (req: AuthRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.tipo !== 'gerente') {
      return res.status(403).json({ error: 'Acesso negado. Apenas gerentes.' });
    }
    next();
  });
};

export const requireAdminOrGerente = (req: AuthRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.tipo !== 'admin' && req.user?.tipo !== 'gerente') {
      return res.status(403).json({ error: 'Acesso negado. Apenas admin ou gerente.' });
    }
    next();
  });
};
