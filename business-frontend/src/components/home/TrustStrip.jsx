import React from 'react';
import { motion } from 'framer-motion';

export default function TrustStrip({ items = [] }) {
  return (
    <section className="bg-white border-y border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-white to-sky/30 border border-gray-100 px-5 py-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {Icon ? <Icon size={22} /> : null}
                </div>
                <div>
                  <p className="font-semibold text-secondary leading-tight group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
