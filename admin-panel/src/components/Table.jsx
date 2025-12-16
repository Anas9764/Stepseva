import { motion } from 'framer-motion';

const Table = ({ columns, data, actions, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gradient-to-r from-pink-50 to-lavender-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

