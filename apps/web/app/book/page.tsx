import { Suspense } from 'react';
import BookingScreen from '../../components/BookingScreen';

export default function BookPage() {
  return <Suspense><BookingScreen /></Suspense>;
}
