import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableBookings, requestBooking } from '../../store/slices/bookingSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import BookingCard from '../../components/bookings/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaToolbox } from 'react-icons/fa';

const AvailableJobsPage = () => {
  const dispatch = useDispatch();
  const { availableBookings, isLoading } = useSelector((state) => state.bookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch available bookings on mount
  useEffect(() => {
    dispatch(getAvailableBookings({ limit: 50 })); 
  }, [dispatch]);

  const handleRequestJob = async (id) => {
    try {
        await dispatch(requestBooking(id)).unwrap();
        toast.success('Job requested! Waiting for admin approval.');
    } catch (error) {
        toast.error('Failed to request job: ' + error);
    }
  };

  const filteredBookings = availableBookings.filter((booking) => {
    const matchesSearch = 
      booking.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.subServiceId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || booking.categoryId?._id === categoryFilter || booking.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = [...new Set(availableBookings.map(b => b.categoryId))].filter(Boolean);

  const menuItems = getMenuItemsByRole('technician');

  return (
    <DashboardLayout title="Available Jobs Marketplace" menuItems={menuItems}>
      {/* Header & Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by location, service, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all backdrop-blur-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <button
              onClick={() => setCategoryFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === ''
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoryFilter(cat._id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  categoryFilter === cat._id
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="relative group flex flex-col h-full bg-neutral-900/40 border border-neutral-700/30 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
                <BookingCard booking={booking} />
                
                {/* Overlay Action */}
                <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6 z-10 transition-all duration-300">
                   <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white mb-2">{booking.subServiceId?.name}</h4>
                      <p className="text-neutral-400 mb-6 max-w-xs mx-auto line-clamp-2">{booking.description}</p>
                      <Button onClick={() => handleRequestJob(booking._id)} className="w-full max-w-[200px] shadow-xl shadow-yellow-500/20">
                        Request This Job
                      </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 bg-neutral-900/20 rounded-2xl border border-neutral-800 border-dashed">
            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
              <FaToolbox className="text-4xl opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-neutral-400 mb-2">No Jobs Found</h3>
            <p className="text-sm">Try adjusting your search or filters, or check back later.</p>
            <Button variant="outline" className="mt-6" onClick={() => dispatch(getAvailableBookings({ limit: 50 }))}>
              Refresh List
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailableJobsPage;
