import { useEffect, useState, useMemo } from 'react';
import { Users as UsersIcon, Briefcase, Target, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import userService from '../services/userService';
import leadService from '../services/leadService';
import Table from '../components/Table';
import Loader from '../components/Loader';

const B2BTeamManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, leadsRes] = await Promise.all([
          userService.getAllUsers(),
          leadService.getAllLeads({ limit: 1000 }),
        ]);

        const allUsers = usersRes?.data || usersRes?.users || [];
        const adminUsers = allUsers.filter((u) => u.role === 'admin');
        setAdmins(adminUsers);

        const leadsPayload = leadsRes?.data || leadsRes;
        setLeads(leadsPayload?.leads || []);
      } catch (error) {
        console.error('Error loading team management data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metricsByAdmin = useMemo(() => {
    const map = {};

    leads.forEach((lead) => {
      const id = lead.assignedTo?._id || lead.assignedTo;
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
          contacted: 0,
        };
      }

      map[id].totalLeads += 1;
      if (['closed'].includes(lead.status)) {
        map[id].closedDeals += 1;
      } else if (!['rejected', 'lost'].includes(lead.status)) {
        map[id].openLeads += 1;
      }
      if (['contacted', 'interested', 'quoted', 'negotiating', 'closed'].includes(lead.status)) {
        map[id].contacted += 1;
      }
    });

    return map;
  }, [leads]);

  const columns = [
    {
      header: 'Team Member',
      render: (admin) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UsersIcon size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
            <p className="text-xs text-gray-600">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leads',
      render: (admin) => {
        const stats = metricsByAdmin[admin._id] || {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
          contacted: 0,
        };
        return (
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{stats.totalLeads}</p>
            <p className="text-xs text-gray-500">Total assigned</p>
          </div>
        );
      },
    },
    {
      header: 'Open / Closed',
      render: (admin) => {
        const stats = metricsByAdmin[admin._id] || {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
          contacted: 0,
        };
        return (
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              <span className="font-semibold text-amber-600">
                {stats.openLeads}
              </span>{' '}
              open
            </p>
            <p>
              <span className="font-semibold text-green-600">
                {stats.closedDeals}
              </span>{' '}
              closed
            </p>
          </div>
        );
      },
    },
    {
      header: 'Contacted',
      render: (admin) => {
        const stats = metricsByAdmin[admin._id] || {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
          contacted: 0,
        };
        const rate =
          stats.totalLeads > 0
            ? Math.round((stats.contacted / stats.totalLeads) * 100)
            : 0;
        return (
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              <span className="font-semibold text-blue-600">
                {stats.contacted}
              </span>{' '}
              leads
            </p>
            <p className="text-gray-500">{rate}% contacted</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">B2B Team Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          See how your admin team is performing with assigned B2B leads.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {admins.length}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <UsersIcon className="text-primary" size={22} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assigned Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {leads.filter((l) => l.assignedTo).length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Briefcase className="text-amber-600" size={22} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed Deals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {leads.filter((l) => l.status === 'closed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={22} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              No admin users found. Use the Users page to promote team members to
              admin.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={admins}
            actions={(admin) => {
              const stats = metricsByAdmin[admin._id] || {
                totalLeads: 0,
                openLeads: 0,
                closedDeals: 0,
                contacted: 0,
              };
              return (
                <div className="text-xs text-gray-600 space-y-1 text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    <PhoneCall size={12} />
                    <span>
                      {stats.openLeads} lead
                      {stats.openLeads === 1 ? '' : 's'} to contact
                    </span>
                  </div>
                </div>
              );
            }}
            emptyMessage="No team members found"
          />
        )}
      </div>
    </div>
  );
};

export default B2BTeamManagement;


