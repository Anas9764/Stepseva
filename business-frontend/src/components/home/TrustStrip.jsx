import React from 'react';
import { motion } from 'framer-motion';

export default function TrustStrip({ items = [] }) {
  return (
    <section className="bg-white border-y border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex items-center gap-3 sm:gap-4 rounded-2xl bg-gradient-to-br from-white to-sky/30 border border-gray-100 px-4 sm:px-5 py-4 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {Icon ? <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-secondary text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
