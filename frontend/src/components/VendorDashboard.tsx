import { useState } from 'react';
import { Box, Card, CardContent, Typography, CardActionArea, Dialog } from '@mui/material';
import { RequestQuote, Calculate } from '@mui/icons-material';
import { User } from '../types';
import RequestForm from './RequestForm';
import CalculadoraStandalone from './CalculadoraStandalone';

interface VendorDashboardProps {
  user: User;
}

export default function VendorDashboard({ user }: VendorDashboardProps) {
  const [openRequestForm, setOpenRequestForm] = useState(false);
  const [openCalculadora, setOpenCalculadora] = useState(false);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {user.name}!
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card>
          <CardActionArea onClick={() => setOpenRequestForm(true)}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <RequestQuote sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Solicitação de Preços
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Criar nova solicitação de preço especial
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card>
          <CardActionArea onClick={() => setOpenCalculadora(true)}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Calculate sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="div">
                Calculadora de Margem
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Calcular custo, margem, markup e lucro
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      <Dialog
        open={openRequestForm}
        onClose={() => setOpenRequestForm(false)}
        maxWidth="lg"
        fullWidth
      >
        <RequestForm user={user} onClose={() => setOpenRequestForm(false)} />
      </Dialog>

      <Dialog
        open={openCalculadora}
        onClose={() => setOpenCalculadora(false)}
        maxWidth="sm"
        fullWidth
      >
        <CalculadoraStandalone onClose={() => setOpenCalculadora(false)} />
      </Dialog>
    </Box>
  );
}
