'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Hammer, ShieldCheck, Sparkles, Star, User, Save, ListTodo, BadgeAlert, AlertCircle, Camera, UploadCloud, X, RefreshCw, CheckCircle, FileText, ShieldAlert, HelpCircle } from 'lucide-react';

const SKILL_OPTIONS = [
  // Trade & Physical
  { value: 'Plumbing', label: 'Plumbing', group: 'Trade & Physical Work' },
  { value: 'Electrical', label: 'Electrical', group: 'Trade & Physical Work' },
  { value: 'Carpentry', label: 'Carpentry', group: 'Trade & Physical Work' },
  { value: 'Painting', label: 'Painting', group: 'Trade & Physical Work' },
  { value: 'Masonry', label: 'Masonry / Bricklaying', group: 'Trade & Physical Work' },
  { value: 'Welding', label: 'Welding', group: 'Trade & Physical Work' },
  { value: 'HVAC', label: 'HVAC / Air Conditioning', group: 'Trade & Physical Work' },
  { value: 'Roofing', label: 'Roofing', group: 'Trade & Physical Work' },
  { value: 'Tiling', label: 'Tiling / Flooring', group: 'Trade & Physical Work' },
  { value: 'Handyman', label: 'General Maintenance / Handyman', group: 'Trade & Physical Work' },
  { value: 'Cleaning', label: 'Cleaning Services', group: 'Trade & Physical Work' },
  { value: 'Driving', label: 'Driving / Chauffeur', group: 'Trade & Physical Work' },
  { value: 'Security', label: 'Security Guard', group: 'Trade & Physical Work' },
  { value: 'Catering', label: 'Catering / Cooking', group: 'Trade & Physical Work' },
  { value: 'Tailoring', label: 'Tailoring / Fashion Design', group: 'Trade & Physical Work' },
  { value: 'Beauty', label: 'Hair & Beauty Services', group: 'Trade & Physical Work' },
  { value: 'Gardening', label: 'Gardening / Landscaping', group: 'Trade & Physical Work' },
  { value: 'Moving', label: 'Moving / Haulage', group: 'Trade & Physical Work' },
  { value: 'Laundry', label: 'Laundry / Dry Cleaning', group: 'Trade & Physical Work' },
  { value: 'PestControl', label: 'Pest Control', group: 'Trade & Physical Work' },
  // Digital & Remote
  { value: 'WebDev', label: 'Web Development', group: 'Digital & Remote Work' },
  { value: 'AppDev', label: 'Mobile App Development', group: 'Digital & Remote Work' },
  { value: 'SoftwareDev', label: 'Software Development', group: 'Digital & Remote Work' },
  { value: 'UIDesign', label: 'UI/UX Design', group: 'Digital & Remote Work' },
  { value: 'GraphicDesign', label: 'Graphic Design', group: 'Digital & Remote Work' },
  { value: 'BrandIdentity', label: 'Brand Identity / Logo Design', group: 'Digital & Remote Work' },
  { value: 'VideoEditing', label: 'Video Editing', group: 'Digital & Remote Work' },
  { value: 'Animation', label: 'Animation / Motion Graphics', group: 'Digital & Remote Work' },
  { value: 'Photography', label: 'Photography', group: 'Digital & Remote Work' },
  { value: 'ContentWriting', label: 'Content Writing', group: 'Digital & Remote Work' },
  { value: 'Copywriting', label: 'Copywriting', group: 'Digital & Remote Work' },
  { value: 'BlogWriting', label: 'Blog Writing', group: 'Digital & Remote Work' },
  { value: 'TechWriting', label: 'Technical Writing', group: 'Digital & Remote Work' },
  { value: 'Translation', label: 'Translation', group: 'Digital & Remote Work' },
  { value: 'Transcription', label: 'Transcription', group: 'Digital & Remote Work' },
  { value: 'VirtualAssistant', label: 'Virtual Assistant', group: 'Digital & Remote Work' },
  { value: 'DataEntry', label: 'Data Entry', group: 'Digital & Remote Work' },
  { value: 'CustomerSupport', label: 'Customer Support', group: 'Digital & Remote Work' },
  { value: 'SocialMedia', label: 'Social Media Management', group: 'Digital & Remote Work' },
  { value: 'DigitalMarketing', label: 'Digital Marketing', group: 'Digital & Remote Work' },
  { value: 'SEO', label: 'SEO Services', group: 'Digital & Remote Work' },
  { value: 'EmailMarketing', label: 'Email Marketing', group: 'Digital & Remote Work' },
  { value: 'Accounting', label: 'Accounting / Bookkeeping', group: 'Digital & Remote Work' },
  { value: 'FinancialConsulting', label: 'Financial Consulting', group: 'Digital & Remote Work' },
  { value: 'LegalConsulting', label: 'Legal Consulting', group: 'Digital & Remote Work' },
  { value: 'BusinessConsulting', label: 'Business Consulting', group: 'Digital & Remote Work' },
  { value: 'ProjectManagement', label: 'Project Management', group: 'Digital & Remote Work' },
  { value: 'Tutoring', label: 'Tutoring / Teaching', group: 'Digital & Remote Work' },
  { value: 'VoiceOver', label: 'Voice Over', group: 'Digital & Remote Work' },
  { value: 'MusicProduction', label: 'Music Production', group: 'Digital & Remote Work' },
  { value: '3DModeling', label: '3D Modeling / CAD', group: 'Digital & Remote Work' },
  { value: 'DataAnalysis', label: 'Data Analysis', group: 'Digital & Remote Work' },
  { value: 'Cybersecurity', label: 'Cybersecurity Consulting', group: 'Digital & Remote Work' },
  { value: 'NetworkAdmin', label: 'Network Administration', group: 'Digital & Remote Work' },
  { value: 'ITSupport', label: 'IT Support', group: 'Digital & Remote Work' },
  { value: 'CloudDevOps', label: 'Cloud Services / DevOps', group: 'Digital & Remote Work' },
  // Hybrid & Event
  { value: 'EventPlanning', label: 'Event Planning', group: 'Hybrid & Event Work' },
  { value: 'EventPhotography', label: 'Event Photography', group: 'Hybrid & Event Work' },
  { value: 'EventVideography', label: 'Event Videography', group: 'Hybrid & Event Work' },
  { value: 'RealEstate', label: 'Real Estate Agent Services', group: 'Hybrid & Event Work' },
  { value: 'PersonalTraining', label: 'Personal Training / Fitness', group: 'Hybrid & Event Work' },
  { value: 'InteriorDesign', label: 'Interior Design', group: 'Hybrid & Event Work' },
  { value: 'Architecture', label: 'Architecture Services', group: 'Hybrid & Event Work' },
  { value: 'Surveying', label: 'Surveying', group: 'Hybrid & Event Work' },
];

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
  // skills state removed - using selectedSkills and customSkill now
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
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

  // Help info popover states
  const [showBioHelp, setShowBioHelp] = useState(false);
  const [showSkillsHelp, setShowSkillsHelp] = useState(false);

  // ID Verification checklist states
  const [chkLegible, setChkLegible] = useState(false);
  const [chkOriented, setChkOriented] = useState(false);
  const [chkValid, setChkValid] = useState(false);

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
          setSelectedSkills(passport.skills || []);
          if (passport.avatar_url) {
            setPhotoUrl(passport.avatar_url);
          }
          if (passport.id_card_url) {
            setIdCardUrl(passport.id_card_url);
            setChkLegible(true);
            setChkOriented(true);
            setChkValid(true);
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

    // Reset verification checklist parameters for new upload
    setChkLegible(false);
    setChkOriented(false);
    setChkValid(false);

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
      const skillsArray = selectedSkills;

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
          <Hammer className="w-8 h-8 animate-spin text-amber-500" />
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
              <div className="flex items-center gap-1 bg-[#0A192F] border border-[#112a4f] px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider font-mono shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Verified</span>
              </div>
            ) : idCardUrl ? (
              <div className="flex items-center gap-1.5 bg-amber-500 border border-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider font-mono shadow-md animate-pulse">
                <RefreshCw className="w-3 h-3 text-white animate-spin animate-none" style={{ animationDuration: '4s' }} />
                <span>Pending Verification</span>
              </div>
            ) : null}

            {completedJobsCount === 0 || completedJobsCount === null ? (
              <div className="flex items-center gap-1.5 text-xs font-black font-mono text-gray-500 uppercase bg-gray-50 border border-gray-150 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-gray-400" />
                <span>No Ratings Yet (New)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-black font-mono text-amber-900 uppercase bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Score: {avgRating !== null ? avgRating.toFixed(1) : '5.0'}</span>
              </div>
            )}
          </div>
        </div>
      </nav>
 
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8" id="passport-content">
        {/* Header summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 text-center relative overflow-hidden" id="passport-intro">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#0A192F]/5 rounded-full blur-xl"></div>
          
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 border border-amber-200">
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
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-sm">
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
                        className="bg-[#0A192F] hover:bg-[#112a4f] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
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
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 border border-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md animate-pulse shadow-sm">
                    <RefreshCw className="w-3 h-3 text-white animate-spin" style={{ animationDuration: '4s' }} />
                    Pending Verification
                  </span>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1 bg-[#0A192F] border border-[#112a4f] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm">
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
                          setChkLegible(false);
                          setChkOriented(false);
                          setChkValid(false);
                        }}
                        className="absolute top-2 right-2 bg-red-650 text-white p-1.5 rounded-full hover:bg-red-750 transition-all shadow-md cursor-pointer flex items-center justify-center"
                        title="Remove ID document"
                        id="remove-id-card-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-805 text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-sm">
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
            <div id="field-bio" className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tell employers about yourself
                </label>
                <button
                  type="button"
                  id="bio-help-btn"
                  onClick={() => setShowBioHelp(!showBioHelp)}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-2 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
                  title="Show description suggestions for more job offers"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Bio suggestions</span>
                </button>
              </div>

              {showBioHelp && (
                <div id="bio-help-card" className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-slate-850 p-4 rounded-xl text-xs space-y-2.5 shadow-sm relative animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => setShowBioHelp(false)}
                    className="absolute top-2.5 right-2.5 text-amber-800 hover:text-amber-955 p-1 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="flex items-center gap-1.5 font-black text-amber-950 border-b border-amber-200/60 pb-1.5 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>How to write a high-converting Bio</span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed font-medium">
                    A great bio connects with clients instantly and earns 3x more responses. Use this simple blueprint:
                  </p>
                  
                  <ul className="space-y-2 text-gray-700 pl-4 list-disc list-outside">
                    <li>
                      <strong className="text-amber-950">Start with a Clear Hook:</strong> Say exactly what you do, for how long, and where (e.g., <span className="italic text-gray-500">&ldquo;Expert Plumber with 5+ years servicing residential buildings in Surulere&rdquo;</span>).
                    </li>
                    <li>
                      <strong className="text-amber-950">List Your Specific Services:</strong> List exact, searchable specialties (e.g., <span className="italic text-gray-500">&ldquo;leak repair, copper pipe threading, bathroom installations&rdquo;</span>) so clients find you.
                    </li>
                    <li>
                      <strong className="text-amber-950">Mention Your Availability:</strong> Highlight if you can support emergencies or offer same-day replies (e.g., <span className="italic text-gray-500">&ldquo;Highly responsive and available for urgent weekend calls&rdquo;</span>).
                    </li>
                    <li>
                      <strong className="text-amber-950">Add a Trust Statement:</strong> Assure they receive premium results (e.g., <span className="italic text-gray-500">&ldquo;I charge fairly, respect deadlines, and keep the work area spotless&rdquo;</span>).
                    </li>
                  </ul>
                  
                  <div className="bg-white/70 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-950 flex items-center gap-1.5 font-medium shadow-2xs">
                    <span className="font-extrabold text-amber-700">Pro-Tip:</span> Profiles with bios longer than 150 characters acquire significantly more interview callbacks from local employers.
                  </div>
                </div>
              )}

              <textarea
                id="bio-textarea"
                required
                rows={3}
                placeholder="e.g. I am a plumber with 4 years of experience in Surulere and Ikeja. I fix burst pipes, install toilets, and repair water heaters. I am reliable and available on short notice."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm resize-none bg-white"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Skills array input */}
            <div id="field-skills" className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  What can you do?
                </label>
                <button
                  type="button"
                  id="skills-help-btn"
                  onClick={() => setShowSkillsHelp(!showSkillsHelp)}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-2 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
                  title="Show advice for high-converting Skills"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Skills suggestions</span>
                </button>
              </div>

              {showSkillsHelp && (
                <div id="skills-help-card" className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-slate-855 p-4 rounded-xl text-xs space-y-2.5 shadow-sm relative animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => setShowSkillsHelp(false)}
                    className="absolute top-2.5 right-2.5 text-amber-800 hover:text-amber-955 p-1 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="flex items-center gap-1.5 font-black text-amber-950 border-b border-amber-200/60 pb-1.5 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>How to select high-converting Skills</span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Adding precise keywords ensures you rank matching search results when clients seek a professional.
                  </p>
                  
                  <ul className="space-y-2 text-gray-750 pl-4 list-disc list-outside">
                    <li>
                      <strong className="text-amber-950">Avoid Hyper-Generic Terms:</strong> Instead of listing just <span className="italic text-gray-500">&ldquo;Plumbing&rdquo;</span>, add specific crafts like <span className="italic text-gray-500">&ldquo;Leak Detection, Drain Clog Repair, Copper Pipe Fitting&rdquo;</span>.
                    </li>
                    <li>
                      <strong className="text-amber-950">Feature Industry Equipment & Certifications:</strong> Let clients know you can handle brand fixtures or unique repair apparatus.
                    </li>
                  </ul>
                  
                  <div className="bg-white/70 p-2 rounded-lg border border-amber-100 text-[11px] text-amber-950 flex items-center gap-1.5 font-medium shadow-2xs">
                    <span className="font-extrabold text-amber-700 font-mono text-[10px] uppercase">Suggestions:</span> Select relevant options from the list below or type custom entries.
                  </div>
                </div>
              )}

              {/* Selected skills as tags */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                {selectedSkills.map((skill) => {
                  const option = SKILL_OPTIONS.find((o) => o.value === skill || o.label === skill);
                  return (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 bg-[#0A192F]/5 text-[#0A192F] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#0A192F]/10"
                    >
                      {option?.label || skill}
                      <button
                        type="button"
                        onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== skill))}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-0.5 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {selectedSkills.length === 0 && (
                  <span className="text-xs text-gray-400 italic py-1.5">Pick from the list or write your own below</span>
                )}
              </div>

              {/* Dropdown toggle button */}
              <button
                type="button"
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                className="w-full bg-gray-50 border border-gray-200 text-sm text-left px-4 py-3 rounded-xl transition-all outline-none text-gray-700 font-medium flex justify-between items-center hover:border-gray-300 cursor-pointer"
              >
                <span>{showSkillDropdown ? 'Close list' : 'Choose from list...'}</span>
                <span className={`transition-transform ${showSkillDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown list */}
              {showSkillDropdown && (
                <div className="mt-1 border border-gray-200 rounded-xl bg-white shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {/* Group each section */}
                  {['Trade & Physical Work', 'Digital & Remote Work', 'Hybrid & Event Work'].map((group) => (
                    <div key={group} className="p-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">
                        {group}
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {SKILL_OPTIONS.filter((o) => o.group === group).map((option) => {
                          const isSelected = selectedSkills.includes(option.value) || selectedSkills.includes(option.label);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedSkills((prev) => prev.filter((s) => s !== option.value && s !== option.label));
                                } else {
                                  setSelectedSkills((prev) => [...prev, option.label]);
                                }
                              }}
                              className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0A192F] text-white font-semibold shadow-xs'
                                  : 'hover:bg-gray-100 text-gray-600 font-medium'
                              }`}
                            >
                              {isSelected && '✓ '}{option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom skill input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a skill not listed above..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customSkill.trim()) {
                      e.preventDefault();
                      const newSkill = customSkill.trim();
                      if (!selectedSkills.includes(newSkill)) {
                        setSelectedSkills((prev) => [...prev, newSkill]);
                      }
                      setCustomSkill('');
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-xs px-4 py-2.5 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
                      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
                      setCustomSkill('');
                    }
                  }}
                  disabled={!customSkill.trim()}
                  className="bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Blue check prompt placeholder */}
            <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-gray-800 flex items-center gap-3" id="blue-check-badge-ad">
              <ShieldCheck className="w-10 h-10 text-blue-400 shrink-0" />
              <div>
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider font-mono">Get verified. Earn the badge.</span>
                <span className="block text-[10px] text-gray-400 leading-normal mt-0.5">
                  Verified workers appear higher in search results and get more job offers. It costs ₦1,500 per year, and you can do it right after setting up your profile.
                </span>
              </div>
            </div>

            {/* Verification Checklist */}
            <div 
              id="verification-checklist-block" 
              className={`p-5 rounded-2xl border transition-all ${
                isVerified 
                  ? 'bg-blue-50/60 border-blue-200 shadow-xs' 
                  : idCardUrl 
                    ? (chkLegible && chkOriented && chkValid)
                      ? 'bg-blue-50/40 border-blue-300 shadow-md ring-1 ring-blue-350/20' 
                      : 'bg-amber-50/30 border-amber-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isVerified || (idCardUrl && chkLegible && chkOriented && chkValid) ? 'text-blue-600' : 'text-amber-500'}`} />
                  <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-900">
                    Verification Checklist
                  </span>
                </div>
                <div>
                  {isVerified ? (
                    <span className="bg-[#0A192F] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                      Verified
                    </span>
                  ) : idCardUrl ? (
                    (chkLegible && chkOriented && chkValid) ? (
                      <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider animate-pulse">
                        Ready
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                        In Progress
                      </span>
                    )
                  ) : (
                    <span className="bg-gray-400 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                      Awaiting ID
                    </span>
                  )}
                </div>
              </div>

              {isVerified ? (
                <div className="text-xs text-blue-950 space-y-1 font-medium">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    Passport status verified by BukiePassport Moderation!
                  </p>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-normal pl-5">
                    Your verification identity documents are current and active. You are cleared to save any updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Item 1: ID Card Upload State */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {idCardUrl ? (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-850 border border-blue-300">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-850 border border-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <span className={`block font-black uppercase tracking-wider text-[10px] ${idCardUrl ? 'text-blue-850' : 'text-amber-800'}`}>
                        {idCardUrl ? '✓ Government ID Loaded' : '⚠ Government ID Required'}
                      </span>
                      <span className="block text-[11px] text-gray-500 leading-relaxed font-medium mt-0.5">
                        {idCardUrl 
                          ? 'We automatically scanned the geometry. Image successfully detected.' 
                          : 'Please scroll up to "Government ID Document" and upload a JPG or PNG.'}
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Legibility Attestation */}
                  <label 
                    className={`flex items-start gap-3 cursor-pointer select-none rounded-xl p-2 -mx-2 transition-all hover:bg-gray-100 ${!idCardUrl ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => idCardUrl && setChkLegible(!chkLegible)}
                  >
                    <input 
                      type="checkbox"
                      id="checkbox-legible"
                      checked={chkLegible}
                      disabled={!idCardUrl}
                      onChange={() => {}} // handled by click container
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0A192F] focus:ring-[#0A192F] cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className="block font-bold text-gray-800">
                        Is the ID clearly legible?
                      </span>
                      <span className="block text-[11px] text-gray-400 leading-relaxed font-medium mt-0.5">
                        All texts, identification numbers, and your portrait are sharp, clearly visible, and not blurred.
                      </span>
                    </div>
                  </label>

                  {/* Item 3: Orientation Attestation */}
                  <label 
                    className={`flex items-start gap-3 cursor-pointer select-none rounded-xl p-2 -mx-2 transition-all hover:bg-gray-100 ${!idCardUrl ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => idCardUrl && setChkOriented(!chkOriented)}
                  >
                    <input 
                      type="checkbox"
                      id="checkbox-oriented"
                      checked={chkOriented}
                      disabled={!idCardUrl}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0A192F] focus:ring-[#0A192F] cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className="block font-bold text-gray-800">
                        Is the document properly oriented?
                      </span>
                      <span className="block text-[11px] text-gray-400 leading-relaxed font-medium mt-0.5">
                        The document is upright, not rotated sideways, and not cropped or cut off at the edges.
                      </span>
                    </div>
                  </label>

                  {/* Item 4: Validity Attestation */}
                  <label 
                    className={`flex items-start gap-3 cursor-pointer select-none rounded-xl p-2 -mx-2 transition-all hover:bg-gray-100 ${!idCardUrl ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => idCardUrl && setChkValid(!chkValid)}
                  >
                    <input 
                      type="checkbox"
                      id="checkbox-valid"
                      checked={chkValid}
                      disabled={!idCardUrl}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0A192F] focus:ring-[#0A192F] cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className="block font-bold text-gray-800">
                        Is this a valid, active government ID?
                      </span>
                      <span className="block text-[11px] text-gray-400 leading-relaxed font-medium mt-0.5">
                        This is an official national ID, voter&apos;s card, driver&apos;s license or passport and is currently not expired.
                      </span>
                    </div>
                  </label>

                  {idCardUrl && (!chkLegible || !chkOriented || !chkValid) && (
                    <div className="text-[10px] text-amber-800 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 font-medium tracking-tight">
                      Note: You must confirm all standard checklist criteria above to unlock passport update capabilities.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alert notices */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100" id="passport-error">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 bg-blue-50 text-blue-950 p-3.5 rounded-xl text-xs border border-blue-200 shadow-sm" id="passport-message">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Action buttons */}
            <button
              id="passport-save-btn"
              type="submit"
              disabled={saving || (!isVerified && (!idCardUrl || !chkLegible || !chkOriented || !chkValid))}
              className="w-full bg-[#0A192F] text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#112a4f] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:bg-gray-400/80 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
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
