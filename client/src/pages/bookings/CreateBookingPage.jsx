import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategories,
  getSubServicesByCategory,
  clearSubServices,
} from '../../store/slices/serviceSlice';
import { createBooking, clearMessage, clearError } from '../../store/slices/bookingSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import Alert from '../../components/common/Alert';
import LocationPicker from '../../components/common/LocationPicker';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaArrowLeft, FaCheck, FaClipboardList, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaSpinner, FaRupeeSign, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { categories, subServices, isLoading: servicesLoading } = useSelector(
    (state) => state.services
  );
  const { isLoading: bookingLoading, error, message } = useSelector(
    (state) => state.bookings
  );
  const { user } = useSelector((state) => state.auth);

  const preSelectedSubService = location.state?.subService;

  const [formData, setFormData] = useState({
    categoryId: preSelectedSubService?.categoryId?._id || '',
    subServiceId: preSelectedSubService?._id || '',
    description: '',
    address: '',
    coordinates: [0, 0],
    scheduledDate: '',
    photos: [],
  });

  const [photoURLs, setPhotoURLs] = useState(['']);

  useEffect(() => {
    dispatch(getCategories({ active: true }));

    if (preSelectedSubService) {
      dispatch(
        getSubServicesByCategory({
          categoryId: preSelectedSubService.categoryId._id,
          params: { active: true },
        })
      );
    }
  }, [dispatch, preSelectedSubService]);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        navigate('/bookings/my-bookings');
        dispatch(clearMessage());
      }, 2000);
    }
  }, [message, navigate, dispatch]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      categoryId,
      subServiceId: '',
    });

    if (categoryId) {
      dispatch(getSubServicesByCategory({ categoryId, params: { active: true } }));
    } else {
      dispatch(clearSubServices());
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoURLChange = (index, value) => {
    const newPhotoURLs = [...photoURLs];
    newPhotoURLs[index] = value;
    setPhotoURLs(newPhotoURLs);

    const validURLs = newPhotoURLs.filter((url) => url.trim() !== '');
    setFormData({
      ...formData,
      photos: validURLs.map((url) => ({ url })),
    });
  };

  const addPhotoField = () => {
    if (photoURLs.length < 5) {
      setPhotoURLs([...photoURLs, '']);
    }
  };

  const removePhotoField = (index) => {
    const newPhotoURLs = photoURLs.filter((_, i) => i !== index);
    setPhotoURLs(newPhotoURLs.length > 0 ? newPhotoURLs : ['']);

    const validURLs = newPhotoURLs.filter((url) => url.trim() !== '');
    setFormData({
      ...formData,
      photos: validURLs.map((url) => ({ url })),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!formData.categoryId || !formData.subServiceId) {
      return;
    }

    // Validate scheduled date is not in the past
    if (formData.scheduledDate) {
      const scheduled = new Date(formData.scheduledDate);
      if (scheduled <= new Date()) {
        dispatch({ type: 'bookings/setError', payload: 'Scheduled date and time must be in the future.' });
        return;
      }
    }

    const bookingData = {
      categoryId: formData.categoryId,
      subServiceId: formData.subServiceId,
      description: formData.description,
      location: {
        address: formData.address,
        coordinates: formData.coordinates,
      },
      scheduledDate: formData.scheduledDate || null,
      photos: formData.photos,
    };

    dispatch(createBooking(bookingData));
  };

  const selectedSubService = subServices.find((s) => s._id === formData.subServiceId);
  const selectedCategory = categories.find((c) => c._id === formData.categoryId);

  return (
    <DashboardLayout title="New Booking" menuItems={getMenuItemsByRole(user?.role)}>
      <div className="w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        {message && (
          <Alert variant="success" className="mb-6">
            <div className="flex items-center gap-2">
              <FaCheck /> {message}
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <FaClipboardList className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Select Service</h3>
                <p className="text-neutral-500 text-sm">Choose a category and service</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  required
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Service</label>
                <select
                  name="subServiceId"
                  value={formData.subServiceId}
                  onChange={handleChange}
                  required
                  disabled={!formData.categoryId || servicesLoading}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{servicesLoading ? 'Loading...' : 'Select a service'}</option>
                  {subServices.map((subService) => (
                    <option key={subService._id} value={subService._id}>
                      {subService.name} - ₹{subService.priceRange.min}-{subService.priceRange.max}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Preview */}
              {selectedSubService && (
                <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 mt-4">
                  <p className="text-neutral-300 text-sm mb-3">{selectedSubService.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <FaRupeeSign className="text-xs" />
                      <span className="font-semibold">₹{selectedSubService.priceRange.min} - ₹{selectedSubService.priceRange.max}</span>
                    </div>
                    {selectedSubService.estimatedDuration && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <FaClock className="text-xs" />
                        <span>{selectedSubService.estimatedDuration.value} {selectedSubService.estimatedDuration.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Problem Description Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <FaClipboardList className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Describe the Issue</h3>
                <p className="text-neutral-500 text-sm">Help us understand your needs</p>
              </div>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe the problem or service you need..."
              className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
            />
          </div>

          {/* Location Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <FaMapMarkerAlt className="text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Service Location</h3>
                <p className="text-neutral-500 text-sm">Select your location on the map</p>
              </div>
            </div>
            <LocationPicker
              initialAddress={formData.address}
              onLocationSelect={(locationData) => {
                setFormData({
                  ...formData,
                  address: locationData.address,
                  coordinates: locationData.coordinates,
                });
              }}
            />
          </div>

          {/* Schedule Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FaCalendarAlt className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Preferred Date & Time</h3>
                <p className="text-neutral-500 text-sm">Optional - leave empty for ASAP</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Date</label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate?.split('T')[0] || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const time = formData.scheduledDate?.split('T')[1] || '09:00';
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value ? `${e.target.value}T${time}` : '',
                    });
                  }}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">Time</label>
                <input
                  type="time"
                  value={formData.scheduledDate?.split('T')[1] || ''}
                  onChange={(e) => {
                    const date = formData.scheduledDate?.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value ? `${date}T${e.target.value}` : formData.scheduledDate,
                    });
                  }}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
            {formData.scheduledDate && (() => {
              const scheduled = new Date(formData.scheduledDate);
              const isPast = scheduled <= new Date();
              return (
                <div className="mt-3 flex items-center justify-between">
                  <p className={`text-sm flex items-center gap-2 ${isPast ? 'text-red-400' : 'text-neutral-400'}`}>
                    {isPast && <FaExclamationTriangle className="shrink-0" />}
                    Scheduled for:{' '}
                    <span className={isPast ? 'text-red-300' : 'text-white'}>
                      {scheduled.toLocaleString()}
                    </span>
                    {isPast && <span className="text-red-400 font-medium">— this time has already passed!</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, scheduledDate: '' })}
                    className="text-red-400 text-sm hover:text-red-300 ml-4 shrink-0"
                  >
                    Clear
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Photos Card */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <FaCamera className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Photos</h3>
                <p className="text-neutral-500 text-sm">Optional - add up to 5 image URLs</p>
              </div>
            </div>
            <div className="space-y-2">
              {photoURLs.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={url}
                    onChange={(e) => handlePhotoURLChange(index, e.target.value)}
                    className="flex-1 bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                  />
                  {photoURLs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhotoField(index)}
                      className="px-3 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {photoURLs.length < 5 && (
                <button
                  type="button"
                  onClick={addPhotoField}
                  className="w-full py-2 text-sm text-neutral-400 hover:text-yellow-500 border border-dashed border-neutral-700 rounded-xl hover:border-yellow-500/50 transition-all"
                >
                  + Add Photo URL
                </button>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={bookingLoading}
              className="flex-1 py-3 border border-neutral-700 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading || !formData.categoryId || !formData.subServiceId || !formData.description || !formData.address}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Creating...
                </>
              ) : (
                'Create Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBookingPage;

