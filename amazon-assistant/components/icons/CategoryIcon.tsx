
import React from 'react';

export const CategoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6h18Z" />
        <path d="M20 14h-5.04a2 2 0 0 0-1.87.97l-1.16 2.06a2 2 0 0 1-1.87.97H4" />
    </svg>
);
   