export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4">Kenalyuk!</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Syariah-Compliant Matchmaking Platform</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Modern UX</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive swipe-based interface for discovering marriage-minded profiles</p>
          </div>
          <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Regional Supervision</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Local supervisors ensure syariah-compliant interactions and serious intentions</p>
          </div>
          <div className="p-6 border rounded-lg hover:border-gray-400 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Trust Network</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Build meaningful connections with profiles approved by your regional community</p>
          </div>
        </div>
      </div>
    </main>
  );
}
