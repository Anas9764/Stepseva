import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLead } from '../../store/slices/leadsSlice';
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
      setStatus(lead.status || 'new');
      setPriority(lead.priority || 'medium');
      setQuotedPrice(lead.quotedPrice || '');
      setQuoteNotes(lead.quoteNotes || '');
      setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
      setInternalNotes(lead.internalNotes || '');
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
      if (internalNotes) updateData.internalNotes = internalNotes;

      await dispatch(updateLead({ id: lead._id, data: updateData })).unwrap();
      toast.success('Lead updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      setLoading(true);
      let updateData = {};

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
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update lead');
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
      title={`Lead Details - ${lead.buyerName}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-6">
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
                    <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                      Call
                    </button>
                    <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                      WhatsApp
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
              Product Information
            </h4>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold">{formatDate(lead.createdAt)}</span>
              </div>
              {lead.contactedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">First Contacted:</span>
                  <span className="font-semibold">{formatDate(lead.contactedAt)}</span>
                </div>
              )}
              {lead.lastContactedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Contacted:</span>
                  <span className="font-semibold">{formatDate(lead.lastContactedAt)}</span>
                </div>
              )}
              {lead.quotedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quoted:</span>
                  <span className="font-semibold">{formatDate(lead.quotedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="success"
            size="small"
            onClick={() => handleQuickAction('contacted')}
            disabled={loading || lead.status === 'contacted'}
          >
            <PhoneCall size={16} />
            Mark as Contacted
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => handleQuickAction('quoted')}
            disabled={loading}
          >
            <FileText size={16} />
            Mark as Quoted
          </Button>
          <Button
            variant="success"
            size="small"
            onClick={() => handleQuickAction('closed')}
            disabled={loading}
          >
            <CheckCircle size={16} />
            Close Deal
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleQuickAction('rejected')}
            disabled={loading}
          >
            <X size={16} />
            Reject
          </Button>
        </div>

        {/* Main Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Updating...' : 'Update Lead'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeadDetailModal;

