import React from 'react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans pt-32">
            <div className="max-w-3xl mx-auto bg-gray-900/50 shadow-2xl rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                <h1 className="text-3xl font-bold mb-2 text-white">Terms of Service</h1>
                <p className="text-gray-400 mb-6 text-sm">Last Updated: January 15, 2026</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
                    <p className="text-gray-300">
                        By accessing and using <strong>WatchThisMovie</strong>, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">2. User Conduct & Anti-Piracy Policy</h2>
                    <p className="mb-2 text-gray-300">
                        You agree not to use the website for any unlawful purpose. Specifically:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-red-400 font-medium">
                        <li>You must not post links to illegal streaming sites, torrents, or pirated content.</li>
                        <li>Any user found posting such content will be banned immediately and content will be removed.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">3. Disclaimer </h2>
                    <p className="text-gray-300">
                        The service is provided on an "as is" and "as available" basis. We do not guarantee that the service will be uninterrupted or error-free.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">4. Termination</h2>
                    <p className="text-gray-300">
                        We reserve the right to terminate your access to the site without cause or notice, which may result in the forfeiture and destruction of all information associated with you.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">5. Contact Information</h2>
                    <p className="text-gray-300">
                        Questions about the Terms of Service should be sent to us at: <br />
                        <a href="mailto:noreply.watchthismovie@gmail.com" className="text-blue-400 font-medium hover:text-blue-300">noreply.watchthismovie@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
