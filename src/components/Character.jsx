import "./Character.css"
import { X, Sword, Heart } from "lucide-react";

export default function CharacterModal({
  isOpen,
  onClose,
  children,
  equippedSkills = [],
  onSkillClick,
  userData
}) {
  if (!isOpen) return null;

  const nivel = userData?.nivel ?? 1;
  const maxUnlockedSlots = Math.floor(nivel / 10);

  const skillSlots = Array(6).fill(null);
  equippedSkills.slice(0, 6).forEach((skill, index) => {
    skillSlots[index] = skill;
  });

  const totalSlots = [0, 1, 2, 3, 4, 5];

  const vidaBase = 100;
  const ataqueBase = 50;

  const vida = Math.floor(vidaBase * (1 + nivel * 0.2));
  const ataque = Math.floor(ataqueBase * (1 + nivel * 0.2));


  return (
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
                  onClick={!isLocked ? onSkillClick : undefined}
                  disabled={isLocked}
                  title={isLocked ? `Bloqueado: Nível ${unlockLevel}` : (skill ? skill.skill.name : 'Slot vazio')}
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
            <p><Heart size={28} color="#ff4444" fill="red"/>Vida: {vida}</p>
            <p><Sword size={28} color="#ff8844" fill="#f35900ff"/>Ataque:{ataque}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}