import React from 'react';

const UserAvatar = ({ user, className = "h-9 w-9 text-sm" }) => {
  if (!user) return null;

  // Check if profile image is missing or is the default Cloudinary/placeholder image
  const isDefaultImage = !user.profileImage || 
    user.profileImage.includes('sample.jpg') || 
    user.profileImage.includes('placeholder') || 
    user.profileImage.includes('default');
  
  if (!isDefaultImage) {
    return (
      <img
        className={`${className} rounded-full object-cover border border-slate-200 dark:border-slate-700`}
        src={user.profileImage}
        alt={user.name}
      />
    );
  }

  const name = user.name || 'User';
  const firstLetter = name.charAt(0).toUpperCase();

  // Consistent background color based on name hashing for a premium aesthetic
  const colors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    'bg-gradient-to-br from-purple-500 to-pink-600 text-white',
    'bg-gradient-to-br from-pink-500 to-rose-600 text-white',
    'bg-gradient-to-br from-teal-500 to-emerald-600 text-white',
    'bg-gradient-to-br from-orange-500 to-red-600 text-white',
    'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
    'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
  ];
  
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  return (
    <div 
      className={`${className} rounded-full flex items-center justify-center font-bold uppercase tracking-wider ${colorClass} border border-white/10 shadow-sm`}
      title={name}
    >
      {firstLetter}
    </div>
  );
};

export default UserAvatar;
