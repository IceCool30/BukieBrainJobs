import React from 'react';
import { ChatMessage, UserRole } from '@bukiebrainjobs/types';

export interface ChatBubbleProps {
  /** Optional ChatMessage object from @bukiebrainjobs/types */
  message?: ChatMessage;
  /** Sender display name (fallback if message object omitted) */
  senderName?: string;
  /** Sender role ('client' | 'artisan' | 'admin') */
  senderRole?: UserRole;
  /** Message text content (fallback if message object omitted) */
  text?: string;
  /** Formatted timestamp string (e.g. "10:42 AM") */
  timestamp?: string;
  /** Flagged by anti-bypass detection */
  isFlaggedForBypass?: boolean;
  /** Reason for anti-bypass security flag */
  flaggedReason?: string | undefined;
  /** Explicit self indicator. If omitted, calculated via senderRole === currentRole */
  isSelf?: boolean;
  /** Current viewer role (default: 'client') */
  currentRole?: UserRole;
  /** Additional CSS class names */
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  senderName,
  senderRole,
  text,
  timestamp,
  isFlaggedForBypass,
  flaggedReason,
  isSelf,
  currentRole = 'client',
  className = '',
}) => {
  const resolvedName = message?.senderName ?? senderName ?? 'User';
  const resolvedRole = message?.senderRole ?? senderRole ?? 'client';
  const resolvedText = message?.text ?? text ?? '';
  const resolvedTimestamp = message?.timestamp ?? timestamp ?? '';
  const resolvedFlagged = message?.isFlaggedForBypass ?? isFlaggedForBypass ?? false;
  const resolvedReason = message?.flaggedReason ?? flaggedReason;

  const me = isSelf ?? (resolvedRole === currentRole);

  return (
    <div
      className={`flex flex-col gap-1 max-w-[85%] ${
        me ? 'ml-auto items-end' : 'mr-auto items-start'
      } ${className}`}
    >
      {/* Sender Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-bold text-slate-500">{resolvedName}</span>
        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
          {resolvedRole}
        </span>
        <span className="text-[10px] text-slate-400">{resolvedTimestamp}</span>
      </div>

      {/* Bubble Box */}
      <div
        className={`p-4 rounded-[20px] text-xs font-body leading-relaxed transition-all shadow-2xs ${
          me
            ? 'bg-[#001A41] text-white rounded-tr-xs'
            : 'bg-white border border-[#E9ECEF] text-[#001A41] rounded-tl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{resolvedText}</p>

        {message?.imageUrl && (
          <div className="mt-2.5 overflow-hidden rounded-[12px] border border-white/20">
            <img src={message.imageUrl} alt="Chat attachment" className="max-h-48 w-full object-cover" />
          </div>
        )}
      </div>

      {/* Anti-Bypass Security Alert Callout Container */}
      {resolvedFlagged && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-3 text-xs text-red-800 font-body flex items-start gap-2.5 shadow-sm mt-1 max-w-md">
          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="font-display font-extrabold text-[11px] text-red-900 uppercase tracking-wider">
              Security Notice: Off-Platform Contact Terms Detected
            </div>
            <p className="text-[11px] leading-relaxed text-red-700">
              {resolvedReason ||
                'Off-platform contact or cash payment details detected. Keeping messages and payments in BukieBrainJobs guarantees your ₦500,000 BukieGuarantee insurance protection.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
