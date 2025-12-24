import React from "react";

const AvatarGenerator = ({ firstName = "", lastName = "", size = 64, className = "" }) => {
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  const getBackgroundColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-red-500",
      "bg-yellow-500",
    ];
    
    const fullName = `${firstName}${lastName}`;
    const charCodeSum = fullName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const initials = getInitials();
  const bgColor = getBackgroundColor();

  return (
    <div
      className={`${bgColor} ${className} flex items-center justify-center text-white font-semibold rounded-full flex-shrink-0`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size / 2.5}px` }}
    >
      {initials}
    </div>
  );
};

export default AvatarGenerator;