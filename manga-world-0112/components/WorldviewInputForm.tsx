import React, { useState } from 'react';
import { WorldviewProposal } from '../types';

interface WorldviewInputFormProps {
  onSubmit: (proposal: WorldviewProposal) => void;
}

const InputField: React.FC<{
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isTextarea?: boolean;
}> = ({ id, label, description, value, onChange, isTextarea }) => (
  <div>
    <label htmlFor={id} className="block text-lg font-semibold text-white">
      {label}
    </label>
    <p className="text-sm text-gray-400 mb-2">{description}</p>
    {isTextarea ? (
      <textarea
        id={id}
        rows={4}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    ) : (
      <input
        type="text"
        id={id}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

const WorldviewInputForm: React.FC<WorldviewInputFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [coreConcept, setCoreConcept] = useState('');
  const [protagonistIdea, setProtagonistIdea] = useState('');
  const [firstEpisodeHook, setFirstEpisodeHook] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coreConcept) {
      alert("タイトルと世界観は入力してください。");
      return;
    }
    onSubmit({ title, coreConcept, protagonistIdea, firstEpisodeHook });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <InputField
        id="title"
        label="企画案タイトル"
        description="あなたの物語のタイトルを入力してください。"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <InputField
        id="core-concept"
        label="企画の核となる「世界観」"
        description="基本的な設定、主人公が置かれている状況、そして海外読者が斬新だと感じる日本的な要素を記述してください。"
        value={coreConcept}
        onChange={(e) => setCoreConcept(e.target.value)}
        isTextarea
      />
      <InputField
        id="protagonist-idea"
        label="主人公の設計"
        description="名前/年齢/職業、普遍的な共感要素、そして日本的な特殊能力や葛藤などを記述してください。"
        value={protagonistIdea}
        onChange={(e) => setProtagonistIdea(e.target.value)}
        isTextarea
      />
      <InputField
        id="first-episode-hook"
        label="第1話の「引き」のアイデア"
        description="読者が「次を読みたい」と感じる、第1話のラストシーンのアイデアを具体的に記述してください。"
        value={firstEpisodeHook}
        onChange={(e) => setFirstEpisodeHook(e.target.value)}
        isTextarea
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-500"
      >
        この内容で設定を深掘りする
      </button>
    </form>
  );
};

export default WorldviewInputForm;
