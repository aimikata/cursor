import React from 'react';

interface StepHeaderProps {
  step: number;
  title: string;
  icon: React.ReactNode;
}

const StepHeader: React.FC<StepHeaderProps> = ({ step, title, icon }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-indigo-400">STEP {step}</p>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
    </div>
  );
};

export default StepHeader;