import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerVendedorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  vendedor_code: z.string().optional(),
});

export const registerSupervisorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  codigo_supervisor: z.string().min(1, 'Código do supervisor é obrigatório'),
});

export const registerGerenteSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const priceRequestSchema = z.object({
  customer_code: z.string().min(1, 'Cliente é obrigatório'),
  customer_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  product_id: z.string().min(1, 'Produto é obrigatório'),
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  requested_price: z.string().min(1, 'Preço solicitado é obrigatório'),
  quantity: z.string().min(1, 'Quantidade é obrigatória'),
  product_maximo: z.string().min(1),
  product_minimo: z.string().min(1),
  product_promocional: z.string().min(1),
  notes: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
  codigo_supervisor: z.string().optional(),
  nome_supervisor: z.string().optional(),
  subrede_batch_id: z.string().optional(),
  subrede_name: z.string().optional(),
  discount_percent: z.string().optional(),
  discounted_price: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterVendedorFormData = z.infer<typeof registerVendedorSchema>;
export type RegisterSupervisorFormData = z.infer<typeof registerSupervisorSchema>;
export type RegisterGerenteFormData = z.infer<typeof registerGerenteSchema>;
export type PriceRequestFormData = z.infer<typeof priceRequestSchema>;
