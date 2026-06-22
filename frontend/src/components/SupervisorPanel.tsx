import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { User, PriceRequest } from '../types';
import { api } from '../config/api';
import { formatarPreco } from '../utils/dataHelpers';

interface SupervisorPanelProps {
  user: User;
}

export default function SupervisorPanel({ user }: SupervisorPanelProps) {
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'forward' | null;
    id: string;
    isBatch: boolean;
  }>({ open: false, type: null, id: '', isBatch: false });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000); // Polling 5s
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.get('/api/requests/supervisor');
      setRequests(data);
    } catch (err: any) {
      setError('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if ((actionDialog.type === 'reject' || actionDialog.type === 'forward') && notes.trim().length === 0) {
      setError('Justificativa é obrigatória');
      return;
    }

    try {
      const endpoint = actionDialog.isBatch
        ? `/api/requests/batch/${actionDialog.id}/${actionDialog.type === 'approve' ? 'approve' : actionDialog.type === 'reject' ? 'reject' : 'encaminhar-gerencia'}`
        : `/api/requests/${actionDialog.id}/${actionDialog.type === 'approve' ? 'approve' : actionDialog.type === 'reject' ? 'reject' : 'encaminhar-gerencia'}`;

      if (actionDialog.type === 'approve') {
        await api.patch(endpoint);
      } else {
        await api.patch(endpoint, { notes });
      }

      setActionDialog({ open: false, type: null, id: '', isBatch: false });
      setNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar ação');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Pendente': 'warning',
      'Aprovado': 'success',
      'Reprovado': 'error',
      'Aguardando Gerência': 'info',
    };
    return colors[status] || 'default';
  };

  // Agrupar por batch
  const batchedRequests = requests.reduce((acc, req) => {
    const key = req.subrede_batch_id || req._id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(req);
    return acc;
  }, {} as Record<string, PriceRequest[]>);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Painel do Supervisor
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {Object.entries(batchedRequests).map(([key, reqs]) => {
        const isBatch = reqs.length > 1 && reqs[0].subrede_batch_id;
        const firstReq = reqs[0];

        if (isBatch) {
          return (
            <Accordion key={key} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Chip label={`BATCH: ${firstReq.subrede_name}`} color="primary" />
                  <Typography>{reqs.length} solicitações</Typography>
                  <Chip label={firstReq.status} color={getStatusColor(firstReq.status)} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Produto</TableCell>
                        <TableCell>Preço</TableCell>
                        <TableCell>Qtd</TableCell>
                        <TableCell>Desconto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reqs.map((req) => (
                        <TableRow key={req._id}>
                          <TableCell>{req.customer_name}</TableCell>
                          <TableCell>{req.product_name}</TableCell>
                          <TableCell>R$ {formatarPreco(req.requested_price)}</TableCell>
                          <TableCell>{req.quantity}</TableCell>
                          <TableCell>{req.discount_percent}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {firstReq.status === 'Pendente' && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setActionDialog({ open: true, type: 'approve', id: key, isBatch: true })}
                    >
                      Aprovar Todos
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setActionDialog({ open: true, type: 'reject', id: key, isBatch: true })}
                    >
                      Rejeitar Todos
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => setActionDialog({ open: true, type: 'forward', id: key, isBatch: true })}
                    >
                      Encaminhar Todos
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        }

        return (
          <Card key={key} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{firstReq.customer_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {firstReq.product_name}
                  </Typography>
                </Box>
                <Chip label={firstReq.status} color={getStatusColor(firstReq.status)} />
              </Box>

              <Typography variant="body2">
                <strong>Vendedor:</strong> {firstReq.requester_name}
              </Typography>
              <Typography variant="body2">
                <strong>Preço Solicitado:</strong> R$ {formatarPreco(firstReq.requested_price)}
              </Typography>
              <Typography variant="body2">
                <strong>Preço com Desconto:</strong> R$ {formatarPreco(firstReq.discounted_price || '0')}
              </Typography>
              <Typography variant="body2">
                <strong>Mínimo:</strong> R$ {formatarPreco(firstReq.product_minimo)}
              </Typography>
              <Typography variant="body2">
                <strong>Justificativa:</strong> {firstReq.notes}
              </Typography>

              {firstReq.status === 'Pendente' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setActionDialog({ open: true, type: 'approve', id: firstReq._id, isBatch: false })}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setActionDialog({ open: true, type: 'reject', id: firstReq._id, isBatch: false })}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => setActionDialog({ open: true, type: 'forward', id: firstReq._id, isBatch: false })}
                  >
                    Encaminhar Gerência
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog de ações */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, id: '', isBatch: false })}>
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Aprovar' : actionDialog.type === 'reject' ? 'Rejeitar' : 'Encaminhar para Gerência'}
        </DialogTitle>
        <DialogContent>
          {(actionDialog.type === 'reject' || actionDialog.type === 'forward') && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Justificativa (obrigatória)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {actionDialog.type === 'approve' && (
            <Typography>Confirma a aprovação desta solicitação?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, id: '', isBatch: false })}>
            Cancelar
          </Button>
          <Button onClick={handleAction} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
