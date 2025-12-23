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
  File
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
        className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {showDelete && onBulkDelete && (
              <Button
                variant="danger"
                size="small"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            )}

            {showStatusUpdate && onBulkStatusUpdate && availableStatuses.length > 0 && (
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowStatusModal(true)}
              >
                <CheckCircle size={16} />
                Update Status
              </Button>
            )}

            {showExport && onBulkExport && (
              <Button
                variant="secondary"
                size="small"
                onClick={onBulkExport}
              >
                <Download size={16} />
                Export Excel
              </Button>
            )}

            {showExportPDF && onBulkExportPDF && (
              <Button
                variant="secondary"
                size="small"
                onClick={onBulkExportPDF}
              >
                <File size={16} />
                Export PDF
              </Button>
            )}

            {showAssign && onBulkAssign && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowAssignModal(true)}
              >
                <UserPlus size={16} />
                Assign
              </Button>
            )}

            {customActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                size="small"
                onClick={action.onClick}
              >
                {action.icon && <action.icon size={16} />}
                {action.label}
              </Button>
            ))}
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

