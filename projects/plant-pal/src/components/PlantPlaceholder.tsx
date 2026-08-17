import React from 'react';

export const PlantPlaceholder = ({ name, className = '' }: { name: string; className?: string }) => (
  <div className={`flex items-center justify-center bg-muted ${className}`}>
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-30">
      <path d="M40 70V35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 35C40 25 30 18 20 22C25 28 30 32 40 35Z" fill="currentColor" opacity="0.4" />
      <path d="M40 42C40 32 50 25 60 29C55 35 50 39 40 42Z" fill="currentColor" opacity="0.3" />
      <path d="M40 28C40 18 34 10 26 12C30 18 34 24 40 28Z" fill="currentColor" opacity="0.5" />
    </svg>
    <span className="absolute text-3xl font-bold text-muted-foreground/30 font-serif">
      {name?.charAt(0)?.toUpperCase() || '🌱'}
    </span>
  </div>
);
