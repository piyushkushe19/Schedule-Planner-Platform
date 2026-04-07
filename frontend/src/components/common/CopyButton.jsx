import { useState } from 'react';
import { copyToClipboard } from '../../utils/helpers';

export default function CopyButton({ text, label = 'Copy link', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handle}
      className={`
        px-4 py-2.5 text-sm font-semibold rounded-xl
        transition-all duration-200
        ${copied
          ? 'bg-emerald-500 text-white'
          : 'bg-brand-600 hover:bg-brand-700 text-white'}
        ${className}
      `}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}
