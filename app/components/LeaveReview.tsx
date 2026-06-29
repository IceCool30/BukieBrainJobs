'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Loader2, CheckCircle } from 'lucide-react'
import { createReview } from '@/app/actions/reviews'

interface LeaveReviewProps {
  jobId: string
  artisanId: string
  artisanName: string
  jobBudget: number
  onSuccess?: () => void
}

export function LeaveReview({ jobId, artisanId, artisanName, jobBudget, onSuccess }: LeaveReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('job_id', jobId)
      formData.append('artisan_id', artisanId)
      formData.append('rating', rating.toString())
      formData.append('comment', comment)

      await createReview(formData)
      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[150px] flex items-center justify-center text-sm text-gray-400">Loading rating panel...</div>
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center space-y-3"
      >
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900">Review Submitted</h3>
        <p className="text-sm text-green-800">
          Thank you for rating {artisanName}. Your feedback helps the BukieBrain community.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Rate this job</h3>
      <p className="text-sm text-gray-500 mb-6">
        How was this ₦{jobBudget.toLocaleString()} job with {artisanName}?
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full transition-transform active:scale-90"
              >
                <Star 
                  className={`w-10 h-10 ${
                    (hoveredRating || rating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-gray-200'
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {rating === 0 ? 'Select Rating' : 
             rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' : 'Excellent'}
          </span>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wide text-gray-500">
            Written Feedback (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`What did ${artisanName} do well? What could be improved?`}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:bg-white transition-all resize-none min-h-[100px]"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-[#0A192F] hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider py-4 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Review</span>
          )}
        </button>
      </form>
    </div>
  )
}
