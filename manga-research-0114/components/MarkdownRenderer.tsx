
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-2 my-4">
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    }
    listItems = [];
    inList = false;
  };

  const parseLine = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-teal-300">{part}</strong> : part
    );
  };
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) {
          flushList(); // Flush previous non-list content
          inList = true;
      }
      listItems.push(parseLine(trimmedLine.substring(2)));
    } else {
      flushList();
      if (trimmedLine.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-bold text-teal-400 mt-6 border-b border-gray-600 pb-2">{parseLine(trimmedLine.substring(4))}</h3>);
      } else if (trimmedLine.startsWith('## ')) {
         elements.push(<h2 key={index} className="text-2xl font-bold text-blue-400 mt-8 border-b-2 border-blue-500 pb-2">{parseLine(trimmedLine.substring(3))}</h2>);
      } else if (trimmedLine) {
        elements.push(<p key={index} className="leading-relaxed">{parseLine(trimmedLine)}</p>);
      }
    }
  });

  flushList();

  return <div className="space-y-4 text-gray-300">{elements}</div>;
};
