import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Edit, 
  Download, 
  CheckCircle, 
  X, 
  MoreVertical,
  FileDown,
  FileText,
  Mail,
  UserPlus,
  File,
  ArrowUpDown
} from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

const BulkActions = ({ 
  selectedCount, 
  onBulkDelete, 
  onBulkStatusUpdate,
  onBulkExport,
  onBulkExportPDF,
  onBulkAssign,
  availableStatuses = [],
  showDelete = true,
  showStatusUpdate = false,
  showExport = true,
  showExportPDF = false,
  showAssign = false,
  customActions = []
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assignTo, setAssignTo] = useState('');

  if (selectedCount === 0) return null;

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} item(s)?`)) {
      onBulkDelete?.();
    }
  };

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      onBulkStatusUpdate?.(selectedStatus);
      setShowStatusModal(false);
      setSelectedStatus('');
    }
  };

  const handleBulkAssign = () => {
    if (assignTo) {
      onBulkAssign?.(assignTo);
      setShowAssignModal(false);
      setAssignTo('');
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left side - Badge and count */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {showStatusUpdate && onBulkStatusUpdate && availableStatuses.length > 0 && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
              >
                <CheckCircle size={16} />
                Update Status
              </button>
            )}

            {showExport && onBulkExport && (
              <button
                onClick={onBulkExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
              >
                <Download size={16} />
                Export Excel
              </button>
            )}

            {showExportPDF && onBulkExportPDF && (
              <button
                onClick={onBulkExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
              >
                <FileText size={16} />
                Export PDF
              </button>
            )}

            {showDelete && onBulkDelete && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            {showAssign && onBulkAssign && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
              >
                <UserPlus size={16} />
                Assign
              </button>
            )}

            {customActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                >
                  {IconComponent && <IconComponent size={16} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus('');
        }}
        title="Update Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select status...</option>
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedStatus('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={!selectedStatus}
            >
              Update {selectedCount} Item{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssignTo('');
        }}
        title="Assign Items"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <input
              type="text"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="Enter user ID or email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAssignModal(false);
                setAssignTo('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkAssign}
              disabled={!assignTo}
            >
              Assign {selectedCount} Item{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkActions;

