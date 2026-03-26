'use client';

import { useState } from 'react';
import { Link2, Twitter, Linkedin, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  }

  const buttonStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-tertiary)',
  };

  return (
    <div className="flex items-center gap-3 mt-6">
      <span className="text-xs font-medium" style={{ color: 'var(--text-disabled)' }}>
        Share:
      </span>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors duration-150 hover:text-[var(--primary)] hover:border-[var(--primary)]"
        style={buttonStyle}
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <button
        onClick={shareTwitter}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors duration-150 hover:text-[var(--primary)] hover:border-[var(--primary)]"
        style={buttonStyle}
      >
        <Twitter size={14} />
        Twitter
      </button>
      <button
        onClick={shareLinkedIn}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors duration-150 hover:text-[var(--primary)] hover:border-[var(--primary)]"
        style={buttonStyle}
      >
        <Linkedin size={14} />
        LinkedIn
      </button>
    </div>
  );
}
