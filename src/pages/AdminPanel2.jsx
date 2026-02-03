import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import Toast, { useToast } from '../components/Toast';
import './AdminPanel2.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [filtro, setFiltro] = useState('pendente');
  const [motivoNegacao, setMotivoNegacao] = useState({});
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (user) {
      verificarAdmin();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      carregarTransacoes();
    }
  }, [isAdmin, filtro]);

  const verificarAdmin = async () => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) throw error;
      
      if (!data) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      navigate('/');
    }
  };

  const carregarTransacoes = async () => {
    try {
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          users:user_id (
            id,
            nome,
            email,
            saldo
          )
        `)
        .order('created_at', { ascending: false });

      if (filtro !== 'todas') {
        query = query.eq('status', filtro);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      showToast('Erro ao carregar transações', 'error');
    }
  };

  const processarTransacao = async (transacaoId, aprovar) => {
    if (!aprovar && !motivoNegacao[transacaoId]) {
      showToast('Informe o motivo da negação', 'warning');
      return;
    }

    if (!confirm(`Tem certeza que deseja ${aprovar ? 'aprovar' : 'negar'} esta transação?`)) {
      return;
    }

    try {
      const { error } = await supabase.rpc('processar_transacao', {
        p_transacao_id: transacaoId,
        p_aprovar: aprovar,
        p_motivo_negacao: aprovar ? null : motivoNegacao[transacaoId]
      });

      if (error) throw error;

      showToast(`Transação ${aprovar ? 'aprovada' : 'negada'} com sucesso!`, 'success');
      await carregarTransacoes();
      
      setMotivoNegacao(prev => {
        const novo = { ...prev };
        delete novo[transacaoId];
        return novo;
      });
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      showToast(error.message || 'Erro ao processar transação', 'error');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="admin-loading">
        <div>Verificando permissões...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Painel Administrativo</h1>
        <button onClick={() => navigate('/')} className="btn-voltar">
          Voltar ao Site
        </button>
      </div>

      <div className="admin-filtros">
        <button
          className={filtro === 'pendente' ? 'active' : ''}
          onClick={() => setFiltro('pendente')}
        >
          Pendentes
        </button>
        <button
          className={filtro === 'aprovado' ? 'active' : ''}
          onClick={() => setFiltro('aprovado')}
        >
          Aprovados
        </button>
        <button
          className={filtro === 'negado' ? 'active' : ''}
          onClick={() => setFiltro('negado')}
        >
          Negados
        </button>
        <button
          className={filtro === 'todas' ? 'active' : ''}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
      </div>

      <div className="transacoes-lista">
        {transacoes.length === 0 ? (
          <div className="nenhuma-transacao">
            Nenhuma transação encontrada
          </div>
        ) : (
          transacoes.map(transacao => (
            <div key={transacao.id} className={`transacao-card ${transacao.tipo}`}>
              <div className="transacao-header">
                <div className="transacao-tipo">
                  {transacao.tipo === 'deposito' ? '💵 DEPÓSITO' : '💸 SAQUE'}
                </div>
                <div className={`transacao-status ${transacao.status}`}>
                  {transacao.status.toUpperCase()}
                </div>
              </div>

              <div className="transacao-info">
                <div className="info-row">
                  <span className="label">Usuário:</span>
                  <span className="value">
                    {transacao.users?.nome} ({transacao.users?.email})
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Saldo Atual:</span>
                  <span className="value">R$ {parseFloat(transacao.users?.saldo || 0).toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Valor:</span>
                  <span className="value valor-destaque">
                    R$ {parseFloat(transacao.valor).toFixed(2)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Data:</span>
                  <span className="value">
                    {new Date(transacao.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="transacao-dados-bancarios">
                <div className="info-row">
                  <span className="label">Banco:</span>
                  <span className="value">{transacao.banco}</span>
                </div>
                <div className="info-row">
                  <span className="label">Agência:</span>
                  <span className="value">{transacao.agencia}</span>
                </div>
                <div className="info-row">
                  <span className="label">Conta/Pix:</span>
                  <span className="value">{transacao.conta}</span>
                </div>
                <div className="info-row">
                  <span className="label">Titular:</span>
                  <span className="value">{transacao.nome_titular}</span>
                </div>
              </div>

              {transacao.motivo_negacao && (
                <div className="motivo-negacao">
                  <strong>Motivo da Negação:</strong>
                  <p>{transacao.motivo_negacao}</p>
                </div>
              )}

              {transacao.status === 'pendente' && (
                <div className="transacao-acoes">
                  <textarea
                    placeholder="Motivo da negação (obrigatório se negar)"
                    value={motivoNegacao[transacao.id] || ''}
                    onChange={(e) => setMotivoNegacao(prev => ({
                      ...prev,
                      [transacao.id]: e.target.value
                    }))}
                    className="textarea-motivo"
                  />
                  <div className="botoes-acao">
                    <button
                      className="btn-aprovar"
                      onClick={() => processarTransacao(transacao.id, true)}
                    >
                      ✅ Aprovar
                    </button>
                    <button
                      className="btn-negar"
                      onClick={() => processarTransacao(transacao.id, false)}
                    >
                      ❌ Negar
                    </button>
                  </div>
                </div>
              )}

              {transacao.processado_em && (
                <div className="transacao-processamento">
                  <small>
                    Processado em: {new Date(transacao.processado_em).toLocaleString('pt-BR')}
                  </small>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminPanel;