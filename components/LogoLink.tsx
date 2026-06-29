'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { LogoBase64 } from '@/lib/logo';
import { motion } from 'framer-motion';

interface LogoLinkProps {
  className?: string; // Classes for the container (button)
  imageClassName?: string; // Classes for the Image component
  width?: number;
  height?: number;
  showText?: boolean;
}

export function LogoLink({
  className = "bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit hover:border-gray-200 transition-colors cursor-pointer",
  imageClassName = "rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]",
  width = 28,
  height = 28,
  showText = true,
}: LogoLinkProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!isSupabaseConfigured()) {
      router.push('/');
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onClick={handleClick} 
      className={className}
    >
      <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={width} height={height} className={imageClassName} />
      {showText && <span className="font-extrabold text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2">BukieBrainJobs</span>}
    </motion.button>
  );
}
