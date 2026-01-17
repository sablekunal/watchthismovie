'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                >
                    Try Again
                </button>
            </body>
        </html>
    );
}
