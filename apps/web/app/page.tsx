import React from 'react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-xl bg-white p-10 rounded-[32px] border border-slate-200 shadow-xl space-y-4">
        <h1 className="text-3xl font-extrabold text-[#001A41]">
          BukieBrainJobs Web App
        </h1>
        <p className="text-slate-600 text-sm">
          Codebase cleaned. Ready for fresh screen reconstruction per master design plan.
        </p>
      </div>
    </div>
  );
}
