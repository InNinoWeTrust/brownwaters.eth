"use client";

import type React from "react";
import { useState } from "react";

type TooltipProps = {
  text: string;
};

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-blue-400 cursor-pointer">ⓘ</span>

      {visible && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-900 text-white text-xs rounded-md p-2 shadow-lg transition-opacity duration-300 opacity-100">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
