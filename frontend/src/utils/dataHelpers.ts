import Papa from 'papaparse';
import { Produto, Cliente, Desconto } from '../types';
import { api } from '../config/api';

export const loadProdutos = (): Promise<Produto[]> => {
  // Tentar carregar do backend (SQL Server)
  return api
    .get('/api/data/produtos')
    .then((data) => {
      console.log('✅ Produtos carregados do SQL Server');
      return data.map((p: any) => ({
        e02_id: p.e02_id,
        e02_livre: p.e02_livre,
        e02_desc: p.e02_desc,
        tabela_70: p.tabela_70,
        minimo: p.minimo,
        promo: p.promo,
      }));
    })
    .catch((error) => {
      console.warn('⚠️  Erro ao carregar produtos do SQL Server, tentando CSV:', error);
      // Fallback: carregar do CSV
      return loadProdutosCSV();
    });
};

const loadProdutosCSV = (): Promise<Produto[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/produtos.csv', {
      download: true,
      header: true,
      complete: (results) => {
        resolve(results.data as Produto[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const loadClientes = (): Promise<Cliente[]> => {
  // Tentar carregar do backend (SQL Server)
  return api
    .get('/api/data/clientes')
    .then((data) => {
      console.log('✅ Clientes carregados do SQL Server');
      return data.map((c: any) => ({
        a00_id: c.a00_id,
        a00_fantasia: c.a00_fantasia,
        rede_id: c.rede_id,
        rede: c.rede,
        canal_de_venda: c.canal_de_venda || '',
        segmento: c.segmento || '',
        a00_id_vend: c.a00_id_vend,
        vendedor: c.vendedor || '',
        a00_id_vend_2: c.a00_id_vend_2,
        supervisor: c.supervisor || '',
      }));
    })
    .catch((error) => {
      console.warn('⚠️  Erro ao carregar clientes do SQL Server, tentando CSV:', error);
      // Fallback: carregar do CSV
      return loadClientesCSV();
    });
};

const loadClientesCSV = (): Promise<Cliente[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/clientes.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const clientes = results.data as Cliente[];
        // Filtrar redes 2,3,5,6,7,21,26 (exceto quando NULL)
        const filteredClientes = clientes.filter((cliente) => {
          const redeId = cliente.rede_id;
          if (!redeId || redeId === '' || redeId.toLowerCase() === 'null') {
            return true; // Incluir se rede_id é NULL
          }
          const excludedRedes = ['2', '3', '5', '6', '7', '21', '26'];
          return !excludedRedes.includes(redeId);
        });
        resolve(filteredClientes);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const loadDescontos = (): Promise<Desconto[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/descontos.csv', {
      download: true,
      header: true,
      complete: (results) => {
        resolve(results.data as Desconto[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Calcular desconto aplicável (produto específico tem prioridade sobre grupo)
export const calcularDesconto = (
  produto: Produto,
  cliente: Cliente,
  descontos: Desconto[]
): number => {
  // Buscar desconto por produto específico
  const descontoProduto = descontos.find(
    (d) =>
      d.tipo_desconto === 'produto' &&
      d.produto_id === produto.e02_id &&
      (d.rede_id === cliente.rede_id || d.a23_id === cliente.a00_id)
  );

  if (descontoProduto) {
    return parseFloat(descontoProduto.valor_desconto) || 0;
  }

  // Buscar desconto por grupo
  const descontoGrupo = descontos.find(
    (d) =>
      d.tipo_desconto === 'grupo' &&
      d.rede_id === cliente.rede_id
  );

  if (descontoGrupo) {
    return parseFloat(descontoGrupo.valor_desconto) || 0;
  }

  return 0;
};
export const formatarPreco = (preco: string | number): string => {
  const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Parse de preço (remove formatação)
export const parsePreco = (precoFormatado: string): number => {
  return parseFloat(precoFormatado.replace(/\./g, '').replace(',', '.')) || 0;
};
