import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { ROLE_LABELS } from '../../constants/roles';
import { getMenuItemsByRole } from '../../utils/menuItems';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaKey, FaWallet, FaCamera } from 'react-icons/fa';

const FormGroup = ({ label, icon: Icon, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
      {Icon && <Icon className="text-yellow-500" />} {label}
    </label>
    {children}
  </div>
);

const StyledInput = ({ ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  />
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // TODO: Implement update profile API call
    setMessage('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // TODO: Implement change password API call
    setMessage('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };


  return (
    <DashboardLayout title="My Profile" menuItems={getMenuItemsByRole(user?.role)}>
      <div className="max-w-6xl mx-auto">
        {message && (
          <Alert variant="success" className="mb-6" onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError('')}>
                {error}
            </Alert>
        )}

        {/* Header Profile Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700/50">
           <div className="h-32 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-neutral-900"></div>
           <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12 gap-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border-4 border-neutral-900 flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-yellow-500">{user?.name?.charAt(0).toUpperCase()}</span>
                 </div>
                 <button className="absolute bottom-[-8px] right-[-8px] p-2 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-400 hover:text-white transition-colors">
                    <FaCamera className="text-sm" />
                 </button>
              </div>
              <div className="flex-1 mb-2">
                 <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
                 <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-sm flex items-center gap-1"><FaEnvelope className="text-xs" /> {user?.email}</span>
                    <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                    <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase">
                      {ROLE_LABELS[user?.role]}
                    </span>
                 </div>
              </div>
              <div className="mb-2">
                 {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                 ) : (
                    <div className="flex gap-2">
                       <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                       <Button onClick={handleUpdateProfile}>Save Changes</Button>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <FaUser className="text-yellow-500" /> Personal Information
               </h3>
               
               <form onSubmit={handleUpdateProfile}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormGroup label="Full Name" icon={FaUser}>
                     <StyledInput 
                       name="name" 
                       value={formData.name} 
                       onChange={handleChange} 
                       disabled={!isEditing} 
                     />
                   </FormGroup>

                   <FormGroup label="Email Address" icon={FaEnvelope}>
                     <StyledInput 
                       type="email"
                       name="email" 
                       value={formData.email} 
                       onChange={handleChange} 
                       disabled={!isEditing} 
                     />
                   </FormGroup>

                   <FormGroup label="Phone Number" icon={FaPhone}>
                     <StyledInput 
                       type="tel"
                       name="phone" 
                       value={formData.phone} 
                       onChange={handleChange} 
                       disabled={!isEditing} 
                     />
                   </FormGroup>

                   <FormGroup label="Address" icon={FaMapMarkerAlt}>
                     <textarea
                       name="address"
                       value={formData.address}
                       onChange={handleChange}
                       disabled={!isEditing}
                       rows="1"
                       className={`w-full px-4 py-3 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                     />
                   </FormGroup>
                 </div>
               </form>
            </div>
            
             {/* Security Section */}
             <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <FaShieldAlt className="text-red-500" /> Security
                </h3>
                 <form onSubmit={handleUpdatePassword}>
                    <div className="space-y-4 max-w-lg">
                       <FormGroup label="Current Password" icon={FaKey}>
                          <StyledInput 
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                          />
                       </FormGroup>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormGroup label="New Password">
                             <StyledInput 
                               type="password"
                               name="newPassword"
                               value={passwordData.newPassword}
                               onChange={handlePasswordChange}
                               placeholder="Min. 6 characters"
                             />
                          </FormGroup>
                          <FormGroup label="Confirm New Password">
                             <StyledInput 
                               type="password"
                               name="confirmPassword"
                               value={passwordData.confirmPassword}
                               onChange={handlePasswordChange}
                               placeholder="Same as new"
                             />
                          </FormGroup>
                       </div>
                       
                       <div className="pt-2">
                          <Button type="submit" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                             Update Password
                          </Button>
                       </div>
                    </div>
                 </form>
             </div>
          </div>

          {/* Right Column: Wallet Summary */}
          <div className="lg:col-span-1">
             <div className="rounded-2xl border border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm p-8 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <FaWallet className="text-green-500" /> Wallet Overview
                </h3>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 mb-6">
                   <p className="text-neutral-400 text-sm mb-1">Current Balance</p>
                   <p className="text-3xl font-black text-white mb-4">₹{user?.wallet?.balance || 0}</p>
                   <div className="flex gap-2">
                      <Button className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">Add Money</Button>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-neutral-700/50">
                      <span className="text-neutral-400 text-sm">Wallet ID</span>
                      <span className="text-white font-mono text-sm">{user?.wallet?.walletId || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-neutral-700/50">
                      <span className="text-neutral-400 text-sm">Status</span>
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">ACTIVE</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
