'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Hammer, ShieldCheck, Sparkles, Star, User, Save, ListTodo, BadgeAlert, AlertCircle, Camera, UploadCloud, X, RefreshCw, CheckCircle, FileText, ShieldAlert } from 'lucide-react';

export default function PassportSetupPage() {
  const router = useRouter();
  const authSupabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  
  // Passport states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [completedJobsCount, setCompletedJobsCount] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Government ID Card states
  const [idCardUrl, setIdCardUrl] = useState<string>('');
  const [idCardDragActive, setIdCardDragActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const compressImage = (dataUrl: string, maxDim = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function loadPassport() {
      try {
        const { data: { session } } = await authSupabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const userObj = session.user;
        setUserId(userObj.id);
        setUserName(userObj.user_metadata?.full_name || 'Artisan');

        // Fetch current passport from Supabase
        const { data: passport, error } = await authSupabase
          .from('bukie_passports')
          .select('*')
          .eq('user_id', userObj.id)
          .maybeSingle();

        if (!error && passport) {
          setBio(passport.bio || '');
          setSkills(passport.skills ? passport.skills.join(', ') : '');
          if (passport.avatar_url) {
            setPhotoUrl(passport.avatar_url);
          }
          if (passport.id_card_url) {
            setIdCardUrl(passport.id_card_url);
          }
          setIsVerified(passport.is_verified === true);
        }

        // Also check profiles table for avatar_url
        const { data: profile } = await authSupabase
          .from('profiles')
          .select('*')
          .eq('id', userObj.id)
          .maybeSingle();

        if (profile?.avatar_url) {
          setPhotoUrl(profile.avatar_url);
        } else if (userObj.user_metadata?.avatar_url) {
          setPhotoUrl(userObj.user_metadata.avatar_url);
        }

        // Count jobs where this user was selected as worker
        const { count, error: countErr } = await authSupabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('selected_worker_id', userObj.id);

        if (!countErr && count !== null) {
          setCompletedJobsCount(count);

          if (count > 0) {
            // Fetch jobs list securely to estimate ratings dynamically
            const { data: jobList, error: listErr } = await authSupabase
              .from('jobs')
              .select('*')
              .eq('selected_worker_id', userObj.id);

            if (!listErr && jobList && jobList.length > 0) {
              const jobsWithRatings = jobList.filter(
                (j) => j.rating !== undefined && j.rating !== null
              );
              if (jobsWithRatings.length > 0) {
                const sum = jobsWithRatings.reduce(
                  (acc, curr) => acc + Number(curr.rating),
                  0
                );
                setAvgRating(sum / jobsWithRatings.length);
              } else {
                setAvgRating(5.0); // 5.0 initial baseline average for stellar completions
              }
            } else {
              setAvgRating(5.0);
            }
          } else {
            setAvgRating(null);
          }
        } else {
          setCompletedJobsCount(0);
          setAvgRating(null);
        }
      } catch (err) {
        console.error('Error loading passport page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [authSupabase, router]);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Could not access your camera. Please upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCapture = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const compressed = await compressImage(dataUrl, 800);
        setPhotoUrl(compressed);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Please select an image smaller than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          const rawDataUrl = e.target.result as string;
          const compressed = await compressImage(rawDataUrl, 800);
          setPhotoUrl(compressed);
        } catch (err) {
          console.error('Error compressing profile photo:', err);
          setPhotoUrl(e.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleIdCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processIdCardFile(file);
    }
  };

  const processIdCardFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, JPEG) for identity verification.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Please select an identity image smaller than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          const rawDataUrl = e.target.result as string;
          // ID card needs slightly better resolution for legibility, compress with max 1080px dimension
          const compressed = await compressImage(rawDataUrl, 1080);
          setIdCardUrl(compressed);
        } catch (err) {
          console.error('Error compressing ID card:', err);
          setIdCardUrl(e.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIdCardDragActive(true);
    } else if (e.type === 'dragleave') {
      setIdCardDragActive(false);
    }
  };

  const handleIdCardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdCardDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIdCardFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage('');
    setErrorMsg('');

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await authSupabase
        .from('bukie_passports')
        .upsert({
          user_id: userId,
          bio,
          skills: skillsArray,
          avatar_url: photoUrl || null,
          id_card_url: idCardUrl || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw new Error(error.message);
      }

      // Try updating profiles table for schema consistency
      await authSupabase
        .from('profiles')
        .update({ avatar_url: photoUrl || null })
        .eq('id', userId);

      // Also set inside user metadata for robust auth syncing
      await authSupabase.auth.updateUser({
        data: { avatar_url: photoUrl || null }
      });

      setMessage('BukiePassport successfully initialized & updated!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update passport. Please check database permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-2">
          <Hammer className="w-8 h-8 animate-spin text-[#004D2C]" />
          <span className="text-xs font-mono text-gray-500 font-semibold uppercase">Loading BukiePassport Builder...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A192F] flex flex-col">
      {/* Navbar header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" id="passport-navbar">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <button
            id="passport-back-btn"
            type="button"
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-bold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            {isVerified ? (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                <span>Verified</span>
              </div>
            ) : idCardUrl ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-150 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono shadow-sm animate-pulse">
                <RefreshCw className="w-3 h-3 text-amber-650 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Pending Verification</span>
              </div>
            ) : null}

            {completedJobsCount === 0 || completedJobsCount === null ? (
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-gray-500 uppercase bg-gray-50 border border-gray-150 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-gray-400" />
                <span>No Ratings Yet (New)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#004D2C] uppercase bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-[#004D2C] text-[#004D2C]" />
                <span>Score: {avgRating !== null ? avgRating.toFixed(1) : '5.0'}</span>
              </div>
            )}
          </div>
        </div>
      </nav>
 
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8" id="passport-content">
        {/* Header summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 text-center relative overflow-hidden" id="passport-intro">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#004D2C]/5 rounded-full blur-xl"></div>
          
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-[#004D2C] mx-auto mb-4 border border-amber-100">
            <Hammer className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Build your profile. Get noticed.</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Employers want to know who they are hiring. A complete profile with your skills and experience helps you stand out and get hired faster.
          </p>
        </div>
 
        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" id="passport-form-container">
          <form onSubmit={handleSave} className="space-y-5" id="passport-setup-form">
            
            {/* Ratings & Completed Jobs Stats Section */}
            {completedJobsCount !== null && completedJobsCount > 0 ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex items-center justify-between shadow-sm mb-2 animate-fade-in" id="ratings-average-stats-section">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black font-mono text-amber-800 uppercase tracking-widest">
                    Your Track Record
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                      {avgRating !== null ? avgRating.toFixed(1) : '5.0'}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center text-amber-500 text-sm">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`w-4 h-4 ${idx < Math.round(avgRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-205'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold font-mono mt-0.5">
                        based on {completedJobsCount} completed {completedJobsCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 border border-amber-200 hover:border-amber-300 transition-all rounded-xl p-3 text-center min-w-24">
                  <span className="block text-[9px] font-bold text-gray-400 uppercase">Hired Count</span>
                  <span className="text-xl font-black text-[#0A192F] font-mono leading-none">{completedJobsCount}</span>
                </div>
              </div>
            ) : null}

            {/* Professional Profile Photo Section */}
            <div id="field-profile-picture" className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Professional Profile Picture
              </label>

              <div 
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                  dragActive ? 'border-[#0a192f] bg-blue-50/40' : 'border-gray-200 hover:border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {photoUrl ? (
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gray-100">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-all shadow-md cursor-pointer flex items-center justify-center"
                        title="Remove image"
                        id="remove-avatar-btn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Profile image loaded successfully
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-3">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <span className="text-xs font-bold text-gray-700">Drag and drop your image, or click to browse</span>
                    <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, JPEG up to 4MB</span>
                  </div>
                )}

                {/* Video elements if camera is live */}
                {isCameraActive && (
                  <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-sm bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl z-20">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video w-full border border-gray-700">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCapture}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                        id="capture-live-snap-btn"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Snap Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        id="cancel-live-cam-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="mt-3 text-[10px] text-red-600 font-medium bg-red-50 px-3 py-1 rounded-lg">
                    {cameraError}
                  </div>
                )}

                {/* Upload Action buttons */}
                {!isCameraActive && (
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <label 
                      htmlFor="avatar-file-input"
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      id="upload-file-label"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload File
                    </label>
                    <input 
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-[#0A192F] hover:bg-[#112a4f] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      id="trigger-live-camera-btn"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Use Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Government ID card verification field */}
            <div id="field-verification-document" className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-gray-150">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
                <div>
                  <label className="block text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                    Government ID Card Verification
                  </label>
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    For verifying professional identity and security compliance
                  </span>
                </div>
                {idCardUrl && !isVerified && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-[#004D2C] text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">
                    <RefreshCw className="w-3 h-3 text-[#004D2C] animate-spin" style={{ animationDuration: '4s' }} />
                    Pending Verification
                  </span>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                    ✓ Identity Verified
                  </span>
                )}
              </div>

              <div 
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-white ${
                  idCardDragActive ? 'border-[#0a192f] bg-blue-50/40' : 'border-gray-200 hover:border-gray-300'
                }`}
                onDragEnter={handleIdCardDrag}
                onDragLeave={handleIdCardDrag}
                onDragOver={handleIdCardDrag}
                onDrop={handleIdCardDrop}
              >
                {idCardUrl ? (
                  <div className="relative flex flex-col items-center gap-3 w-full">
                    <div className="relative w-full max-w-sm h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center group shadow-sm">
                      <img src={idCardUrl} alt="Government ID Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setIdCardUrl('');
                        }}
                        className="absolute top-2 right-2 bg-red-650 text-white p-1.5 rounded-full hover:bg-red-750 transition-all shadow-md cursor-pointer flex items-center justify-center"
                        title="Remove ID document"
                        id="remove-id-card-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-xs text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                        ✓ ID document loaded successfully
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Click &apos;Save my profile&apos; at the bottom to submit for review.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-12 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    <span className="text-xs font-bold text-gray-700">Drag & drop your Government ID image, or browse</span>
                    <span className="text-[10px] text-gray-400 mt-1">Supports national papers, license, or passport (PNG, JPG, max 4MB)</span>
                  </div>
                )}

                {/* Upload action controls */}
                {!idCardUrl && (
                  <div className="flex justify-center mt-4">
                    <label 
                      htmlFor="id-card-file-input"
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      id="upload-id-card-label"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Choose ID Image File
                    </label>
                    <input 
                      id="id-card-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIdCardFileSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bio info */}
            <div id="field-bio">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tell employers about yourself
              </label>
              <textarea
                id="bio-textarea"
                required
                rows={3}
                placeholder="e.g. I am a plumber with 4 years of experience in Surulere and Ikeja. I fix burst pipes, install toilets, and repair water heaters. I am reliable and available on short notice."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Skills array input */}
            <div id="field-skills">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>What can you do?</span>
                <span className="text-[10px] text-gray-400 capitalize normal-case font-medium">comma-separated</span>
              </label>
              <input
                id="skills-input"
                type="text"
                required
                placeholder="Plumbing, Leak Repair, Pipe Fitting, Water Installation"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            {/* Blue check prompt placeholder */}
            <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-gray-800 flex items-center gap-3" id="blue-check-badge-ad">
              <ShieldCheck className="w-10 h-10 text-[#4ADE80] shrink-0" />
              <div>
                <span className="block text-xs font-extrabold text-[#4ADE80] uppercase tracking-wider font-mono">Get verified. Earn the badge.</span>
                <span className="block text-[10px] text-gray-400 leading-normal mt-0.5">
                  Verified workers appear higher in search results and get more job offers. It costs ₦1,500 per year, and you can do it right after setting up your profile.
                </span>
              </div>
            </div>

            {/* Alert notices */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100" id="passport-error">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 bg-green-50 text-[#0A192F] p-3 rounded-xl text-xs border border-green-100" id="passport-message">
                <Sparkles className="w-4 h-4 text-[#004D2C] shrink-0 animate-pulse" />
                <span>{message}</span>
              </div>
            )}

            {/* Action buttons */}
            <button
              id="passport-save-btn"
              type="submit"
              disabled={saving}
              className="w-full bg-[#0A192F] text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#112a4f] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {saving ? (
                <span>Saving details...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save my profile</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
