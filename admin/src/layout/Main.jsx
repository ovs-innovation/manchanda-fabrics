import React from "react";

const Main = ({ children }) => {
  return (
    <main className="flex-1 min-h-0 overflow-y-auto admin-shell">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">{children}</div>
    </main>
  );
};

export default Main;
