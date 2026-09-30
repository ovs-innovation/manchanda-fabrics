import React from "react";

const Loading = ({ loading, fullScreen = false, text = "LOADING..." }) => {
  if (!loading) return null;

  const shell = (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen
          ? "fixed inset-0 z-[9998] bg-[#FAF7F5]/95 backdrop-blur-sm"
          : "min-h-[40vh] w-full py-16 bg-[#FAF7F5]"
      }`}
    >
      <img
        src="/logo/logo.png"
        alt="Manchanda Fabrics"
        width={100}
        height={40}
        className="h-10 w-auto object-contain opacity-85 animate-pulse"
      />
      <div className="mt-3.5 h-0.5 w-20 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full w-1/2 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-[#9C6A5A]" />
      </div>
      {text && (
        <span className="mt-3 text-[11px] font-semibold tracking-[0.28em] text-[#9C6A5A] uppercase animate-pulse select-none">
          {text}
        </span>
      )}
    </div>
  );

  return (
    <>
      {shell}
      <style jsx global>{`
        @keyframes loadbar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </>
  );
};

export default Loading;
