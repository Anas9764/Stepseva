import React from 'react';

export default function TrustStrip({ items = [] }) {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-primary">
                  {Icon ? <Icon /> : null}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 leading-tight">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
