import { Suspense } from 'react';
import PostJobScreen from '../../components/post-job/PostJobScreen';

export default function PostJobPage() {
  return (
    <Suspense>
      <PostJobScreen />
    </Suspense>
  );
}
