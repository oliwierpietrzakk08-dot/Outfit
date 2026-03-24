import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-baseline gap-0.5">
        <span className="text-4xl font-black tracking-tighter leading-none italic">O</span>
        <span className="text-4xl font-light tracking-tighter leading-none -ml-1 uppercase">ut</span>
      </div>
      <div className="h-[2px] w-full bg-black"></div>
      <span className="text-[10px] uppercase font-bold tracking-[0.3em] mt-1 pl-1">Fit Builder</span>
    </div>
  );
};

export default Logo;
