export interface User {
  _id: string;
  name: string;
  email: string;
  tipo: 'admin' | 'vendedor' | 'supervisor' | 'gerente';
  vendedor_code?: string;
  codigo_supervisor?: string;
}

export interface PriceRequest {
  _id: string;
  requester_name: string;
  requester_id: string;
  customer_code: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  requested_price: string;
  quantity: string;
  product_maximo: string;
  product_minimo: string;
  product_promocional: string;
  currency: string;
  status: string;
  notes: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  altered_by?: string;
  altered_at?: string;
  codigo_supervisor?: string;
  nome_supervisor?: string;
  subrede_batch_id?: string;
  subrede_name?: string;
  discount_percent?: string;
  discounted_price?: string;
  supervisor_notes?: string;
  gerente_approved_by?: string;
  gerente_approved_at?: string;
  gerente_rejected_by?: string;
  gerente_rejected_at?: string;
  cancellation_requested?: boolean;
  cancellation_reason?: string;
  cancellation_requested_at?: string;
}

export interface Produto {
  e02_id: string;
  e02_livre: string;
  e02_desc: string;
  tabela_70: string;
  minimo: string;
  promo: string;
}

export interface Cliente {
  a00_id: string;
  a00_fantasia: string;
  rede_id: string;
  rede: string;
  canal_de_venda: string;
  segmento: string;
  a00_id_vend: string;
  vendedor: string;
  a00_id_vend_2: string;
  supervisor: string;
}

export interface Desconto {
  rede_id: string;
  rede_desc: string;
  valor_desconto: string;
  produto_id: string;
  produto_livre: string;
  produto_desc: string;
  e01_id: string;
  grupo: string;
  tipo_desconto: string;
  a23_id: string;
  a23_desc: string;
}

export interface Subrede {
  rede_id: string;
  rede_desc: string;
  clientes: Cliente[];
}
