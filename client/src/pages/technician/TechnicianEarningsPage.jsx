import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaRupeeSign, FaCalendarAlt, FaChartLine, FaWallet, FaUniversity, FaHistory, FaSpinner } from 'react-icons/fa';

// Reusable StatCard Component
const StatCard = ({ title, value, label, icon: Icon, color, gradient, isLoading }) => (
  <div className={`p-6 rounded-2xl border border-neutral-700/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300 relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
      <Icon className="text-8xl" />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-neutral-900/50 border border-neutral-700/50 text-${color}-400`}>
          <Icon className="text-2xl" />
        </div>
      </div>
      <h3 className="text-neutral-400 text-sm font-medium mb-1">{title}</h3>
      <div className={`text-3xl font-black text-${color}-400 mb-2`}>
        {isLoading ? <FaSpinner className="animate-spin text-xl" /> : value}
      </div>
      <p className="text-neutral-500 text-xs">{label}</p>
    </div>
  </div>
);

const TechnicianEarningsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const navigate = useNavigate();

  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const activeJobsCount = bookings.filter((b) => 
    ['assigned', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
  ).length;
  
  const totalEarnings = completedJobs.reduce(
    (sum, booking) => sum + (booking.price.final || 0),
    0
  );

  const menuItems = getMenuItemsByRole('technician', { activeJobs: activeJobsCount });

  // Calculate earnings by period
  const thisMonth = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });

  const thisWeek = completedJobs.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return bookingDate >= weekAgo;
  });

  const monthlyEarnings = thisMonth.reduce(
    (sum, b) => sum + (b.price.final || 0),
    0
  );
  const weeklyEarnings = thisWeek.reduce((sum, b) => sum + (b.price.final || 0), 0);

  return (
    <DashboardLayout title="Earnings & Payouts" menuItems={menuItems}>
      
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Earnings" 
          value={`₹${totalEarnings}`} 
          label="Lifetime Income" 
          icon={FaRupeeSign} 
          color="yellow" 
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="This Month" 
          value={`₹${monthlyEarnings}`} 
          label={`${thisMonth.length} jobs completed`} 
          icon={FaCalendarAlt} 
          color="blue" 
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="This Week" 
          value={`₹${weeklyEarnings}`} 
          label={`${thisWeek.length} jobs completed`} 
          icon={FaChartLine} 
          color="green" 
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
        <StatCard 
          title="Pending Payout" 
          value={`₹${user?.wallet?.balance || 0}`} 
          label="Available for withdrawal" 
          icon={FaWallet} 
          color="orange" 
          gradient="from-neutral-800 to-neutral-800/50"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Earnings History */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaHistory className="text-yellow-500" />
                Earnings Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700/50 text-left">
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Service</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="py-4 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Net Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700/30">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((booking) => {
                      const amount = booking.price.final || 0;
                      const commission = Math.round(amount * 0.1); // 10% commission
                      const earnings = amount - commission;

                      return (
                        <tr key={booking._id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-4 px-4 text-sm text-neutral-300">
                            {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4 text-sm text-white font-medium">
                            {booking.subServiceId?.name || booking.subService}
                          </td>
                          <td className="py-4 px-4 text-sm text-neutral-400">
                            {booking.customerId?.name || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm text-right text-neutral-300">
                            ₹{amount}
                          </td>
                          <td className="py-4 px-4 text-sm text-right font-bold text-yellow-500">
                            ₹{earnings}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-neutral-500">
                        No completed jobs found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet & Withdrawal */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Wallet Card */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl"></div>
             
             <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
               <FaWallet className="text-yellow-500" /> Wallet Balance
             </h3>
             <p className="text-neutral-400 text-sm mb-6">Available to withdraw</p>
             
             <div className="mb-8">
               <p className="text-4xl font-black text-white">₹{user?.wallet?.balance || 0}</p>
             </div>
             
             <Button className="w-full shadow-lg shadow-yellow-500/20">
               Withdraw Funds
             </Button>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <FaUniversity className="text-neutral-400" /> Bank Details
            </h3>
            
            <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-6 text-center">
               <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                 <FaUniversity className="text-neutral-500" />
               </div>
               <p className="text-neutral-300 font-medium mb-1">No Bank Account Linked</p>
               <p className="text-neutral-500 text-xs mb-4">Link your bank account to receive payouts.</p>
               <Button variant="outline" size="sm" className="border-neutral-700">
                 Link Account
               </Button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianEarningsPage;
