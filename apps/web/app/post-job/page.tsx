import { Suspense } from 'react';
import PostJobScreen from '../../components/post-job/PostJobScreen';

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
        </div>
      }
    >
      <PostJobScreen />
    </Suspense>
  );
}
