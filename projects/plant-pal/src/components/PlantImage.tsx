import React, { useState } from 'react';
import { PlantPlaceholder } from './PlantPlaceholder';

interface Props {
  src: string;
  name: string;
  className?: string;
}

export const PlantImage = ({ src, name, className = '' }: Props) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <PlantPlaceholder name={name} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
