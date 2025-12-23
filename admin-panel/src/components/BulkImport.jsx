import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Button from './Button';
import Modal from './Modal';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const BulkImport = ({
  isOpen,
  onClose,
  onImport,
  templateUrl,
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
  maxSize = 5 * 1024 * 1024, // 5MB
  validationRules = [],
  sampleData = [],
}) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file format or size');
      return;
    }

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    parseFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize,
    multiple: false,
  });

  const parseFile = async (file) => {
    try {
      setValidating(true);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      const validationErrors = validateData(jsonData);
      setErrors(validationErrors);
      setData(jsonData);

      if (validationErrors.length === 0) {
        toast.success(`Successfully parsed ${jsonData.length} rows`);
      } else {
        toast.warning(`Parsed ${jsonData.length} rows with ${validationErrors.length} errors`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setValidating(false);
    }
  };

  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, index) => {
      validationRules.forEach((rule) => {
        const value = row[rule.field];
        
        if (rule.required && (!value || value.toString().trim() === '')) {
          errors.push({
            row: index + 2, // +2 for header and 1-based index
            field: rule.field,
            message: `${rule.field} is required`,
          });
        }
        
        if (value && rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            row: index + 2,
            field: rule.field,
            message: `${rule.field} must be a valid email`,
          });
        }
        
        if (value && rule.type === 'number' && isNaN(value)) {
          errors.push({
            row: index + 2,
            field: rule.field,
            message: `${rule.field} must be a number`,
          });
        }
        
        if (value && rule.minLength && value.toString().length < rule.minLength) {
          errors.push({
            row: index + 2,
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters`,
          });
        }
        
        if (value && rule.maxLength && value.toString().length > rule.maxLength) {
          errors.push({
            row: index + 2,
            field: rule.field,
            message: `${rule.field} must be at most ${rule.maxLength} characters`,
          });
        }
      });
    });
    
    return errors;
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    try {
      setImporting(true);
      await onImport(data);
      toast.success(`Successfully imported ${data.length} items`);
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setData([]);
    setErrors([]);
    onClose();
  };

  const downloadTemplate = () => {
    if (!sampleData.length) return;
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'import-template.xlsx');
    toast.success('Template downloaded');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import" size="lg">
      <div className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary'
          }`}
          role="button"
          aria-label="Upload file"
          tabIndex={0}
        >
          <input {...getInputProps()} />
          <Upload
            size={48}
            className={`mx-auto mb-4 ${
              isDragActive ? 'text-primary' : 'text-gray-400'
            }`}
          />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Accepted formats: {acceptedFormats.join(', ')} (Max {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>

        {/* File Info */}
        {file && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB • {data.length} rows
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setData([]);
                setErrors([]);
              }}
              className="text-red-600 hover:text-red-700"
              aria-label="Remove file"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={20} className="text-red-600" />
              <h4 className="font-semibold text-red-900 dark:text-red-200">
                Validation Errors ({errors.length})
              </h4>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {errors.slice(0, 10).map((error, index) => (
                <p key={index} className="text-sm text-red-700 dark:text-red-300">
                  Row {error.row}: {error.message}
                </p>
              ))}
              {errors.length > 10 && (
                <p className="text-sm text-red-600 font-medium">
                  ... and {errors.length - 10} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Preview */}
        {data.length > 0 && errors.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-green-900 dark:text-green-200 font-medium">
                All {data.length} rows are valid and ready to import
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {templateUrl && (
              <Button
                variant="outline"
                onClick={downloadTemplate}
                icon={<Download size={18} />}
              >
                Download Template
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={importing || validating}
              disabled={!file || data.length === 0 || errors.length > 0}
              icon={<Upload size={18} />}
            >
              Import {data.length > 0 && `(${data.length} items)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkImport;

