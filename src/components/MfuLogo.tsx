import React from 'react';
import mfuLogoOfficial from '../assets/mfu_logo_official.png';

export const MfuLogo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <img
      src={mfuLogoOfficial}
      alt="ตรามหาวิทยาลัยแม่ฟ้าหลวง"
      className={`${className} object-contain`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://drive.google.com/thumbnail?id=1JuhBAAEeBrRfiNmDK8l3SoiLbpqPvUWW&sz=w800";
      }}
    />
  );
};

