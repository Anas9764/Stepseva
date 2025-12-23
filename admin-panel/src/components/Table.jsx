import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Table = ({ 
  columns, 
  data, 
  actions, 
  emptyMessage = 'No data available',
  enableBulkSelection = false,
  onSelectionChange,
  getRowId = (row, index) => row._id || row.id || index
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const prevDataRef = useRef(data);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const getRowIdRef = useRef(getRowId);

  // Update refs when props change
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
    getRowIdRef.current = getRowId;
  }, [onSelectionChange, getRowId]);

  // Reset selection when data actually changes (by comparing data length and IDs)
  useEffect(() => {
    const prevData = prevDataRef.current;
    const dataChanged = 
      !prevData || 
      prevData.length !== data.length ||
      JSON.stringify(prevData.map((row, i) => getRowIdRef.current(row, i))) !== 
      JSON.stringify(data.map((row, i) => getRowIdRef.current(row, i)));
    
    if (dataChanged) {
      setSelectedRows(new Set());
      prevDataRef.current = data;
    }
  }, [data]);

  // Notify parent of selection changes (only when selection actually changes)
  useEffect(() => {
    if (onSelectionChangeRef.current && selectedRows.size > 0) {
      const selectedData = data.filter((row, index) => 
        selectedRows.has(getRowIdRef.current(row, index))
      );
      onSelectionChangeRef.current(selectedData, selectedRows.size);
    } else if (onSelectionChangeRef.current && selectedRows.size === 0) {
      // Notify when selection is cleared
      onSelectionChangeRef.current([], 0);
    }
  }, [selectedRows, data]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(data.map((row, index) => getRowId(row, index)));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gradient-to-r from-pink-50 to-lavender-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {enableBulkSelection && (
                <th className="px-4 py-4 w-12">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                  </div>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row, rowIndex);
              const isSelected = selectedRows.has(rowId);
              
              return (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  {enableBulkSelection && (
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                      </div>
                    </td>
                  )}
                {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

