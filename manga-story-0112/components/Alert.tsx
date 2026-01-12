import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  onDismiss: () => void;
}

export const Alert: React.FC<AlertProps> = ({ children, onDismiss }) => {
  return (
    <div className="bg-cyan-900/50 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-lg relative text-sm" role="alert">
      <div className="flex items-start">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/>
          </svg>
        </div>
        <div>
          {children}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        aria-label="閉じる"
      >
        <svg className="fill-current h-6 w-6 text-cyan-300 hover:text-white" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </button>
    </div>
  );
};