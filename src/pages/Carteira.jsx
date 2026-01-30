import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Carteira.css';
import BattleLog from '../components/Logview';
import { supabase } from '../services/supabaseClient';

const Carteira = () => {
  const [mostrarLog, setMostrarLog] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState(''); // 'deposito' ou 'saque'
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transacaoPendente, setTransacaoPendente] = useState(null);
  const [historico, setHistorico] = useState([]);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    valor: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    cpf: '',
    nome_titular: '',
    comprovante_url: ''
  });

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
        .in('status', ['pendente', 'processando'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setTransacaoPendente(data);
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
    setFormData({
      valor: '',
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'corrente',
      cpf: '',
      nome_titular: '',
      comprovante_url: ''
    });
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoTransacao('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (parseFloat(formData.valor) < 5) {
      alert('Valor mínimo é R$ 5,00');
      return;
    }

    try {
      if (tipoTransacao === 'deposito') {
        const { data, error } = await supabase.rpc('solicitar_deposito', {
          p_valor: parseFloat(formData.valor),
          p_banco: formData.banco,
          p_agencia: formData.agencia,
          p_conta: formData.conta,
          p_tipo_conta: formData.tipo_conta,
          p_cpf: formData.cpf,
          p_nome_titular: formData.nome_titular,
          p_comprovante_url: formData.comprovante_url
        });

        if (error) throw error;
        alert('Solicitação de depósito enviada com sucesso!');
      } else {
        const { data, error } = await supabase.rpc('solicitar_saque', {
          p_valor: parseFloat(formData.valor),
          p_banco: formData.banco,
          p_agencia: formData.agencia,
          p_conta: formData.conta,
          p_tipo_conta: formData.tipo_conta,
          p_cpf: formData.cpf,
          p_nome_titular: formData.nome_titular
        });

        if (error) throw error;
        alert('Solicitação de saque enviada com sucesso!');
      }

      fecharModal();
      await verificarTransacaoPendente();
      await carregarHistorico();
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      alert(error.message || 'Erro ao processar transação');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      </div>
    );
  }

  return (
    <div className="carteira-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="carteira-content">
        <div className="carteira-card">
          <h2>💰 Carteira</h2>
          <span className='carteira-warning'>Pode levar algumas horas de processamento.</span>
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
                    <span>{t.tipo === 'deposito' ? '💵' : '💸'} {t.tipo}</span>
                    <span>R$ {parseFloat(t.valor).toFixed(2)}</span>
                    <span className={`status-badge ${t.status}`}>{t.status}</span>
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

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{tipoTransacao === 'deposito' ? '💵 Depositar' : '💸 Sacar'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Valor (mín. R$ 5,00)</label>
                <input
                  type="number"
                  name="valor"
                  step="0.01"
                  min="5"
                  value={formData.valor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Banco</label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
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
                    value={formData.agencia}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Conta</label>
                  <input
                    type="text"
                    name="conta"
                    value={formData.conta}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Conta</label>
                <select
                  name="tipo_conta"
                  value={formData.tipo_conta}
                  onChange={handleInputChange}
                  required
                >
                  <option value="corrente">Corrente</option>
                  <option value="poupanca">Poupança</option>
                </select>
              </div>

              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nome completo que consta no banco</label>
                <input
                  type="text"
                  name="nome_titular"
                  value={formData.nome_titular}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {tipoTransacao === 'deposito' && (
                <div className="form-group">
                  <label>URL do Comprovante (opcional)</label>
                  <input
                    type="url"
                    name="comprovante_url"
                    value={formData.comprovante_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              )}

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
    </div>
  );
};

export default Carteira;