import React from 'react';

export const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.981A10.501 10.501 0 0118 16.5a10.5 10.5 0 01-10.5-10.5c0-1.75.43-3.412 1.198-4.944a.75.75 0 01.83-.162z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M11.025 2.221a.75.75 0 01.83.162 6.42 6.42 0 012.668 4.218.75.75 0 01-1.464.33A4.92 4.92 0 0011.53 4.2a.75.75 0 01-.504-.859zM15.373 6.682a.75.75 0 01.162-.819 4.92 4.92 0 014.218 2.668.75.75 0 01-.33 1.464A6.42 6.42 0 0015.8 7.186a.75.75 0 01-.427-.504z"
      clipRule="evenodd"
    />
  </svg>
);

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-3.75 5.25a3.75 3.75 0 013.75-3.75h.008a3.75 3.75 0 013.742 3.75v3a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-3z" clipRule="evenodd" />
    </svg>
);

export const WorldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.75 1.5a.75.75 0 00-1.5 0v.638a7.46 7.46 0 00-4.033 2.457.75.75 0 00.998 1.125A6 6 0 0112 4.5a5.96 5.96 0 014.785 2.22.75.75 0 00.998-1.125A7.46 7.46 0 0012.75 2.138V1.5z" />
      <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0115.353-5.263.75.75 0 01-.998 1.125A6.75 6.75 0 0012 9.75a6.73 6.73 0 00-6.104 3.774.75.75 0 01-1.348-.548A8.225 8.225 0 014.5 13.5H2.25zM21.75 13.5a8.25 8.25 0 01-15.353 5.263.75.75 0 01.998-1.125A6.75 6.75 0 0012 18a6.73 6.73 0 006.104-3.774.75.75 0 011.348.548A8.225 8.225 0 0119.5 21h2.25a.75.75 0 000-1.5H21A8.22 8.22 0 0115 15a8.22 8.22 0 01-3-15.992.75.75 0 00-.548 1.348A6.75 6.75 0 0013.5 12a6.75 6.75 0 00-3.726 6.104.75.75 0 00.548 1.348A8.25 8.25 0 0121.75 13.5z" clipRule="evenodd" />
    </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l7.5-7.5 3 3L21 7.06v-1.06a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v10.06z" clipRule="evenodd" />
    </svg>
);

export const RestartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-4.5a.75.75 0 00-.75.75v4.5l1.903-1.903a.75.75 0 00-1.06-1.06l-1.903 1.903a7.5 7.5 0 01-9.663 3.665.75.75 0 00-.622 1.258 9 9 0 10.155-10.042.75.75 0 00-1.06-1.06l-1.903 1.903a7.5 7.5 0 01-2.08-5.785.75.75 0 00-.75-.75H2.25a.75.75 0 000 1.5h.505a.75.75 0 00.75.75v.505a.75.75 0 001.5 0v-.505a.75.75 0 00-.75-.75h-.505a.75.75 0 00-.75.75v.505c0 .414.336.75.75.75h.505a.75.75 0 00.75-.75v-.505c.414 0 .75.336.75.75v.505a.75.75 0 001.5 0v-.505a.75.75 0 00-.75-.75h-.505a.75.75 0 00-.75.75v.505c0 .414.336.75.75.75h.505a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75h-.505a.75.75 0 000 1.5h.505a.75.75 0 00.75-.75z" clipRule="evenodd" />
    </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.25 4.5a3 3 0 013-3h1.5a3 3 0 013 3v.75h-7.5V4.5z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M9 4.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v.75h-4.5V4.5zm-3 1.5A2.25 2.25 0 003.75 8.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0015 6H9zm.75 2.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z" clipRule="evenodd" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);