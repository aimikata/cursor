import React from 'react';

export const CatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5c.67 0 1.35.09 2 .26 1.78.47 3.34 1.41 4.5 2.74 1.05 1.23 1.5 2.8 1.5 4.51 0 2.2-1.04 3.9-2.5 5.19" />
    <path d="M12 21c-1.66 0-3-1.34-3-3 0-.8.3-1.5.8-2.1" />
    <path d="M4.17 11.25a2.48 2.48 0 0 0-1.37.5c-1.33 1.2-1.5 3.2-.3 4.5l2.2 2.5" />
    <path d="M4.5 10.5c-1 0-2.22.3-3.23.8" />
    <path d="M18.5 6.5c.33-.25.5-.67.5-1.12 0-1.13-1.34-2.08-3-2.08s-3 .95-3 2.08c0 .45.17.87.5 1.12" />
    <path d="M15 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z" />
    <path d="M9.5 6.5c.33-.25.5-.67.5-1.12 0-1.13-1.34-2.08-3-2.08S4 4.25 4 5.38c0 .45.17.87.5 1.12" />
  </svg>
);
