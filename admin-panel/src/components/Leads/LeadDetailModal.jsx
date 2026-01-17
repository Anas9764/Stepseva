import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead } from '../../store/slices/leadsSlice';
import bulkRfqService from '../../services/bulkRfqService';
import Modal from '../Modal';
import Button from '../Button';
import LeadStatusBadge from './LeadStatusBadge';
import LeadPriorityBadge from './LeadPriorityBadge';
import { 
  User, Mail, Phone, MapPin, Briefcase, Package, 
  Calendar, DollarSign, FileText, MessageCircle,
  CheckCircle, X, Save, PhoneCall, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadDetailModal = ({ isOpen, onClose, lead, onUpdate }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      // For bulk RFQ, use original status if available, otherwise use status
      // For single leads, use the lead status
      const initialStatus = lead._isBulkRFQ && lead._originalStatus ? lead._originalStatus : (lead.status || 'new');
      setStatus(initialStatus);
      setPriority(lead.priority || 'medium');
      setQuotedPrice(lead.quotedPrice || '');
      setQuoteNotes(lead.quoteNotes || '');
      setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
      // Handle both single lead (internalNotes) and bulk RFQ (adminNotes)
      setInternalNotes(lead.internalNotes || lead.adminNotes || '');
    }
  }, [lead]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        status,
        priority,
      };

      if (quotedPrice) updateData.quotedPrice = parseFloat(quotedPrice);
      if (quoteNotes) updateData.quoteNotes = quoteNotes;
      if (followUpDate) updateData.followUpDate = followUpDate;
      if (internalNotes) updateData.adminNotes = internalNotes;

      // Handle bulk RFQ updates
      if (lead._isBulkRFQ) {
        // Status is already in bulk RFQ format (in_progress, won, etc.) from dropdown
        updateData.status = status;
        
        await bulkRfqService.update(lead._id, updateData);
        toast.success('Bulk RFQ updated successfully!');
      } else {
        await dispatch(updateLead({ id: lead._id, data: updateData })).unwrap();
        toast.success('Lead updated successfully!');
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      setLoading(true);
      let updateData = {};

      if (lead._isBulkRFQ) {
        // Map actions for bulk RFQ
        switch (action) {
          case 'contacted':
            updateData = { status: 'in_progress' };
            break;
          case 'quoted':
            updateData = { status: 'quoted' };
            break;
          case 'closed':
            updateData = { status: 'won' };
            break;
          case 'rejected':
            updateData = { status: 'lost' };
            break;
          default:
            updateData = { status: action };
        }
        await bulkRfqService.update(lead._id, updateData);
        toast.success(`Bulk RFQ marked as ${action}!`);
      } else {
        // Single lead actions
        switch (action) {
          case 'contacted':
            updateData = {
              status: 'contacted',
              contactedAt: new Date().toISOString(),
            };
            break;
          case 'interested':
            updateData = { status: 'interested' };
            break;
          case 'quoted':
            updateData = { status: 'quoted' };
            break;
          case 'closed':
            updateData = { status: 'closed' };
            break;
          case 'rejected':
            updateData = { status: 'rejected' };
            break;
          default:
            break;
        }
        await dispatch(updateLead({ id: lead._id, data: updateData })).unwrap();
        toast.success(`Lead marked as ${action}!`);
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${lead._isBulkRFQ ? 'Bulk RFQ' : 'Lead'} Details - ${lead.buyerName}`}
      size="xl"
    >
      <div className="flex flex-col">
        {/* Scrollable Content */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Buyer & Product Information */}
        <div className="space-y-6">
          {/* Buyer Information */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Buyer Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.buyerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.buyerEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.buyerPhone}</p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => window.open(`tel:${lead.buyerPhone}`, '_self')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <Phone size={12} />
                      Call
                    </button>
                    <button 
                      onClick={() => {
                        const phone = lead.buyerPhone.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${phone}`, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20BA5A] transition-colors shadow-sm"
                    >
                      <MessageCircle size={12} />
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => window.location.href = `mailto:${lead.buyerEmail}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <Mail size={12} />
                      Email
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {lead.buyerCity}{lead.buyerState ? `, ${lead.buyerState}` : ''}, {lead.buyerCountry}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Business Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{lead.businessType}</p>
                </div>
              </div>
              {lead.companyName && (
                <div className="flex items-start gap-3">
                  <Briefcase size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Company Name</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.companyName}</p>
                  </div>
                </div>
              )}
              {lead.gstNumber && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">GST Number</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.gstNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              {lead._isBulkRFQ ? 'Products Information' : 'Product Information'}
            </h4>
            
            {/* Handle Bulk RFQ - Multiple Products */}
            {lead._isBulkRFQ && lead.items && Array.isArray(lead.items) && lead.items.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Total Items</p>
                  <p className="text-lg font-bold text-gray-900">{lead.items.length} Product{lead.items.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total Quantity: {lead.items.reduce((sum, item) => sum + (item.quantityRequired || 0), 0)} units
                  </p>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {lead.items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        {/* Product Image */}
                        {item.productId?.image ? (
                          <img 
                            src={item.productId.image} 
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-2">{item.productName}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-600">Quantity</p>
                              <p className="font-semibold text-gray-900">{item.quantityRequired} units</p>
                            </div>
                            {item.size && (
                              <div>
                                <p className="text-gray-600">Size</p>
                                <p className="font-semibold text-gray-900">{item.size}</p>
                              </div>
                            )}
                            {item.color && (
                              <div>
                                <p className="text-gray-600">Color</p>
                                <p className="font-semibold text-gray-900">{item.color}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Handle Single Product Lead */
              <div className="space-y-3">
                {lead.productId?.image && (
                  <img 
                    src={lead.productId.image} 
                    alt={lead.productName}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-600">Product Name</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.productName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Quantity</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.quantityRequired} units</p>
                  </div>
                  {lead.size && (
                    <div>
                      <p className="text-xs text-gray-600">Size</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.size}</p>
                    </div>
                  )}
                </div>
                {lead.color && (
                  <div>
                    <p className="text-xs text-gray-600">Color Preference</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.color}</p>
                  </div>
                )}
                {lead.productId?.moq && (
                  <div>
                    <p className="text-xs text-gray-600">Product MOQ</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.productId.moq} units</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inquiry Details */}
          {(lead.notes || lead.requirements) && (
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" />
                Inquiry Details
              </h4>
              {lead.requirements && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600">Requirements</p>
                  <p className="text-sm text-gray-800 mt-1">{lead.requirements}</p>
                </div>
              )}
              {lead.notes && (
                <div>
                  <p className="text-xs text-gray-600">Additional Notes</p>
                  <p className="text-sm text-gray-800 mt-1">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Lead Management */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Lead Status & Priority</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {lead._isBulkRFQ ? (
                    <>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="quoted">Quoted</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                      <option value="closed">Closed</option>
                    </>
                  ) : (
                    <>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="quoted">Quoted</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                      <option value="lost">Lost</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Current Status</p>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">Current Priority</p>
                  <LeadPriorityBadge priority={lead.priority} />
                </div>
              </div>
            </div>
          </div>

          {/* Quote Information */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Quote Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quoted Price (₹)
                </label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Enter quoted price"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Notes
                </label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Add notes about the quote..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
                />
              </div>

              {lead.quotedAt && (
                <div>
                  <p className="text-xs text-gray-600">Quoted On</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(lead.quotedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Follow-up
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes (not visible to buyer)..."
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
                />
              </div>
            </div>
          </div>

        </div>
          </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleQuickAction('contacted')}
            disabled={loading || (lead._isBulkRFQ ? lead.status === 'in_progress' : lead.status === 'contacted')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <PhoneCall size={16} />
            Mark as Contacted
          </button>
          <button
            onClick={() => handleQuickAction('quoted')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <FileText size={16} />
            Mark as Quoted
          </button>
          <button
            onClick={() => handleQuickAction('closed')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <CheckCircle size={16} />
            Close Deal
          </button>
          <button
            onClick={() => handleQuickAction('rejected')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            <X size={16} />
            Reject
          </button>
        </div>

        {/* Main Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save size={18} />
            {loading ? 'Updating...' : 'Update Lead'}
          </button>
        </div>
      </div>
      </div>
    </Modal>
  );
};

export default LeadDetailModal;

