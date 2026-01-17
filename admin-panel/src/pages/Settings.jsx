import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { Save, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import settingsService from '../services/settingsService';
import { useState } from 'react';
import seedService from '../services/seedService';

const schema = yup.object().shape({
  storeName: yup.string().required('Store name is required'),
  storeEmail: yup.string().email('Invalid email').required('Store email is required'),
  storePhone: yup.string(),
  storeAddress: yup.string(),
  facebook: yup.string().url('Invalid URL'),
  instagram: yup.string().url('Invalid URL'),
  twitter: yup.string().url('Invalid URL'),
  homepageTitle: yup.string(),
  homepageSubtitle: yup.string(),
  footerText: yup.string(),
  b2b: yup
    .object({
      requireLoginForInquiry: yup.boolean(),
    })
    .default(undefined),
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.success) {
        reset(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const response = await settingsService.updateSettings(data);
      if (response.success) {
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedCatalog = async () => {
    try {
      setSeeding(true);
      const response = await seedService.seedCatalog();
      const message = response?.message || 'Sample catalog synced';
      toast.success(message);
    } catch (error) {
      console.error('Error seeding catalog:', error);
      toast.error(error.response?.data?.message || 'Failed to sync catalog data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store settings and configuration</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                {...register('storeName')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="StepSeva"
              />
              {errors.storeName && (
                <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Email *
                </label>
                <input
                  {...register('storeEmail')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  placeholder="contact@stepseva.com"
                />
                {errors.storeEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.storeEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Phone
                </label>
                <input
                  {...register('storePhone')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Address
              </label>
              <textarea
                {...register('storeAddress')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="123 Main Street, City, State, ZIP"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                {...register('facebook')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="https://facebook.com/eclora"
              />
              {errors.facebook && (
                <p className="mt-1 text-sm text-red-600">{errors.facebook.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                {...register('instagram')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="https://instagram.com/eclora"
              />
              {errors.instagram && (
                <p className="mt-1 text-sm text-red-600">{errors.instagram.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter URL
              </label>
              <input
                {...register('twitter')}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="https://twitter.com/eclora"
              />
              {errors.twitter && (
                <p className="mt-1 text-sm text-red-600">{errors.twitter.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Homepage Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Homepage Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Homepage Title
              </label>
              <input
                {...register('homepageTitle')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="Welcome to StepSeva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Homepage Subtitle
              </label>
              <textarea
                {...register('homepageSubtitle')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="Discover our premium handmade candles, bouquets, and curated gifts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <textarea
                {...register('footerText')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                placeholder="© 2024 StepSeva. All rights reserved."
              />
            </div>
          </div>
        </div>

        {/* B2B Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">B2B Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                {...register('b2b.requireLoginForInquiry')}
                type="checkbox"
                className="w-4 h-4 text-lavender-600 border-gray-300 rounded focus:ring-lavender-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Require login for inquiries</p>
                <p className="text-xs text-gray-500">
                  When enabled, buyers must login before submitting an inquiry or requesting a quote.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon={<Save size={20} />} size="lg">
            Save Settings
          </Button>
        </div>
      </form>

      {/* Demo Catalog Seeder */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-dashed border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Demo Catalog Content</h2>
            <p className="text-gray-600 mt-1 max-w-2xl">
              Need sample categories and products (candles, bouquets, custom gifting, hijabi essentials) on your storefront?
              Seed the database with curated demo content using the button below. This action is safe to run multiple times.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            icon={<Database size={18} />}
            loading={seeding}
            onClick={handleSeedCatalog}
          >
            Seed Catalog Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

