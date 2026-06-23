"use client";

export default function Profile() {
  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-medium text-gray-900">Profile</h1>
        <button className="text-sm text-gray-400 hover:text-gray-900 transition">Edit</button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-medium text-gray-400 mb-4">
          Y
        </div>
        <p className="text-base font-medium text-gray-900">you</p>
        <p className="text-sm text-gray-400 mt-1">Joined today</p>
      </div>

      <div className="flex justify-around mb-8 border-y border-gray-100 py-4">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">0</p>
          <p className="text-xs text-gray-400">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">0</p>
          <p className="text-xs text-gray-400">Following</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">0</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-sm text-gray-300">No posts yet.</p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 max-w-md mx-auto">
        <a href="/feed" className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg></a>
        <button className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></button>
        <button className="text-gray-300"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
        <button className="text-gray-900"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></button>
      </div>
    </main>
  );
}
