import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUser, FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { createBusinessAccount } from '../store/slices/businessAccountSlice';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  businessType: yup.string().required('Business type is required'),
  companyName: yup.string().required('Company name is required'),
  businessRegistrationNumber: yup.string(),
  taxId: yup.string(),
  'businessAddress.street': yup.string().required('Street address is required'),
  'businessAddress.city': yup.string().required('City is required'),
  'businessAddress.state': yup.string().required('State is required'),
  'businessAddress.zipCode': yup.string().required('ZIP code is required'),
  'businessAddress.country': yup.string().required('Country is required'),
  'contactPerson.name': yup.string().required('Contact person name is required'),
  'contactPerson.email': yup.string().email('Invalid email').required('Contact email is required'),
  'contactPerson.phone': yup.string().required('Phone number is required'),
  'contactPerson.designation': yup.string(),
  creditLimit: yup.number().min(0, 'Credit limit must be positive'),
  paymentTerms: yup.string().required('Payment terms are required'),
});

const BusinessAccountSetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.businessAccount);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      businessType: '',
      paymentTerms: 'net30',
      creditLimit: 0,
    },
  });

  const businessType = watch('businessType');

  const onSubmit = async (data) => {
    try {
      await dispatch(createBusinessAccount(data)).unwrap();
      toast.success('Business account created successfully! Pending admin approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Failed to create business account');
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
              Create Business Account
            </h1>
            <p className="text-gray-600 mb-8">
              Set up your B2B account to access volume pricing, credit terms, and bulk ordering
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step <= currentStep
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step < currentStep ? <FiCheckCircle /> : step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 && 'Business Info'}
                      {step === 2 && 'Address'}
                      {step === 3 && 'Contact'}
                      {step === 4 && 'Terms'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FiBriefcase className="text-primary" size={24} />
                    <h2 className="text-2xl font-heading font-bold text-secondary">
                      Business Information
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Business Type *
                    </label>
                    <select
                      {...register('businessType')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.businessType ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">Select business type</option>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="business_customer">Business Customer</option>
                    </select>
                    {errors.businessType && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Company Name *
                    </label>
                    <input
                      {...register('companyName')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Registration Number
                      </label>
                      <input
                        {...register('businessRegistrationNumber')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Tax ID</label>
                      <input
                        {...register('taxId')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Business Address */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FiMapPin className="text-primary" size={24} />
                    <h2 className="text-2xl font-heading font-bold text-secondary">
                      Business Address
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Street Address *
                    </label>
                    <input
                      {...register('businessAddress.street')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.businessAddress?.street ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.businessAddress?.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.businessAddress.street.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">City *</label>
                      <input
                        {...register('businessAddress.city')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.businessAddress?.city ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.businessAddress?.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.businessAddress.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">State *</label>
                      <input
                        {...register('businessAddress.state')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.businessAddress?.state ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.businessAddress?.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.businessAddress.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        ZIP Code *
                      </label>
                      <input
                        {...register('businessAddress.zipCode')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.businessAddress?.zipCode ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.businessAddress?.zipCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.businessAddress.zipCode.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Country *
                      </label>
                      <input
                        {...register('businessAddress.country')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.businessAddress?.country ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                        defaultValue="India"
                      />
                      {errors.businessAddress?.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.businessAddress.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Person */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FiUser className="text-primary" size={24} />
                    <h2 className="text-2xl font-heading font-bold text-secondary">
                      Contact Information
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Contact Person Name *
                    </label>
                    <input
                      {...register('contactPerson.name')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.contactPerson?.name ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.contactPerson?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactPerson.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('contactPerson.email')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.contactPerson?.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.contactPerson?.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.contactPerson.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Phone *
                      </label>
                      <input
                        {...register('contactPerson.phone')}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.contactPerson?.phone ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.contactPerson?.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.contactPerson.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Designation
                    </label>
                    <input
                      {...register('contactPerson.designation')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Purchasing Manager"
                    />
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Payment Terms */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FiCreditCard className="text-primary" size={24} />
                    <h2 className="text-2xl font-heading font-bold text-secondary">
                      Payment Terms & Credit
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Payment Terms *
                    </label>
                    <select
                      {...register('paymentTerms')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.paymentTerms ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="net15">Net 15 Days</option>
                      <option value="net30">Net 30 Days</option>
                      <option value="net45">Net 45 Days</option>
                      <option value="net60">Net 60 Days</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="prepaid">Prepaid</option>
                    </select>
                    {errors.paymentTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentTerms.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Requested Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      {...register('creditLimit', { valueAsNumber: true })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.creditLimit ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Credit limit will be reviewed and approved by admin
                    </p>
                    {errors.creditLimit && (
                      <p className="text-red-500 text-sm mt-1">{errors.creditLimit.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Your business account will be reviewed by our team.
                      You'll receive an email notification once your account is approved.
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Submit Application'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessAccountSetup;

