import { useState, useEffect } from "react";
import "./Character.css";
import { X, Sword, Heart, Save, Upload, Edit2, Trash2, Plus } from "lucide-react";
import { getUserSkills, getUserBuilds, saveCurrentBuild, loadBuild, updateBuild, deleteBuild, equipBuildBatch } from "../services/service";
import Toast, { useToast } from './Toast';
import ConfirmModal, { useConfirm } from './ConfirmModal';

export default function CharacterModal({
  isOpen,
  onClose,
  children,
  equippedSkills = [],
  onSkillClick,
  onUpdate,
  userData,

}) {
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userBuilds, setUserBuilds] = useState([]);
  const [buildName, setBuildName] = useState("");
  const [editingBuild, setEditingBuild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempBuild, setTempBuild] = useState([]);
  const { toasts, showToast, removeToast } = useToast();
  const { confirmState, showConfirm } = useConfirm();

  useEffect(() => {
    if (showBuildModal) {
      // Inicializa com as skills atualmente equipadas
      const initialBuild = Array(6).fill(null);
      equippedSkills.forEach((skill) => {
        if (skill.slot && skill.slot >= 1 && skill.slot <= 6) {
          initialBuild[skill.slot - 1] = skill;
        }
      });
      setTempBuild(initialBuild);
    }
  }, [showBuildModal, equippedSkills]);

  useEffect(() => {
    if (showBuildModal && userData?.id) {
      loadSkillsAndBuilds();
    }
  }, [showBuildModal, userData?.id]);

  const loadSkillsAndBuilds = async () => {
    setLoading(true);
    try {
      const [skills, builds] = await Promise.all([
        getUserSkills(userData.id),
        getUserBuilds(userData.id)
      ]);
      setAvailableSkills(skills || []);
      setUserBuilds(builds || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
      showToast("Digite um nome para a build");
      return;
    }

    if (userBuilds.length >= 3 && !editingBuild) {
      showToast("Você já tem 3 builds salvas. Delete uma para criar nova.");
      return;
    }

    try {
      setLoading(true);
      if (editingBuild) {
        await updateBuild(userData.id, editingBuild.id, buildName);
        showToast("Build atualizada!");
      } else {
        await saveCurrentBuild(userData.id, buildName);
        showToast("Build salva com sucesso!");
      }
      setBuildName("");
      setEditingBuild(null);
      await loadSkillsAndBuilds();
    } catch (error) {
      console.error("Erro ao salvar build:", error);
      showToast(error.message || "Erro ao salvar build");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBuildToTemp = async (build) => {
    const buildSlots = [
      build.slot_1,
      build.slot_2,
      build.slot_3,
      build.slot_4,
      build.slot_5,
      build.slot_6
    ];

    // Buscar as skills completas
    const skillsWithDetails = await Promise.all(
      buildSlots.map(async (skillId) => {
        if (!skillId) return null;
        const userSkills = availableSkills.find(us => us.skill_id === skillId);
        return userSkills || null;
      })
    );

    setTempBuild(skillsWithDetails);
    showToast(`Build "${build.nome}" carregada na área temporária`, "info");
  };

  const handleDeleteBuild = async (buildId) => {
    const confirmed = await showConfirm({
      title: 'Deletar Build?',
      message: 'Essa ação não pode ser desfeita',
      confirmText: 'Deletar',
      cancelText: 'Voltar',
      type: 'warning'
    });
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteBuild(userData.id, buildId);
      showToast("Build deletada!", "success");
      await loadSkillsAndBuilds();
    } catch (error) {
      console.error("Erro ao deletar build:", error);
      showToast("Erro ao deletar build", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEditBuild = (build) => {
    setEditingBuild(build);
    setBuildName(build.nome);
  };

  const addSkillToTempBuild = (skill) => {
    const emptyIndex = tempBuild.findIndex(slot => slot === null);
    if (emptyIndex === -1) {
      return;
    }

    const newTempBuild = [...tempBuild];
    newTempBuild[emptyIndex] = skill;
    setTempBuild(newTempBuild);
  };

  const removeSkillFromTempBuild = (index) => {
    const newTempBuild = [...tempBuild];
    newTempBuild[index] = null;
    setTempBuild(newTempBuild);
  };

  const handleEquipTempBuild = async () => {
    const confirmed = await showConfirm({
      title: 'Equipar Build?',
      message: 'Seus slots atuais serão substituídos.',
      confirmText: 'Equipar',
      cancelText: 'Voltar',
      type: 'warning'
    });
    if (!confirmed) return;

    try {
      setLoading(true);

      // Preparar array de skills para equipar
      // Formato: [{skill_id: number, slot: number}, ...]
      const skillSlots = tempBuild
        .map((skill, index) => {
          if (skill !== null && index < maxUnlockedSlots) {
            return {
              skill_id: skill.skill_id,
              slot: index + 1
            };
          }
          return null;
        })
        .filter(item => item !== null);

      // Chama a função otimizada que faz tudo em uma única transação
      await equipBuildBatch(userData.id, skillSlots);

      showToast("Build equipada com sucesso!");
      setTempBuild(Array(6).fill(null));
      await loadSkillsAndBuilds();
      if (onUpdate) await onUpdate();
      setShowBuildModal(false);
    } catch (error) {
      console.error("Erro ao equipar build:", error);
      showToast(error.message || "Erro ao equipar build");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const nivel = userData?.nivel ?? 1;
  const maxUnlockedSlots = Math.min(Math.floor(nivel / 10), 6);

  // ✅ CORREÇÃO: Preencher skillSlots usando o valor de skill.slot
  const skillSlots = Array(6).fill(null);
  equippedSkills.forEach((skill) => {
    if (skill.slot && skill.slot >= 1 && skill.slot <= 6) {
      skillSlots[skill.slot - 1] = skill;
    }
  });

  const totalSlots = [0, 1, 2, 3, 4, 5];

  const vidaBase = 100;
  const ataqueBase = 50;
  const vida = Math.floor(vidaBase * (1 + nivel * 0.2));
  const ataque = Math.floor(ataqueBase * (1 + nivel * 0.2));

  return (
    <>
      <div className="character-modal" onClick={onClose}>
        <div className="character-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="character-modal-close" onClick={onClose}>
            <X color="yellow" size={32} />
          </button>

          <div className="modal-infos">
            <div className="modal-habilities">
              {totalSlots.map((index) => {
                const isLocked = index >= maxUnlockedSlots;
                const unlockLevel = (index + 1) * 10;
                const skill = skillSlots[index];

                return (
                  <button
                    key={index}
                    className={`skill-slot ${skill ? 'equipped' : 'empty'} ${isLocked ? 'locked' : ''}`}
                    onClick={!isLocked ? () => setShowBuildModal(true) : undefined}
                    disabled={isLocked}
                    title={isLocked ? `Bloqueado: Nível ${unlockLevel}` : (skill ? skill.skill.name : 'Clique para gerenciar')}
                  >
                    {isLocked ? (
                      <div className="lock-container">
                        <span className="lock-icon">🔒</span>
                        <span className="unlock-level">{unlockLevel}</span>
                      </div>
                    ) : skill ? (
                      skill.skill.image ? (
                        <img src={skill.skill.image} alt={skill.skill.name} className="skill-image" />
                      ) : (
                        <span className="skill-initial">{skill.skill.name.charAt(0)}</span>
                      )
                    ) : (
                      <span className="skill-empty-icon">+</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="modal-stats">
              <p><Heart size={28} color="#ff4444" fill="red" />Vida: {vida}</p>
              <p><Sword size={28} color="#ff8844" fill="#f35900ff" />Ataque: {ataque}</p>
            </div>
          </div>

          {children}
        </div>
      </div>

      {showBuildModal && (
        <div className="build-modal-overlay" onClick={() => setShowBuildModal(false)}>
          <div className="build-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="build-modal-close" onClick={() => setShowBuildModal(false)}>
              <X size={20} />
            </button>

            <h2 className="build-modal-title">Gerenciar Builds</h2>

            {loading ? (
              <div className="build-loading">Carregando...</div>
            ) : (
              <>
                {/* Build Atual */}
                <div className="build-section">
                  <h3>⚡ Build Atual</h3>
                  <div className="current-build-slots">
                    {totalSlots.map((index) => {
                      const isLocked = index >= maxUnlockedSlots;
                      const unlockLevel = (index + 1) * 10;
                      const skill = skillSlots[index];

                      return (
                        <div
                          key={index}
                          className={`current-build-slot ${skill ? 'equipped' : 'empty'} ${isLocked ? 'locked' : ''}`}
                          title={isLocked ? `Bloqueado: Nível ${unlockLevel}` : (skill ? skill.skill.name : 'Vazio')}
                        >
                          {isLocked ? (
                            <div className="lock-container">
                              <span className="lock-icon">🔒</span>
                              <span className="unlock-level">{unlockLevel}</span>
                            </div>
                          ) : skill ? (
                            skill.skill.image ? (
                              <img src={skill.skill.image} alt={skill.skill.name} className="skill-image" />
                            ) : (
                              <span className="skill-initial">{skill.skill.name.charAt(0)}</span>
                            )
                          ) : (
                            <span className="skill-empty-icon">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Salvar Build Atual */}
                  <div className="build-save-form">
                    <input
                      type="text"
                      placeholder="Nome..."
                      value={buildName}
                      onChange={(e) => setBuildName(e.target.value)}
                      maxLength={30}
                      className="build-name-input"
                    />
                    <button onClick={handleSaveBuild} className="btn-save-build">
                      {editingBuild ? <Edit2 size={18} color="white" /> : <Save size={30} color="white" />}
                    </button>
                  </div>
                  {/* Builds Salvas */}
                  <div>
                    {userBuilds.length === 0 ? (
                      <p className="build-empty">Nenhuma build salva.</p>
                    ) : (
                      <div className="build-list">
                        {userBuilds.map((build) => (
                          <div key={build.id} className={`build-item ${build.is_active ? 'active' : ''}`}>
                            <div className="build-item-header">
                              <span className="build-item-name">{build.nome}</span>
                              {build.is_active && <span className="build-active-badge">Ativa</span>}
                              
                            </div>
                            <div className="build-item-actions">
                              <button
                                onClick={() => handleLoadBuildToTemp(build)}
                                className="btn-load-build"
                                title="Carregar para build temporária"
                              >
                                <Upload size={16} /> Carregar
                              </button>
                              {editingBuild?.id === build.id ? (
                                <button
                                  onClick={() => { setEditingBuild(null); setBuildName(""); }}
                                  className="btn-cancel"
                                  title="Cancelar edição"
                                >
                                  X
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEditBuild(build)}
                                  className="btn-edit-build"
                                  title="Editar nome"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBuild(build.id)}
                                className="btn-delete-build"
                                title="Deletar build"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Build Temporária */}
                <div className="build-section">
                  <h3>🛠️ Montar Build</h3>
                  <div className="temp-build-slots">
                    {tempBuild.map((skill, index) => {
                      const isLocked = index >= maxUnlockedSlots;
                      const unlockLevel = (index + 1) * 10;

                      return (
                        <div
                          key={index}
                          className={`temp-build-slot ${skill ? 'equipped' : 'empty'} ${isLocked ? 'locked' : ''}`}
                          onClick={() => skill && !isLocked ? removeSkillFromTempBuild(index) : null}
                          title={isLocked ? `Bloqueado: Nível ${unlockLevel}` : (skill ? `${skill.skill.name} (Clique para remover)` : 'Vazio')}
                        >
                          {isLocked ? (
                            <div className="lock-container">
                              <span className="lock-icon">🔒</span>
                              <span className="unlock-level">{unlockLevel}</span>
                            </div>
                          ) : skill ? (
                            skill.skill.image ? (
                              <img src={skill.skill.image} alt={skill.skill.name} className="skill-image" />
                            ) : (
                              <span className="skill-initial">{skill.skill.name.charAt(0)}</span>
                            )
                          ) : (
                            <span className="skill-empty-icon">+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleEquipTempBuild}
                    className="btn-equip-temp-build"
                    disabled={tempBuild.every(slot => slot === null)}
                  >
                    ⚔️ Equipar
                  </button>
                </div>

                {/* Skills Disponíveis */}
                <div className="build-section">
                  <h3>✨ Skills Disponíveis</h3>
                  <div className="build-skills-grid">
                    {availableSkills.map((userSkill) => (
                      <div key={userSkill.id} className="build-skill-item">
                        <div className="skill-image-container">
                          {userSkill.skill.image ? (
                            <img src={userSkill.skill.image} alt={userSkill.skill.name} />
                          ) : (
                            <span className="skill-initial">{userSkill.skill.name.charAt(0)}</span>
                          )}
                        </div>
                        <button
                          className="btn-add-skill"
                          onClick={() => addSkillToTempBuild(userSkill)}
                          title={`Adicionar ${userSkill.skill.name}`}
                        >
                          <Plus color="white" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmModal {...confirmState} />
    </>
  );
}