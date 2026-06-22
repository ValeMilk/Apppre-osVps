import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { api } from '../config/api';
import { User } from '../types';

interface AuthFormProps {
  onLogin: (token: string, user: User) => void;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.get('/api/auth/users');
      setUsers(data);
    } catch (err: any) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEmail || !password) {
      setError('Por favor, selecione um usuário e digite a senha');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/auth/login', {
        email: selectedEmail,
        password,
      });

      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, width: '100%', m: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Login - App Preços
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Selecione o Usuário</InputLabel>
            <Select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              label="Selecione o Usuário"
              disabled={loadingUsers}
            >
              {loadingUsers ? (
                <MenuItem value="">
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user.email}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || loadingUsers}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
