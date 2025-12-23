import { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Briefcase, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import leadService from '../services/leadService';
import Loader from '../components/Loader';

const B2BCalendar = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadService.getAllLeads({
          limit: 500,
        });
        const payload = response?.data || response;
        setLeads(payload?.leads || []);
      } catch (error) {
        console.error('Error fetching leads for calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const groupedByDate = useMemo(() => {
    const map = {};
    const today = new Date();

    leads.forEach((lead) => {
      if (!lead.followUpDate) return;
      const date = new Date(lead.followUpDate);
      const key = date.toISOString().split('T')[0];

      if (!map[key]) {
        map[key] = {
          date,
          items: [],
        };
      }

      const isOverdue = date < today && lead.status !== 'closed';
      map[key].items.push({
        ...lead,
        isOverdue,
      });
    });

    // Sort by date ascending
    return Object.values(map).sort((a, b) => a.date - b.date);
  }, [leads]);

  const formatDateLong = (date) =>
    date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-up Calendar</h1>
          <p className="mt-1 text-sm text-gray-600">
            See upcoming and overdue B2B follow-ups based on lead follow-up dates.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : groupedByDate.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <CalendarIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            No follow-up dates set yet. Use the Lead Detail modal to add
            follow-up dates for your leads.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <motion.div
              key={group.date.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-primary" size={18} />
                  <p className="font-semibold text-gray-800">
                    {formatDateLong(group.date)}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {group.items.length} follow-up
                  {group.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {group.items.map((item) => (
                  <div
                    key={item._id}
                    className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-1">
                      <Briefcase className="text-primary" size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.buyerName}
                          </p>
                          {item.companyName && (
                            <p className="text-xs text-gray-600">
                              {item.companyName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {item.productName} • Qty {item.quantityRequired}
                          </p>
                        </div>
                        <div className="text-xs text-right text-gray-600 space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                            <Clock size={12} />
                            <span className="capitalize">{item.status}</span>
                          </div>
                          {item.isOverdue && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700">
                              <AlertTriangle size={12} />
                              <span>Overdue</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.followUpNotes && (
                        <p className="mt-2 text-xs text-gray-700">
                          Notes: {item.followUpNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BCalendar;


