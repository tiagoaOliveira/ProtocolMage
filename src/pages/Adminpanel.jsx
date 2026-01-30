import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [filtro, setFiltro] = useState('pendente');
  const [motivoNegacao, setMotivoNegacao] = useState({});

  useEffect(() => {
    verificarAdmin();
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
        // Não é admin, redireciona
        navigate('/home');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      navigate('/home');
    } finally {
      setLoading(false);
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
    }
  };

  const processarTransacao = async (transacaoId, aprovar) => {
    if (!aprovar && !motivoNegacao[transacaoId]) {
      alert('Por favor, informe o motivo da negação');
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

      alert(`Transação ${aprovar ? 'aprovada' : 'negada'} com sucesso!`);
      await carregarTransacoes();
      
      // Limpa o motivo
      setMotivoNegacao(prev => {
        const novo = { ...prev };
        delete novo[transacaoId];
        return novo;
      });
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      alert(error.message || 'Erro ao processar transação');
    }
  };

  if (loading) {
    return <div className="admin-loading">Verificando permissões...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Painel Administrativo</h1>
        <button onClick={() => navigate('/home')} className="btn-voltar">
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
          className={filtro === 'processando' ? 'active' : ''}
          onClick={() => setFiltro('processando')}
        >
          Processando
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

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Pendentes</h3>
          <p>{transacoes.filter(t => t.status === 'pendente').length}</p>
        </div>
        <div className="stat-card">
          <h3>Processando</h3>
          <p>{transacoes.filter(t => t.status === 'processando').length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Hoje</h3>
          <p>{transacoes.filter(t => {
            const hoje = new Date().toDateString();
            const transData = new Date(t.created_at).toDateString();
            return hoje === transData;
          }).length}</p>
        </div>
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
                <h4>Dados Bancários</h4>
                <div className="info-row">
                  <span className="label">Banco:</span>
                  <span className="value">{transacao.banco}</span>
                </div>
                <div className="info-row">
                  <span className="label">Agência:</span>
                  <span className="value">{transacao.agencia}</span>
                </div>
                <div className="info-row">
                  <span className="label">Conta:</span>
                  <span className="value">{transacao.conta} ({transacao.tipo_conta})</span>
                </div>
                <div className="info-row">
                  <span className="label">CPF:</span>
                  <span className="value">{transacao.cpf}</span>
                </div>
                <div className="info-row">
                  <span className="label">Titular:</span>
                  <span className="value">{transacao.nome_titular}</span>
                </div>
                {transacao.comprovante_url && (
                  <div className="info-row">
                    <span className="label">Comprovante:</span>
                    <a href={transacao.comprovante_url} target="_blank" rel="noopener noreferrer" className="link-comprovante">
                      Ver Comprovante
                    </a>
                  </div>
                )}
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
                    placeholder="Motivo da negação (opcional se aprovar)"
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
    </div>
  );
};

export default AdminPanel;