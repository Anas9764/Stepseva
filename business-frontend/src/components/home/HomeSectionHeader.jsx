import React from 'react';

export default function HomeSectionHeader({ title, subtitle, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`${alignClass} mb-10`}>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  );
}
