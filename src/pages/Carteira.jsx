import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Carteira.css';
import BattleLog from '../components/Logview';
import { supabase } from '../services/supabaseClient';
import Toast, { useToast } from '../components/Toast';

const Carteira = () => {
  const [mostrarLog, setMostrarLog] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState('');
  const { toasts, showToast, removeToast } = useToast();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transacaoPendente, setTransacaoPendente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [historicoExpandido, setHistoricoExpandido] = useState({});

  // Dados do formulário - apenas para saque agora
  const [formDataSaque, setFormDataSaque] = useState({
    valor: '',
    banco: '',
    agencia: '',
    conta: '',
    nome_titular: ''
  });

  // Valor do depósito via Stripe
  const [valorDeposito, setValorDeposito] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserById(user.id);
          setUserData(data);
          await verificarTransacaoPendente();
          await carregarHistorico();
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const verificarTransacaoPendente = async () => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar transação pendente:', error);
        return;
      }

      if (data) {
        setTransacaoPendente(data);
      } else {
        setTransacaoPendente(null);
      }
    } catch (error) {
      console.error('Erro ao verificar transação pendente:', error);
    }
  };

  const carregarHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const abrirModal = (tipo) => {
    setTipoTransacao(tipo);
    setModalAberto(true);

    if (tipo === 'saque') {
      setFormDataSaque({
        valor: '',
        banco: '',
        agencia: '',
        conta: '',
        nome_titular: ''
      });
    } else {
      setValorDeposito('');
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoTransacao('');
  };

  // Função para criar sessão de checkout do Stripe
  const handleDepositoStripe = async (e) => {
    e.preventDefault();

    if (parseFloat(valorDeposito) < 5) {
      showToast('Valor mínimo é R$ 5,00', 'error');
      return;
    }

    try {
      // Chama sua edge function ou API route para criar a sessão
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: parseFloat(valorDeposito),
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) throw error;

      // Redireciona para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error);
      showToast(error.message || 'Erro ao processar depósito', 'error');
    }
  };

  const handleSaque = async (e) => {
    e.preventDefault();

    if (parseFloat(formDataSaque.valor) < 5) {
      showToast('Valor mínimo é R$ 5,00', 'error');
      return;
    }

    if (!formDataSaque.banco || !formDataSaque.agencia || !formDataSaque.conta || !formDataSaque.nome_titular) {
      showToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('solicitar_saque', {
        p_valor: parseFloat(formDataSaque.valor),
        p_banco: formDataSaque.banco,
        p_agencia: formDataSaque.agencia,
        p_conta: formDataSaque.conta,
        p_nome_titular: formDataSaque.nome_titular
      });

      if (error) throw error;
      showToast('Solicitação de saque enviada com sucesso!', 'success');

      fecharModal();
      await verificarTransacaoPendente();
      await carregarHistorico();
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      showToast(error.message || 'Erro ao processar saque', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataSaque(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleHistoricoItem = (id) => {
    setHistoricoExpandido(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="carteira-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  // Se há transação pendente, mostra tela bloqueada
  if (transacaoPendente) {
    return (
      <div className="carteira-container">
        <Header userData={userData} onLogout={handleLogout} />
        <main className="carteira-content">
          <div className="carteira-card">
            <h2>⏳ Transação em Processamento</h2>
            <div className="transacao-pendente">
              <p>Tipo: <strong>{transacaoPendente.tipo === 'deposito' ? 'Depósito' : 'Saque'}</strong></p>
              <p>Valor: <strong>R$ {parseFloat(transacaoPendente.valor).toFixed(2)}</strong></p>
              <p>Status: <strong>{transacaoPendente.status}</strong></p>
              <p className="aviso-processamento">
                Sua transação está sendo processada. A carteira ficará bloqueada até a conclusão.
                Isso pode levar algumas horas.
              </p>
            </div>
          </div>
          <div className="nav-menu">
            <Nav />
          </div>
        </main>
        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="carteira-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="carteira-content">
        <div className="carteira-card">
          <h2>💰 Carteira</h2>
          <span> Depósito obrigatório antes de realizar saque.</span>
          <span> Saque só pode ser feito na mesma conta de depósito.</span>
          <div className="saldo">
            Saldo: <span>R$ {(userData?.saldo ?? 0).toFixed(2)}</span>
          </div>

          <div className="botoes-transacao">
            <button
              className="depositar-btn"
              onClick={() => abrirModal('deposito')}
            >
              💵 Depositar
            </button>

            <button
              className="sacar-btn"
              onClick={() => abrirModal('saque')}
            >
              💸 Sacar
            </button>
          </div>

          {historico.length > 0 && (
            <div className="historico">
              <h3>Histórico Recente</h3>
              <div className="historico-lista">
                {historico.map(t => (
                  <div key={t.id} className={`historico-item ${t.status}`}>
                    <div
                      className="historico-item-header"
                      onClick={() => t.status === 'negado' && toggleHistoricoItem(t.id)}
                      style={{ cursor: t.status === 'negado' ? 'pointer' : 'default' }}
                    >
                      <span>{t.tipo === 'deposito' ? '💵' : '💸'} {t.tipo}</span>
                      <span>R$ {parseFloat(t.valor).toFixed(2)}</span>
                      <span className={`status-badge ${t.status}`}>{t.status}</span>
                    </div>
                    {t.status === 'negado' && historicoExpandido[t.id] && (
                      <div className="historico-motivo">
                        <strong>Motivo:</strong>
                        <p>{t.motivo_negacao || 'Sem motivo informado'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="nav-menu">
          <Nav />
        </div>
      </main>

      {/* Modal de Depósito - Stripe */}
      {modalAberto && tipoTransacao === 'deposito' && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💵 Depositar via Stripe</h2>
            <form onSubmit={handleDepositoStripe}>
              <div className="form-group">
                <label>Valor (mín. R$ 5,00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  value={valorDeposito}
                  onChange={(e) => setValorDeposito(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">
                  Ir para Pagamento
                </button>
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {modalAberto && tipoTransacao === 'saque' && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💸 Sacar</h2>
            <form onSubmit={handleSaque}>
              <div className="form-group">
                <label>Valor (mín. R$ 5,00)</label>
                <input
                  type="number"
                  name="valor"
                  step="0.01"
                  min="5"
                  value={formDataSaque.valor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Banco</label>
                <input
                  type="text"
                  name="banco"
                  value={formDataSaque.banco}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Agência</label>
                  <input
                    type="text"
                    name="agencia"
                    value={formDataSaque.agencia}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Conta ou Chave PIX</label>
                  <input
                    type="text"
                    name="conta"
                    value={formDataSaque.conta}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nome do Titular</label>
                <input
                  type="text"
                  name="nome_titular"
                  value={formDataSaque.nome_titular}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">
                  Confirmar
                </button>
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarLog && (
        <BattleLog
          userName={userData?.nome ?? 'Jogador'}
          oponenteName="Oponente"
          onClose={() => setMostrarLog(false)}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Carteira;