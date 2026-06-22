import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
} from '@mui/material';
import { User, PriceRequest } from '../types';
import { api } from '../config/api';
import { formatarPreco } from '../utils/dataHelpers';

interface GerentePanelProps {
  user: User;
}

export default function GerentePanel({ user }: GerentePanelProps) {
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'altered' | null;
    id: string;
  }>({ open: false, type: null, id: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.get('/api/requests/gerente');
      setRequests(data);
    } catch (err: any) {
      setError('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionDialog.type === 'reject' && notes.trim().length === 0) {
      setError('Justificativa é obrigatória');
      return;
    }

    try {
      const endpoint =
        actionDialog.type === 'approve'
          ? `/api/requests/${actionDialog.id}/gerente-approve`
          : actionDialog.type === 'reject'
          ? `/api/requests/${actionDialog.id}/gerente-reject`
          : `/api/requests/${actionDialog.id}/mark-altered`;

      if (actionDialog.type === 'approve' || actionDialog.type === 'altered') {
        await api.patch(endpoint);
      } else {
        await api.patch(endpoint, { notes });
      }

      setActionDialog({ open: false, type: null, id: '' });
      setNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar ação');
    }
  };

  const pendentes = requests.filter((r) => r.status === 'Aguardando Gerência');
  const historico = requests.filter((r) => r.status !== 'Aguardando Gerência');

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Aguardando Gerência': 'info',
      'Aprovado pela Gerência': 'success',
      'Reprovado pela Gerência': 'error',
      'Alterado': 'default',
    };
    return colors[status] || 'default';
  };

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
        Painel do Gerente
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label={`Pendentes (${pendentes.length})`} />
        <Tab label={`Histórico (${historico.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box>
          {pendentes.length === 0 ? (
            <Alert severity="info">Nenhuma solicitação pendente</Alert>
          ) : (
            pendentes.map((req) => (
              <Card key={req._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{req.customer_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {req.product_name}
                      </Typography>
                    </Box>
                    <Chip label={req.status} color={getStatusColor(req.status)} />
                  </Box>

                  <Typography variant="body2">
                    <strong>Vendedor:</strong> {req.requester_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Supervisor:</strong> {req.nome_supervisor}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Preço:</strong> R$ {formatarPreco(req.requested_price)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Justificativa:</strong> {req.notes}
                  </Typography>
                  {req.supervisor_notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Notas do Supervisor:</strong> {req.supervisor_notes}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setActionDialog({ open: true, type: 'approve', id: req._id })}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setActionDialog({ open: true, type: 'reject', id: req._id })}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setActionDialog({ open: true, type: 'altered', id: req._id })}
                    >
                      Marcar Alterado
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historico.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.requester_name}</TableCell>
                  <TableCell>{req.customer_name}</TableCell>
                  <TableCell>{req.product_name}</TableCell>
                  <TableCell>R$ {formatarPreco(req.requested_price)}</TableCell>
                  <TableCell>
                    <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, id: '' })}>
        <DialogTitle>
          {actionDialog.type === 'approve'
            ? 'Aprovar'
            : actionDialog.type === 'reject'
            ? 'Rejeitar'
            : 'Marcar como Alterado'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'reject' && (
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
          {actionDialog.type === 'altered' && (
            <Typography>Marcar esta solicitação como alterada?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, id: '' })}>Cancelar</Button>
          <Button onClick={handleAction} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
