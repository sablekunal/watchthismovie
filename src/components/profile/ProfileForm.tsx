'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Search, X, Star, Plus, Trash2, Link as LinkIcon, User, Globe, Instagram, Twitter, Camera, Clock } from 'lucide-react';
import { searchMovies } from '@/app/actions';
import Image from 'next/image';
import { IKContext, IKUpload } from 'imagekitio-react';
import FilmIndustrySelector from './FilmIndustrySelector';

interface ProfileFormProps {
    initialProfile: any;
    userId: string;
}

const SOCIAL_PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
    { id: 'letterboxd', label: 'Letterboxd', icon: Globe },
    { id: 'website', label: 'Website', icon: LinkIcon },
    { id: 'linkedin', label: 'LinkedIn', icon: User },
    { id: 'youtube', label: 'YouTube', icon: Globe },
];

export default function ProfileForm({ initialProfile, userId }: ProfileFormProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Parse initial social links
    const initialSocials = initialProfile?.social_links
        ? Object.entries(initialProfile.social_links).map(([platform, value]) => ({ platform, value: value as string }))
        : [];

    // Form State
    const [formData, setFormData] = useState({
        username: initialProfile?.username || '',
        full_name: initialProfile?.full_name || '',
        bio: initialProfile?.bio || '',
        avatar_url: initialProfile?.avatar_url || '',
        is_public: initialProfile?.is_public ?? true,
        show_stats_publicly: initialProfile?.show_stats_publicly ?? true,
        public_note: initialProfile?.public_note || '',
    });

    // Industries State (New)
    const [industries, setIndustries] = useState<string[]>(initialProfile?.taste_dna?.industries || ['US']);

    const [socials, setSocials] = useState<{ platform: string, value: string }[]>(initialSocials);
    const [showSocialDropdown, setShowSocialDropdown] = useState(false);

    // Favorites State
    const [favorites, setFavorites] = useState<any[]>(initialProfile?.top_favorites || []);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Recent Watches State
    const [recentWatches, setRecentWatches] = useState<any[]>(initialProfile?.recent_watches || []);
    const [recentQuery, setRecentQuery] = useState('');
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [searchingRecent, setSearchingRecent] = useState(false);

    // SYNC STATE ON REFRESH (Fix: UI wasn't updating after save)
    useEffect(() => {
        if (initialProfile) {
            setFormData({
                username: initialProfile.username || '',
                full_name: initialProfile.full_name || '',
                bio: initialProfile.bio || '',
                avatar_url: initialProfile.avatar_url || '',
                is_public: initialProfile.is_public ?? true,
                show_stats_publicly: initialProfile.show_stats_publicly ?? true,
                public_note: initialProfile.public_note || '',
            });

            const newSocials = initialProfile.social_links
                ? Object.entries(initialProfile.social_links).map(([platform, value]) => ({ platform, value: value as string }))
                : [];
            setSocials(newSocials);

            setFavorites(initialProfile.top_favorites || []);
            setRecentWatches(initialProfile.recent_watches || []);
            setIndustries(initialProfile.taste_dna?.industries || ['US']); // Sync industries
        }
    }, [initialProfile]);

    // --- HANDLERS ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const finalValue = type === 'checkbox' ? e.target.checked : value;

        // Enforce Username Constraints immediately
        if (name === 'username') {
            // Lowercase and remove invalid characters
            const sanitized = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
            setFormData(prev => ({ ...prev, [name]: sanitized }));
            return;
        }

        // Auto-resize Textarea
        if (type === 'textarea') {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleToggle = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
    }

    // --- UPLOAD HANDLER ---
    const onUploadError = (err: any) => {
        console.error("ImageKit Error:", err);
        setMessage({ type: 'error', text: `Upload failed: ${err.message || "Unknown error"}` });
    };

    const onUploadSuccess = (res: any) => {
        setFormData(prev => ({ ...prev, avatar_url: res.url }));
        setMessage({ type: 'success', text: "Image uploaded! Only saved when you click 'Save Profile'." });
    };


    // --- SOCIALS LOGIC ---
    const addSocial = (platformId: string) => {
        if (socials.find(s => s.platform === platformId)) return;
        setSocials([...socials, { platform: platformId, value: '' }]);
        setShowSocialDropdown(false);
    };

    const removeSocial = (platformId: string) => {
        setSocials(socials.filter(s => s.platform !== platformId));
    };

    const updateSocial = (platformId: string, newValue: string) => {
        setSocials(socials.map(s => s.platform === platformId ? { ...s, value: newValue } : s));
    };

    // --- FAVORITES LOGIC ---

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 2) {
            try {
                setSearching(true);
                const res = await searchMovies(q);
                setResults(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        } else {
            setResults([]);
        }
    };

    const addFavorite = (movie: any) => {
        if (favorites.length >= 3) return;
        if (favorites.find(f => f.id === movie.id)) return;

        const newFav = { id: movie.id, title: movie.title, poster_path: movie.poster_path };
        setFavorites([...favorites, newFav]);
        setQuery('');
        setResults([]);
    };

    const removeFavorite = (id: number) => {
        setFavorites(favorites.filter(f => f.id !== id));
    };

    // --- RECENT WATCHES LOGIC ---
    const handleRecentSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setRecentQuery(q);
        if (q.length < 2) {
            setRecentResults([]);
            return;
        }

        setSearchingRecent(true);
        try {
            const movies = await searchMovies(q);
            setRecentResults(movies?.slice(0, 5) || []);
        } catch (e) { console.error(e) } finally {
            setSearchingRecent(false);
        }
    };

    const addRecent = (movie: any) => {
        if (recentWatches.length >= 5) return;
        if (recentWatches.find(f => f.id === movie.id)) return;
        setRecentWatches([{ id: movie.id, title: movie.title, poster_path: movie.poster_path }, ...recentWatches]); // Add to top
        setRecentQuery('');
        setRecentResults([]);
    };

    const removeRecent = (movieId: number) => {
        setRecentWatches(recentWatches.filter(m => m.id !== movieId));
    };


    // --- SUBMIT ---

    // --- VALIDATION ---
    const BLOCKED_KEYWORDS = ['torrent', 'magnet:', 'dvdrip', 'camrip', '123movies', 'fmovies', 'putlocker', 'yts'];

    const validateContent = (text: string) => {
        if (!text) return true;
        const lower = text.toLowerCase();
        for (const word of BLOCKED_KEYWORDS) {
            if (lower.includes(word)) return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (formData.username.length < 3) {
            setMessage({ type: 'error', text: 'Username must be at least 3 characters.' });
            setLoading(false);
            return;
        }

        if (formData.full_name.length > 30) {
            setMessage({ type: 'error', text: 'Full name must be less than 30 characters.' });
            setLoading(false);
            return;
        }

        if (formData.public_note.length > 500) {
            setMessage({ type: 'error', text: 'Public note must be less than 500 characters.' });
            setLoading(false);
            return;
        }

        if (formData.bio.length > 250) {
            setMessage({ type: 'error', text: 'Bio must be less than 250 characters.' });
            setLoading(false);
            return;
        }

        // SPAM FILTER
        if (!validateContent(formData.bio) || !validateContent(formData.public_note)) {
            setMessage({ type: 'error', text: 'Content contains restricted keywords or links.' });
            setLoading(false);
            return;
        }

        const socialLinksObj = socials.reduce((acc, curr) => {
            if (curr.value.trim()) {
                acc[curr.platform] = curr.value.trim();
            }
            return acc;
        }, {} as Record<string, string>);

        const updates = {
            username: formData.username,
            full_name: formData.full_name,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
            is_public: formData.is_public,
            show_stats_publicly: formData.show_stats_publicly,
            public_note: formData.public_note,
            social_links: socialLinksObj,
            top_favorites: favorites,
            recent_watches: recentWatches,
            taste_dna: {
                ...(initialProfile?.taste_dna || {}),
                industries: industries // SAVE INDUSTRIES
            },
            updated_at: new Date().toISOString(),
        };

        console.log("Saving Profile Updates:", updates); // DEBUG LOG

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select(); // Verify update happened

            if (error) {
                if (error.code === '23505') throw new Error('Username already taken.');
                throw error;
            };

            if (!data || data.length === 0) {
                throw new Error("Update failed. Please refresh and try again.");
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            router.refresh();

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update user.' });
        } finally {
            setLoading(false);
        }
    };

    // --- AUTHENTICATOR ---
    const authenticator = async () => {
        try {
            const response = await fetch('/api/imagekit/auth');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error: any) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    return (
        <IKContext
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            authenticator={authenticator}
        >
            <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900/50 p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-md animate-in fade-in duration-500">

                {/* Messages */}
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* --- SECTION 1: IDENTITY --- */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Identity</h3>

                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* Avatar Upload */}
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
                            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-black">
                                {formData.avatar_url ? (
                                    <Image src={formData.avatar_url} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Overlay for Upload */}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white mb-1" />
                                    <span className="text-[10px] uppercase font-bold text-white">Change</span>
                                    {/* Hidden File Input via ImageKit */}
                                    <div className="absolute inset-0 opacity-0 cursor-pointer">
                                        <IKUpload
                                            fileName={`avatar_${userId}`}
                                            onError={onUploadError}
                                            onSuccess={onUploadSuccess}
                                            validateFile={(file: any) => file.size < 5000000}
                                            style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                                            useUniqueFileName={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-2">Max 5MB</p>
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                    <div className="flex bg-black/50 rounded-md border border-white/10 overflow-hidden">
                                        <span className="inline-flex items-center px-3 bg-white/5 text-gray-500 text-xs border-r border-white/10">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            maxLength={30}
                                            suppressHydrationWarning
                                            className="flex-1 min-w-0 block w-full px-3 py-2 bg-transparent text-white focus:outline-none sm:text-sm"
                                            placeholder="ghostshanky"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Max 30 chars. Only a-z, 0-9, . and _
                                    </p>
                                </div>
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        maxLength={30}
                                        suppressHydrationWarning
                                        className="block w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md text-white focus:outline-none sm:text-sm"
                                        placeholder="Kunal..."
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-400">Bio</label>
                                    <span className={`text-xs ${formData.bio.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {formData.bio.length}/250
                                    </span>
                                </div>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={(e) => {
                                        handleChange(e);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    maxLength={250}
                                    className="block w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm overflow-hidden min-h-[80px]"
                                    placeholder="Tell us about your taste (Max 250 chars)..."
                                />
                            </div>

                            {/* Public Note */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-400">Pinned Note (Public)</label>
                                    <span className={`text-xs ${formData.public_note.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {formData.public_note.length}/500
                                    </span>
                                </div>
                                <textarea
                                    name="public_note"
                                    value={formData.public_note}
                                    onChange={(e) => {
                                        handleChange(e);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    maxLength={500}
                                    className="block w-full px-3 py-2 bg-yellow-100/10 border border-yellow-500/20 rounded-md text-yellow-100 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm font-mono overflow-hidden min-h-[100px]"
                                    placeholder="Write something visible to everyone (Max 500 chars)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 1.5: FILM INDUSTRIES (New) --- */}
                <div className="pt-4 border-t border-white/5">
                    <FilmIndustrySelector
                        selectedCodes={industries}
                        onChange={setIndustries}
                    />
                </div>

                {/* --- SECTION 2: HALL OF FAME (TOP 3) --- */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" /> Hall of Fame <span className="text-xs text-gray-500 font-normal">(Max 3)</span>
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                        {favorites.map((movie) => (
                            <div key={movie.id} className="relative aspect-[2/3] group rounded-lg overflow-hidden border border-white/20">
                                {movie.poster_path ? (
                                    <Image src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-center p-1">{movie.title}</div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeFavorite(movie.id)}
                                    className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3 text-white" />
                                </button>
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                            </div>
                        ))}

                        {Array.from({ length: 3 - favorites.length }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-lg border border-dashed border-white/10 bg-white/5 flex items-center justify-center text-gray-600">
                                <span className="text-2xl opacity-20">+</span>
                            </div>
                        ))}
                    </div>

                    {/* Top 3 Search */}
                    {favorites.length < 3 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={handleSearch}
                                placeholder="Search for a movie..."
                                suppressHydrationWarning
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                            />

                            {results.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                                    {results.map(movie => (
                                        <button
                                            key={movie.id}
                                            type="button"
                                            onClick={() => addFavorite(movie)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 border-b border-white/5 last:border-0"
                                        >
                                            {movie.poster_path && (
                                                <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} width={30} height={45} alt="" className="rounded bg-gray-800" />
                                            )}
                                            <div>
                                                <div className="font-bold text-sm text-white">{movie.title}</div>
                                                <div className="text-xs text-gray-500">{movie.release_date?.split('-')[0]}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- SECTION 3: RECENT WATCHES (MANUAL) --- */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        Recently Watched <span className="text-xs text-gray-500 font-normal">(Max 5)</span>
                    </h3>
                    <p className="text-xs text-gray-400">Add movies here to display in your "Recently Watched" row. If empty, we'll auto-detect.</p>

                    {/* Search */}
                    <div className="relative">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus-within:border-purple-500 transition-colors">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={recentQuery}
                                onChange={handleRecentSearch}
                                placeholder="Search to add recent watch..."
                                suppressHydrationWarning
                                className="bg-transparent border-none focus:outline-none text-white text-sm w-full placeholder-gray-500"
                                disabled={recentWatches.length >= 5}
                            />
                            {searchingRecent && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
                        </div>

                        {/* Results Dropdown */}
                        {recentResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {recentResults.map(movie => (
                                    <button
                                        key={movie.id}
                                        type="button"
                                        onClick={() => addRecent(movie)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                    >
                                        {movie.poster_path ? (
                                            <div className="relative w-8 h-12 flex-shrink-0 rounded bg-gray-800 overflow-hidden">
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-12 bg-gray-800 rounded flex-shrink-0" />
                                        )}
                                        <div>
                                            <div className="font-medium text-white text-sm">{movie.title}</div>
                                            <div className="text-xs text-gray-500">{movie.release_date?.split('-')[0]}</div>
                                        </div>
                                        <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected List */}
                    <div className="flex flex-col gap-2">
                        {recentWatches.map((movie) => (
                            <div key={movie.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg group border border-white/5 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-16 rounded bg-gray-800 overflow-hidden text-xs text-gray-500 flex items-center justify-center flex-shrink-0">
                                        {movie.poster_path ? (
                                            <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                                        ) : (
                                            "No Img"
                                        )}
                                    </div>
                                    <span className="font-medium text-white text-sm">{movie.title}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRecent(movie.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>


                {/* --- SECTION 4: SOCIAL LINKS (DYNAMIC) --- */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-300">Social Links</h3>

                        {/* Add Button with Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowSocialDropdown(!showSocialDropdown)}
                                suppressHydrationWarning
                                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add Link
                            </button>

                            {showSocialDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {SOCIAL_PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addSocial(p.id)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                                        >
                                            <p.icon className="w-3 h-3" /> {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {socials.map((link) => {
                            const platformInfo = SOCIAL_PLATFORMS.find(p => p.id === link.platform) || { label: link.platform, icon: LinkIcon };
                            const Icon = platformInfo.icon;

                            return (
                                <div key={link.platform} className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-md border border-white/10 text-gray-400">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={link.value}
                                        onChange={(e) => updateSocial(link.platform, e.target.value)}
                                        suppressHydrationWarning
                                        className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-md text-white text-sm focus:outline-none"
                                        placeholder={link.platform === 'website' ? 'https://...' : 'username'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSocial(link.platform)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}

                        {socials.length === 0 && (
                            <div className="text-sm text-gray-500 italic">No social links added yet.</div>
                        )}
                    </div>
                </div>

                {/* Privacy Toggle (Public Profile) */}
                <div className="space-y-4 py-4 border-t border-white/10">
                    {/* 1. Public Profile Visibility */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white">Public Profile</h3>
                            <p className="text-sm text-gray-500">Allow anyone to view your cinephile card.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggle('is_public')}
                            suppressHydrationWarning
                            className={`${formData.is_public ? 'bg-blue-600' : 'bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                        >
                            <span className={`${formData.is_public ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                        </button>
                    </div>

                    {/* 2. Public Stats Visibility (New) */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white">Show Advanced Stats Publicly</h3>
                            <p className="text-sm text-gray-500">Show Likes, Match Rate, and Hours on your public page.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggle('show_stats_publicly')}
                            suppressHydrationWarning
                            className={`${formData.show_stats_publicly ? 'bg-green-600' : 'bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                        >
                            <span className={`${formData.show_stats_publicly ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        suppressHydrationWarning
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all font-bold"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

            </form>
        </IKContext>
    );
}
