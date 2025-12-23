import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';
import { leadService } from '../services/leadService';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const B2BReportsExport = () => {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      const params = {
        page: 1,
        limit: 1000, // Export up to 1000 leads at once
      };

      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (businessType) params.businessType = businessType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await leadService.getAllLeads(params);

      const payload = response?.data || response;
      const leads = payload?.leads || [];

      if (!leads.length) {
        toast.error('No leads found for the selected filters.');
        return;
      }

      const headers = [
        'Lead ID',
        'Created At',
        'Buyer Name',
        'Email',
        'Phone',
        'Company',
        'Business Type',
        'Product',
        'Quantity',
        'Status',
        'Priority',
        'Quoted Price',
        'Follow-up Date',
      ];

      const rows = leads.map((lead) => [
        lead._id,
        lead.createdAt ? new Date(lead.createdAt).toISOString() : '',
        lead.buyerName || '',
        lead.buyerEmail || '',
        lead.buyerPhone || '',
        lead.companyName || '',
        lead.businessType || '',
        lead.productName || '',
        lead.quantityRequired || '',
        lead.status || '',
        lead.priority || '',
        lead.quotedPrice || '',
        lead.followUpDate
          ? new Date(lead.followUpDate).toISOString().split('T')[0]
          : '',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => {
              if (value === null || value === undefined) return '';
              const stringValue = String(value).replace(/"/g, '""');
              return `"${stringValue}"`;
            })
            .join(',')
        )
        .join('\n');

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `b2b-leads-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Exported ${leads.length} leads to CSV.`);
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Reports & Export</h1>
          <p className="mt-1 text-sm text-gray-600">
            Export B2B leads data to CSV for offline analysis and reporting.
          </p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
          <Filter size={16} />
          <span>Use filters to narrow down which leads you want to export.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="quoted">Quoted</option>
              <option value="negotiating">Negotiating</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="retailer">Retailer</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="distributor">Distributor</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="business_customer">Business Customer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default B2BReportsExport;


