import React from 'react';

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PlatformIcons: React.FC<PlatformIconProps> = ({ 
  platform, 
  className = "h-5 w-5", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  const iconClass = sizeClasses[size] || className;

  // Platform to image mapping using the properly named HD images
  const platformImages: Record<string, string> = {
    'LeetCode': '/src/assets/platform-icons/leetcode.png',
    'HackerRank': '/src/assets/platform-icons/hackerrank.jpg',
    'CodeChef': '/src/assets/platform-icons/codecheffinal.jpg',
    'Codeforces': '/src/assets/platform-icons/codeforces.jpg',
    'HackerEarth': '/src/assets/platform-icons/hackerearth.png',
    'GeeksforGeeks': '/src/assets/platform-icons/gfg.jpg',
    'GFG': '/src/assets/platform-icons/gfg.jpg', // Same as GeeksforGeeks
    'Codewars': '/src/assets/platform-icons/codewars.png',
    // Fallback to numbered images for platforms not in the logo folder
    'Kaggle': '/src/assets/platform-icons/IMG-20250920-WA0018.jpg',
    'GitHub': '/src/assets/platform-icons/IMG-20250920-WA0019.jpg',
    'AtCoder': '/src/assets/platform-icons/IMG-20250920-WA0022.jpg',
    'TopCoder': '/src/assets/platform-icons/IMG-20250920-WA0023.jpg',
    'SPOJ': '/src/assets/platform-icons/IMG-20250920-WA0024.jpg'
  };

  // Handle aliases
  const platformKey = platform === 'GFG' ? 'GeeksforGeeks' : platform;
  const imagePath = platformImages[platformKey];

  if (!imagePath) {
    // Fallback to a generic icon if platform not found
    return (
      <div className={`${iconClass} rounded bg-gray-200 flex items-center justify-center`}>
        <span className="text-xs font-medium text-gray-600">?</span>
      </div>
    );
  }

  return (
    <img 
      src={imagePath} 
      alt={`${platform} icon`}
      className={`${iconClass} object-cover rounded`}
      onError={(e) => {
        // Fallback if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = `${iconClass} rounded bg-gray-200 flex items-center justify-center`;
        fallback.innerHTML = '<span class="text-xs font-medium text-gray-600">?</span>';
        target.parentNode?.insertBefore(fallback, target);
      }}
    />
  );
};

export default PlatformIcons;