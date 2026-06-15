export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <h1 className="text-4xl font-bold tracking-tight">BukieBrainJobs</h1>
      <p className="mt-4 text-gray-600 font-mono text-sm max-w-md text-center">
        PWA Enabled. Bot webhooks are running at /api/bot/telegram and /api/bot/whatsapp.
      </p>
    </main>
  );
}
