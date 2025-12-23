import { useEffect, useState, useMemo } from 'react';
import { Building2, ShoppingBag, Briefcase, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import leadService from '../services/leadService';
import Loader from '../components/Loader';
import Table from '../components/Table';

const B2BBuyerCRM = () => {
  const [accounts, setAccounts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountsRes, leadsRes] = await Promise.all([
          api.get('/business-accounts'),
          leadService.getAllLeads({ limit: 1000 }),
        ]);

        setAccounts(accountsRes.data?.data || []);
        const leadsPayload = leadsRes?.data || leadsRes;
        setLeads(leadsPayload?.leads || []);
      } catch (error) {
        console.error('Error loading CRM data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const leadMetricsByAccount = useMemo(() => {
    const map = {};
    leads.forEach((lead) => {
      if (!lead.businessAccountId) return;
      const id =
        typeof lead.businessAccountId === 'string'
          ? lead.businessAccountId
          : lead.businessAccountId._id;
      if (!id) return;

      if (!map[id]) {
        map[id] = {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
        };
      }

      map[id].totalLeads += 1;
      if (lead.status === 'closed') {
        map[id].closedDeals += 1;
      } else if (!['rejected', 'lost'].includes(lead.status)) {
        map[id].openLeads += 1;
      }
    });
    return map;
  }, [leads]);

  const columns = [
    {
      header: 'Business',
      render: (account) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {account.companyName}
            </p>
            <p className="text-xs text-gray-600 capitalize">
              {account.businessType}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (account) => (
        <div className="text-xs text-gray-700">
          <p className="font-medium">{account.contactPerson?.name}</p>
          <p>{account.contactPerson?.email}</p>
          <p>{account.contactPerson?.phone}</p>
        </div>
      ),
    },
    {
      header: 'Leads / Deals',
      render: (account) => {
        const metrics = leadMetricsByAccount[account._id] || {
          totalLeads: 0,
          openLeads: 0,
          closedDeals: 0,
        };
        return (
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">
                {metrics.totalLeads}
              </span>{' '}
              leads
            </p>
            <p>
              <span className="font-semibold text-amber-600">
                {metrics.openLeads}
              </span>{' '}
              open
            </p>
            <p>
              <span className="font-semibold text-green-600">
                {metrics.closedDeals}
              </span>{' '}
              closed
            </p>
          </div>
        );
      },
    },
    {
      header: 'Credit',
      render: (account) => (
        <div className="text-xs text-gray-700 space-y-1">
          <p>
            Limit:{' '}
            <span className="font-semibold">
              ₹{(account.creditLimit || 0).toLocaleString('en-IN')}
            </span>
          </p>
          <p>
            Used:{' '}
            <span className="font-semibold text-red-600">
              ₹{(account.creditUsed || 0).toLocaleString('en-IN')}
            </span>
          </p>
          <p>
            Available:{' '}
            <span className="font-semibold text-green-600">
              ₹{(
                (account.creditLimit || 0) - (account.creditUsed || 0)
              ).toLocaleString('en-IN')}
            </span>
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer CRM</h1>
        <p className="mt-1 text-sm text-gray-600">
          See your key business customers with their lead activity and credit
          summary.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Business Accounts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {accounts.length}
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
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {leads.length}
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
              <ShoppingBag className="text-green-600" size={22} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {loading ? (
          <Loader />
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              No business accounts found. When customers create business
              accounts, they will appear here.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={accounts}
            emptyMessage="No business accounts found"
          />
        )}
      </div>
    </div>
  );
};

export default B2BBuyerCRM;


