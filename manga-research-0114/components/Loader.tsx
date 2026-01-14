
import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = "読み込み中..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 text-center">
      <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-400">{text}</p>
    </div>
  );
};
