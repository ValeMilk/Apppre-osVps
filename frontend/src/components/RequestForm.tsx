import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { User, Produto, Cliente, Desconto, PriceRequest, Subrede } from '../types';
import { loadProdutos, loadClientes, loadDescontos, calcularDesconto, formatarPreco } from '../utils/dataHelpers';
import { api } from '../config/api';

interface RequestFormProps {
  user: User;
  onClose: () => void;
}

export default function RequestForm({ user, onClose }: RequestFormProps) {
  const [modo, setModo] = useState<'cliente' | 'subrede'>('cliente');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [subredes, setSubredes] = useState<Subrede[]>([]);

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedSubrede, setSelectedSubrede] = useState<Subrede | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [precoSolicitado, setPrecoSolicitado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [justificativa, setJustificativa] = useState('');

  const [desconto, setDesconto] = useState(0);
  const [precoFinal, setPrecoFinal] = useState(0);
  const [alertaPreco, setAlertaPreco] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [historico, setHistorico] = useState<PriceRequest[]>([]);

  useEffect(() => {
    loadData();
    loadHistorico();
  }, []);

  useEffect(() => {
    if (selectedProduto && selectedCliente && precoSolicitado) {
      calcularPrecoFinal();
    }
  }, [selectedProduto, selectedCliente, precoSolicitado, descontos]);

  const loadData = async () => {
    try {
      const [produtosData, clientesData, descontosData] = await Promise.all([
        loadProdutos(),
        loadClientes(),
        loadDescontos(),
      ]);

      setProdutos(produtosData);
      setDescontos(descontosData);

      // Filtrar clientes por vendedor_code
      const clientesFiltrados = clientesData.filter(
        (c) => c.a00_id_vend === user.vendedor_code
      );
      setClientes(clientesFiltrados);

      // Agrupar por subrede
      const subredesMap = new Map<string, Cliente[]>();
      clientesFiltrados.forEach((c) => {
        if (c.rede_id && c.rede) {
          const key = `${c.rede_id}_${c.rede}`;
          if (!subredesMap.has(key)) {
            subredesMap.set(key, []);
          }
          subredesMap.get(key)!.push(c);
        }
      });

      const subredesArray: Subrede[] = Array.from(subredesMap.entries()).map(([key, clientes]) => ({
        rede_id: clientes[0].rede_id,
        rede_desc: clientes[0].rede,
        clientes,
      }));

      setSubredes(subredesArray);
    } catch (err: any) {
      setError('Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const data = await api.get('/api/analytics/requests');
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const filtered = data.filter((req: PriceRequest) => 
        new Date(req.created_at) >= fourteenDaysAgo
      );
      
      setHistorico(filtered);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const calcularPrecoFinal = () => {
    if (!selectedProduto || !selectedCliente || !precoSolicitado) return;

    const desc = calcularDesconto(selectedProduto, selectedCliente, descontos);
    setDesconto(desc);

    const preco = parseFloat(precoSolicitado) || 0;
    const final = preco * (1 - desc / 100);
    setPrecoFinal(final);

    const minimo = parseFloat(selectedProduto.minimo) || 0;
    const promo = parseFloat(selectedProduto.promo) || 0;

    if (final < minimo) {
      setAlertaPreco('error');
    } else if (final < promo) {
      setAlertaPreco('warning');
    } else {
      setAlertaPreco('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!selectedProduto || (!selectedCliente && !selectedSubrede)) {
      setError('Por favor, selecione um produto e um cliente/subrede');
      return;
    }

    if (!precoSolicitado || !quantidade) {
      setError('Por favor, preencha o preço e a quantidade');
      return;
    }

    if (justificativa.length < 10) {
      setError('A justificativa deve ter pelo menos 10 caracteres');
      return;
    }

    // Se preço abaixo do promocional, exigir confirmação
    if (alertaPreco === 'warning' && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setLoading(true);

    try {
      if (modo === 'cliente' && selectedCliente) {
        // Criar solicitação individual
        await criarSolicitacao(selectedCliente);
        setSuccess('Solicitação criada com sucesso!');
      } else if (modo === 'subrede' && selectedSubrede) {
        // Criar solicitações em batch
        const batchId = `BATCH_${Date.now()}`;
        
        for (const cliente of selectedSubrede.clientes) {
          await criarSolicitacao(cliente, batchId, selectedSubrede.rede_desc);
        }
        
        setSuccess(`${selectedSubrede.clientes.length} solicitações criadas com sucesso!`);
      }

      limparFormulario();
      loadHistorico();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar solicitação');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const criarSolicitacao = async (cliente: Cliente, batchId?: string, subredeName?: string) => {
    const requestData = {
      customer_code: cliente.a00_id,
      customer_name: cliente.a00_fantasia,
      product_id: selectedProduto!.e02_id,
      product_name: selectedProduto!.e02_desc,
      requested_price: precoSolicitado,
      quantity: quantidade,
      product_maximo: selectedProduto!.tabela_70,
      product_minimo: selectedProduto!.minimo,
      product_promocional: selectedProduto!.promo,
      notes: justificativa,
      codigo_supervisor: cliente.a00_id_vend_2,
      nome_supervisor: cliente.supervisor,
      subrede_batch_id: batchId,
      subrede_name: subredeName,
      discount_percent: desconto.toString(),
      discounted_price: precoFinal.toFixed(2),
    };

    await api.post('/api/requests', requestData);
  };

  const limparFormulario = () => {
    setSelectedCliente(null);
    setSelectedSubrede(null);
    setSelectedProduto(null);
    setPrecoSolicitado('');
    setQuantidade('');
    setJustificativa('');
    setDesconto(0);
    setPrecoFinal(0);
    setAlertaPreco('');
  };

  const handleCancelRequest = async (requestId: string) => {
    const reason = prompt('Motivo do cancelamento:');
    if (!reason || reason.length < 10) {
      alert('Motivo deve ter pelo menos 10 caracteres');
      return;
    }

    try {
      await api.patch(`/api/requests/${requestId}/cancel`, { reason });
      alert('Solicitação de cancelamento enviada!');
      loadHistorico();
    } catch (err: any) {
      alert(err.message || 'Erro ao solicitar cancelamento');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Pendente': 'warning',
      'Aprovado': 'success',
      'Aprovado pela Gerência': 'success',
      'Reprovado': 'error',
      'Reprovado pela Gerência': 'error',
      'Aguardando Gerência': 'info',
      'Alterado': 'default',
      'Cancelado': 'default',
    };
    return colors[status] || 'default';
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Nova Solicitação de Preço</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={modo}
            exclusive
            onChange={(_, newModo) => newModo && setModo(newModo)}
            fullWidth
          >
            <ToggleButton value="cliente">Cliente Individual</ToggleButton>
            <ToggleButton value="subrede">Subrede (Batch)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {modo === 'cliente' ? (
          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => `${option.a00_id} - ${option.a00_fantasia}`}
            value={selectedCliente}
            onChange={(_, value) => setSelectedCliente(value)}
            renderInput={(params) => <TextField {...params} label="Selecione o Cliente" />}
            sx={{ mb: 2 }}
          />
        ) : (
          <Autocomplete
            options={subredes}
            getOptionLabel={(option) => `${option.rede_desc} (${option.clientes.length} clientes)`}
            value={selectedSubrede}
            onChange={(_, value) => setSelectedSubrede(value)}
            renderInput={(params) => <TextField {...params} label="Selecione a Subrede" />}
            sx={{ mb: 2 }}
          />
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Produto</InputLabel>
          <Select
            value={selectedProduto?.e02_id || ''}
            onChange={(e) => {
              const prod = produtos.find((p) => p.e02_id === e.target.value);
              setSelectedProduto(prod || null);
            }}
            label="Produto"
          >
            {produtos.map((prod) => (
              <MenuItem key={prod.e02_id} value={prod.e02_id}>
                {prod.e02_id} - {prod.e02_desc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProduto && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Máximo:</strong> R$ {formatarPreco(selectedProduto.tabela_70)} |
              <strong> Mínimo:</strong> R$ {formatarPreco(selectedProduto.minimo)} |
              <strong> Promocional:</strong> R$ {formatarPreco(selectedProduto.promo)}
            </Typography>
          </Alert>
        )}

        {selectedCliente && selectedProduto && desconto > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Desconto aplicável: {desconto.toFixed(2)}%
          </Alert>
        )}

        <TextField
          fullWidth
          label="Preço Solicitado"
          type="number"
          value={precoSolicitado}
          onChange={(e) => setPrecoSolicitado(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ inputProps: { step: '0.01' } }}
        />

        {precoFinal > 0 && (
          <Alert severity={alertaPreco === 'error' ? 'error' : alertaPreco === 'warning' ? 'warning' : 'info'} sx={{ mb: 2 }}>
            <strong>Preço Final (com desconto):</strong> R$ {formatarPreco(precoFinal)}
            {alertaPreco === 'error' && ' - ABAIXO DO MÍNIMO!'}
            {alertaPreco === 'warning' && ' - Abaixo do promocional, requer confirmação'}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Quantidade"
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Justificativa (mín. 10 caracteres)"
          multiline
          rows={3}
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={loading || alertaPreco === 'error'}
        >
          {loading ? <CircularProgress size={24} /> : 'Criar Solicitação'}
        </Button>

        {/* Histórico */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Minhas Solicitações (Últimos 14 dias)
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historico.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{req.customer_name}</TableCell>
                  <TableCell>{req.product_name}</TableCell>
                  <TableCell>R$ {formatarPreco(req.requested_price)}</TableCell>
                  <TableCell>
                    <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {!req.cancellation_requested && req.status !== 'Cancelado' && (
                      <Button size="small" onClick={() => handleCancelRequest(req._id)}>
                        Cancelar
                      </Button>
                    )}
                    {req.cancellation_requested && (
                      <Chip label="Cancelamento solicitado" size="small" color="warning" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog de confirmação */}
        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <DialogTitle>Confirmar Preço Abaixo do Promocional</DialogTitle>
          <DialogContent>
            <Typography>
              O preço final está abaixo do preço promocional. Tem certeza que deseja continuar?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">Confirmar</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
