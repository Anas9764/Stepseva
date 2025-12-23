import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BarChart3, Package } from 'lucide-react';
import { fetchLeadStats } from '../store/slices/leadsSlice';
import Loader from '../components/Loader';

const B2BProductInquiryAnalytics = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.leads);

  useEffect(() => {
    dispatch(fetchLeadStats());
  }, [dispatch]);

  const topProducts = stats?.topProducts || [];

  const totalProductLeads = topProducts.reduce(
    (sum, p) => sum + (p.leadCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Product Inquiry Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          See which products are getting the most B2B inquiries.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : !topProducts.length ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            No lead data available yet. Once inquiries come in, you&apos;ll see
            product-wise insights here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tracked Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {topProducts.length}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="text-primary" size={22} />
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
                  <p className="text-sm text-gray-600">Total Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {totalProductLeads}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <BarChart3 className="text-amber-600" size={22} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Top Inquired Products
            </h2>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <motion.div
                  key={`${product.productName}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {index + 1}
                    </span>
                    {product.productImage && (
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.leadCount} lead
                        {product.leadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default B2BProductInquiryAnalytics;


