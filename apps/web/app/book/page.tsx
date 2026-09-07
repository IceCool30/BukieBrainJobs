import { Suspense } from 'react';
import BookingScreen from '../../components/BookingScreen';

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
        </div>
      }
    >
      <BookingScreen />
    </Suspense>
  );
}
