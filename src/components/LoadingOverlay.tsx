import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm animate-fadeIn">
      <div className="relative mb-6">
        <div className="text-7xl sm:text-8xl animate-bounce duration-1000 transform hover:scale-110 transition-transform">
          🚀
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-red-500/50 rounded-full blur-md animate-pulse"></div>
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold mb-3 text-red-400">
        กำลังบันทึกข้อมูลเข้าสู่ระบบ กรุณารอสักครู่
      </h2>

      {/* Progress bar pulse */}
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-6 border border-gray-700">
        <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 animate-pulse w-full"></div>
      </div>
    </div>
  );
};
