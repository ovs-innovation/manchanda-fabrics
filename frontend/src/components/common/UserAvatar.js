import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import { isUsableImageUrl } from "@utils/brandAssets";

/**
 * Robust UserAvatar component that safely renders user avatars.
 * - Filters out retired/broken Cloudinary domains immediately
 * - Uses referrerPolicy="no-referrer" for Google OAuth avatars
 * - Automatically falls back to styled initials or User icon on any load error
 */
const UserAvatar = ({
  user,
  className = "w-8 h-8 rounded-full",
  initialsClassName = "",
  iconSize = 16,
}) => {
  const [imgError, setImgError] = useState(false);

  const rawImage = user?.image;
  const isUsable = !imgError && isUsableImageUrl(rawImage);

  const initial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : null;

  if (isUsable) {
    return (
      <img
        src={rawImage}
        alt={user?.name || "User Avatar"}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${className} object-cover shadow-xs`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center font-bold select-none ${
        initialsClassName || "bg-[#9C6A5A]/15 text-[#9C6A5A] border border-[#9C6A5A]/30"
      }`}
    >
      {initial ? initial : <FiUser size={iconSize} />}
    </div>
  );
};

export default UserAvatar;
