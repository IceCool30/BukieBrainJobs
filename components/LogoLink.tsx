'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { LogoBase64 } from '@/lib/logo';

interface LogoLinkProps {
  className?: string; // Classes for the container (button)
  imageClassName?: string; // Classes for the Image component
  width?: number;
  height?: number;
  showText?: boolean;
}

export function LogoLink({
  className = "bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit hover:border-gray-200 transition-colors",
  imageClassName = "rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]",
  width = 28,
  height = 28,
  showText = true,
}: LogoLinkProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const confirmLogout = window.confirm("Are you sure you want to log out and return to the homepage?");
      if (confirmLogout) {
        await supabase.auth.signOut();
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={width} height={height} className={imageClassName} />
      {showText && <span className="font-extrabold text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2">BukieBrainJobs</span>}
    </button>
  );
}
