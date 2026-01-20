'use client';

import { useState, useMemo } from 'react';
import { Search, Check, Globe } from 'lucide-react';
import { INDUSTRIES } from '@/lib/industries';

interface Props {
    selectedCodes: string[]; // This now stores IDs (e.g. 'bollywood') not country codes
    onChange: (codes: string[]) => void;
}

export default function FilmIndustrySelector({ selectedCodes, onChange }: Props) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query) return INDUSTRIES;
        return INDUSTRIES.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    }, [query]);

    const toggle = (code: string) => {
        if (selectedCodes.includes(code)) {
            onChange(selectedCodes.filter(c => c !== code));
        } else {
            onChange([...selectedCodes, code]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Preferred Film Industries
                </h3>
                <span className="text-xs text-gray-500">{selectedCodes.length} selected</span>
            </div>

            <p className="text-xs text-gray-400">
                We will prioritize recommendations from these industries. "Global (Hollywood)" is usually recommended to keep enabled.
            </p>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search "
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 premium-scrollbar">
                {filtered.map((industry) => {
                    const isSelected = selectedCodes.includes(industry.id);
                    return (
                        <button
                            key={industry.id}
                            type="button"
                            suppressHydrationWarning
                            onClick={() => toggle(industry.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all ${isSelected
                                ? 'bg-blue-600/20 border-blue-500/50 text-white'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <span>{industry.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
