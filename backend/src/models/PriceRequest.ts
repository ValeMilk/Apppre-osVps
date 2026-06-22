import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceRequest extends Document {
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
  created_at: Date;
  approved_by?: string;
  approved_at?: Date;
  altered_by?: string;
  altered_at?: Date;
  codigo_supervisor?: string;
  nome_supervisor?: string;
  subrede_batch_id?: string;
  subrede_name?: string;
  discount_percent?: string;
  discounted_price?: string;
  supervisor_notes?: string;
  gerente_approved_by?: string;
  gerente_approved_at?: Date;
  gerente_rejected_by?: string;
  gerente_rejected_at?: Date;
  cancellation_requested?: boolean;
  cancellation_reason?: string;
  cancellation_requested_at?: Date;
}

const PriceRequestSchema = new Schema<IPriceRequest>({
  requester_name: {
    type: String,
    required: true,
  },
  requester_id: {
    type: String,
    required: true,
  },
  customer_code: {
    type: String,
    required: true,
  },
  customer_name: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  requested_price: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  product_maximo: {
    type: String,
    required: true,
  },
  product_minimo: {
    type: String,
    required: true,
  },
  product_promocional: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    default: 'R$',
  },
  status: {
    type: String,
    enum: [
      'Pendente',
      'Aguardando Gerência',
      'Aprovado',
      'Aprovado pela Gerência',
      'Reprovado',
      'Reprovado pela Gerência',
      'Alterado',
      'Cancelado',
    ],
    default: 'Pendente',
  },
  notes: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  approved_by: String,
  approved_at: Date,
  altered_by: String,
  altered_at: Date,
  codigo_supervisor: String,
  nome_supervisor: String,
  subrede_batch_id: String,
  subrede_name: String,
  discount_percent: String,
  discounted_price: String,
  supervisor_notes: String,
  gerente_approved_by: String,
  gerente_approved_at: Date,
  gerente_rejected_by: String,
  gerente_rejected_at: Date,
  cancellation_requested: {
    type: Boolean,
    default: false,
  },
  cancellation_reason: String,
  cancellation_requested_at: Date,
});

export const PriceRequest = mongoose.model<IPriceRequest>('PriceRequest', PriceRequestSchema);
