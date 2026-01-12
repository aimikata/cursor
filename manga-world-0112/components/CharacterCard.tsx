
import React from 'react';
import { CharacterSetting } from '../types';

interface DetailItemProps {
  label: string;
  value: string | undefined;
  isTag?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isTag }) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{label}</h4>
      <p className={isTag ? "text-gray-300 font-mono bg-black/40 p-3 rounded-xl mt-1 text-[10px] border border-gray-800 break-all" : "text-gray-300 text-sm leading-relaxed"}>{value}</p>
    </div>
  );
};

const CharacterCard: React.FC<{ character: CharacterSetting; title: string }> = ({ character, title }) => {
  return (
    <div className="bg-gray-900/50 p-10 rounded-[2.5rem] shadow-2xl border border-gray-800">
      <div className="flex justify-between items-start mb-10 border-b border-gray-800 pb-8">
        <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2">{title}</p>
            <h3 className="text-4xl font-black text-white tracking-tight">{character.name}</h3>
            <p className="text-indigo-400 font-black text-sm uppercase tracking-widest mt-1">{character.englishName}</p>
        </div>
        <div className="bg-indigo-600/10 px-6 py-3 rounded-full border border-indigo-500/20">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{character.age} years old / {character.occupation}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div className="md:col-span-2">
             <DetailItem label="Visual Engine Tags / ビジュアル・タグ" value={character.visualTags} isTag />
        </div>
        <DetailItem label="Public Persona / 表向きの性格" value={character.publicPersona} />
        <DetailItem label="Hidden Self / 隠された内面・虚無感" value={character.hiddenSelf} />
        
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-10 bg-black/20 p-8 rounded-3xl border border-gray-800">
            <DetailItem label="Past Trauma / トラウマ" value={character.pastTrauma} />
            <DetailItem label="Greatest Weakness / 最大の弱点" value={character.greatestWeakness} />
            <DetailItem label="Potential / 克服時の姿" value={character.potentialWhenOvercome} />
        </div>

        {character.relationshipWithProtagonist && <div className="md:col-span-2"><DetailItem label="Relationship / 主人公との関係" value={character.relationshipWithProtagonist} /></div>}
        {character.goal && <DetailItem label="Goal / 目標" value={character.goal} />}
        {character.secret && <DetailItem label="Secret / 秘密" value={character.secret} />}
      </div>
    </div>
  );
};

export default CharacterCard;
