import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import { Close, RestartAlt } from '@mui/icons-material';

interface CalculadoraStandaloneProps {
  onClose: () => void;
}

export default function CalculadoraStandalone({ onClose }: CalculadoraStandaloneProps) {
  const [custo, setCusto] = useState<string>('');
  const [margem, setMargem] = useState<string>('');
  const [markup, setMarkup] = useState<string>('');
  const [renda, setRenda] = useState<string>('');
  const [lucro, setLucro] = useState<string>('');

  const calcular = (campo: string, valor: string) => {
    const v = parseFloat(valor) || 0;

    switch (campo) {
      case 'custo':
        setCusto(valor);
        if (markup) {
          const m = parseFloat(markup) || 0;
          const novaRenda = v * (1 + m / 100);
          const novoLucro = novaRenda - v;
          setRenda(novaRenda.toFixed(2));
          setLucro(novoLucro.toFixed(2));
          setMargem(novaRenda > 0 ? ((novoLucro / novaRenda) * 100).toFixed(2) : '');
        } else if (margem) {
          const mg = parseFloat(margem) || 0;
          const novoLucro = (v * mg) / (100 - mg);
          const novaRenda = v + novoLucro;
          setLucro(novoLucro.toFixed(2));
          setRenda(novaRenda.toFixed(2));
          setMarkup(v > 0 ? ((novoLucro / v) * 100).toFixed(2) : '');
        } else if (renda) {
          const r = parseFloat(renda) || 0;
          const novoLucro = r - v;
          setLucro(novoLucro.toFixed(2));
          setMargem(r > 0 ? ((novoLucro / r) * 100).toFixed(2) : '');
          setMarkup(v > 0 ? ((novoLucro / v) * 100).toFixed(2) : '');
        } else if (lucro) {
          const l = parseFloat(lucro) || 0;
          const novaRenda = v + l;
          setRenda(novaRenda.toFixed(2));
          setMargem(novaRenda > 0 ? ((l / novaRenda) * 100).toFixed(2) : '');
          setMarkup(v > 0 ? ((l / v) * 100).toFixed(2) : '');
        }
        break;

      case 'margem':
        setMargem(valor);
        if (custo) {
          const c = parseFloat(custo) || 0;
          const novoLucro = (c * v) / (100 - v);
          const novaRenda = c + novoLucro;
          setLucro(novoLucro.toFixed(2));
          setRenda(novaRenda.toFixed(2));
          setMarkup(c > 0 ? ((novoLucro / c) * 100).toFixed(2) : '');
        } else if (renda) {
          const r = parseFloat(renda) || 0;
          const novoLucro = (r * v) / 100;
          const novoCusto = r - novoLucro;
          setLucro(novoLucro.toFixed(2));
          setCusto(novoCusto.toFixed(2));
          setMarkup(novoCusto > 0 ? ((novoLucro / novoCusto) * 100).toFixed(2) : '');
        }
        break;

      case 'markup':
        setMarkup(valor);
        if (custo) {
          const c = parseFloat(custo) || 0;
          const novaRenda = c * (1 + v / 100);
          const novoLucro = novaRenda - c;
          setRenda(novaRenda.toFixed(2));
          setLucro(novoLucro.toFixed(2));
          setMargem(novaRenda > 0 ? ((novoLucro / novaRenda) * 100).toFixed(2) : '');
        } else if (lucro) {
          const l = parseFloat(lucro) || 0;
          const novoCusto = (l * 100) / v;
          const novaRenda = novoCusto + l;
          setCusto(novoCusto.toFixed(2));
          setRenda(novaRenda.toFixed(2));
          setMargem(novaRenda > 0 ? ((l / novaRenda) * 100).toFixed(2) : '');
        }
        break;

      case 'renda':
        setRenda(valor);
        if (custo) {
          const c = parseFloat(custo) || 0;
          const novoLucro = v - c;
          setLucro(novoLucro.toFixed(2));
          setMargem(v > 0 ? ((novoLucro / v) * 100).toFixed(2) : '');
          setMarkup(c > 0 ? ((novoLucro / c) * 100).toFixed(2) : '');
        } else if (margem) {
          const mg = parseFloat(margem) || 0;
          const novoLucro = (v * mg) / 100;
          const novoCusto = v - novoLucro;
          setLucro(novoLucro.toFixed(2));
          setCusto(novoCusto.toFixed(2));
          setMarkup(novoCusto > 0 ? ((novoLucro / novoCusto) * 100).toFixed(2) : '');
        }
        break;

      case 'lucro':
        setLucro(valor);
        if (custo) {
          const c = parseFloat(custo) || 0;
          const novaRenda = c + v;
          setRenda(novaRenda.toFixed(2));
          setMargem(novaRenda > 0 ? ((v / novaRenda) * 100).toFixed(2) : '');
          setMarkup(c > 0 ? ((v / c) * 100).toFixed(2) : '');
        } else if (renda) {
          const r = parseFloat(renda) || 0;
          const novoCusto = r - v;
          setCusto(novoCusto.toFixed(2));
          setMargem(r > 0 ? ((v / r) * 100).toFixed(2) : '');
          setMarkup(novoCusto > 0 ? ((v / novoCusto) * 100).toFixed(2) : '');
        }
        break;
    }
  };

  const limpar = () => {
    setCusto('');
    setMargem('');
    setMarkup('');
    setRenda('');
    setLucro('');
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Calculadora de Margem</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Preencha 2 campos e os demais serão calculados automaticamente
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Custo (Preço de Custo)"
            type="number"
            value={custo}
            onChange={(e) => calcular('custo', e.target.value)}
            InputProps={{ inputProps: { step: '0.01' } }}
          />
          <TextField
            fullWidth
            label="Margem %"
            type="number"
            value={margem}
            onChange={(e) => calcular('margem', e.target.value)}
            InputProps={{ inputProps: { step: '0.01' } }}
            helperText="(Lucro / Renda) × 100"
          />
          <TextField
            fullWidth
            label="Markup %"
            type="number"
            value={markup}
            onChange={(e) => calcular('markup', e.target.value)}
            InputProps={{ inputProps: { step: '0.01' } }}
            helperText="(Lucro / Custo) × 100"
          />
          <TextField
            fullWidth
            label="Renda (Preço de Venda)"
            type="number"
            value={renda}
            onChange={(e) => calcular('renda', e.target.value)}
            InputProps={{ inputProps: { step: '0.01' } }}
          />
          <TextField
            fullWidth
            label="Lucro"
            type="number"
            value={lucro}
            onChange={(e) => calcular('lucro', e.target.value)}
            InputProps={{ inputProps: { step: '0.01' } }}
            helperText="Renda - Custo"
          />
        </Stack>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={limpar}
            fullWidth
          >
            Limpar
          </Button>
          <Button variant="contained" onClick={onClose} fullWidth>
            Fechar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
