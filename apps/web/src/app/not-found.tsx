import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-12 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl glass-bank">
        <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600 mb-6">
          404
        </h2>
        <p className="text-slate-400 text-lg font-light mb-10 tracking-tight">
          This jurisdiction or route is not currently under institutional management.
        </p>
        <Link 
          href="/" 
          className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-95 text-xs uppercase tracking-widest"
        >
          Back to Global Home
        </Link>
      </div>
    </div>
  );
}
