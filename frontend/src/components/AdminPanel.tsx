import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { User, PriceRequest } from '../types';
import { api } from '../config/api';
import { formatarPreco } from '../utils/dataHelpers';
import { useEffect } from 'react';

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState<PriceRequest[]>([]);
  const [cancellationRequests, setCancellationRequests] = useState<PriceRequest[]>([]);

  // Formulário vendedor
  const [vendedorForm, setVendedorForm] = useState({
    name: '',
    email: '',
    password: '',
    vendedor_code: '',
  });

  // Formulário supervisor
  const [supervisorForm, setSupervisorForm] = useState({
    name: '',
    email: '',
    password: '',
    codigo_supervisor: '',
  });

  // Formulário gerente
  const [gerenteForm, setGerenteForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadRequests();
    loadCancellationRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.get('/api/requests/all');
      setRequests(data);
    } catch (err: any) {
      console.error('Erro ao carregar solicitações:', err);
    }
  };

  const loadCancellationRequests = async () => {
    try {
      const data = await api.get('/api/requests/cancellation-requests');
      setCancellationRequests(data);
    } catch (err: any) {
      console.error('Erro ao carregar cancelamentos:', err);
    }
  };

  const handleRegisterVendedor = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/admin-register', vendedorForm);
      setSuccess('Vendedor criado com sucesso!');
      setVendedorForm({ name: '', email: '', password: '', vendedor_code: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar vendedor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSupervisor = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/supervisor-register', supervisorForm);
      setSuccess('Supervisor criado com sucesso!');
      setSupervisorForm({ name: '', email: '', password: '', codigo_supervisor: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar supervisor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterGerente = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/gerente-register', gerenteForm);
      setSuccess('Gerente criado com sucesso!');
      setGerenteForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar gerente');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCancellation = async (id: string) => {
    try {
      await api.patch(`/api/requests/${id}/approve-cancel`);
      alert('Cancelamento aprovado!');
      loadCancellationRequests();
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar cancelamento');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Pendente': 'warning',
      'Aprovado': 'success',
      'Reprovado': 'error',
      'Aguardando Gerência': 'info',
      'Aprovado pela Gerência': 'success',
      'Reprovado pela Gerência': 'error',
      'Alterado': 'default',
      'Cancelado': 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Painel do Administrador
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Cadastrar Vendedor" />
        <Tab label="Cadastrar Supervisor" />
        <Tab label="Cadastrar Gerente" />
        <Tab label={`Solicitações (${requests.length})`} />
        <Tab label={`Lixeira (${cancellationRequests.length})`} />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cadastrar Vendedor
            </Typography>
            <TextField
              fullWidth
              label="Nome"
              value={vendedorForm.name}
              onChange={(e) => setVendedorForm({ ...vendedorForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={vendedorForm.email}
              onChange={(e) => setVendedorForm({ ...vendedorForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={vendedorForm.password}
              onChange={(e) => setVendedorForm({ ...vendedorForm, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Código do Vendedor (opcional)"
              value={vendedorForm.vendedor_code}
              onChange={(e) => setVendedorForm({ ...vendedorForm, vendedor_code: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleRegisterVendedor} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Vendedor'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cadastrar Supervisor
            </Typography>
            <TextField
              fullWidth
              label="Nome"
              value={supervisorForm.name}
              onChange={(e) => setSupervisorForm({ ...supervisorForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={supervisorForm.email}
              onChange={(e) => setSupervisorForm({ ...supervisorForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={supervisorForm.password}
              onChange={(e) => setSupervisorForm({ ...supervisorForm, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Código do Supervisor (obrigatório)"
              value={supervisorForm.codigo_supervisor}
              onChange={(e) => setSupervisorForm({ ...supervisorForm, codigo_supervisor: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleRegisterSupervisor} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Supervisor'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cadastrar Gerente
            </Typography>
            <TextField
              fullWidth
              label="Nome"
              value={gerenteForm.name}
              onChange={(e) => setGerenteForm({ ...gerenteForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={gerenteForm.email}
              onChange={(e) => setGerenteForm({ ...gerenteForm, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={gerenteForm.password}
              onChange={(e) => setGerenteForm({ ...gerenteForm, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleRegisterGerente} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Gerente'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
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
              {requests.map((req) => (
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

      {tab === 4 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cancellationRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{new Date(req.cancellation_requested_at || '').toLocaleDateString()}</TableCell>
                  <TableCell>{req.requester_name}</TableCell>
                  <TableCell>{req.customer_name}</TableCell>
                  <TableCell>{req.product_name}</TableCell>
                  <TableCell>{req.cancellation_reason}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleApproveCancellation(req._id)}
                    >
                      Aprovar Cancelamento
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
