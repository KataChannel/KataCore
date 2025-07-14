'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8">
        {/* Error Code */}
        <div className="space-y-6">
          <h1 className="text-9xl font-extralight tracking-[0.2em] opacity-80 text-zinc-900">
            404
          </h1>
          <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-zinc-900 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extralight tracking-[0.1em] opacity-90 text-zinc-900">
            Không Tìm Thấy Trang
          </h2>
          <p className="text-sm font-light leading-relaxed tracking-wide max-w-xs mx-auto text-zinc-600">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến vị trí khác.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-4">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-3 px-8 py-4 border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-300 font-light tracking-[0.1em] text-xs uppercase hover:scale-[1.02]"
          >
            <svg
              className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay Lại
          </button>
          
          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-8 py-4 border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-300 font-light tracking-[0.1em] text-xs uppercase hover:scale-[1.02]"
          >
            <svg
              className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
