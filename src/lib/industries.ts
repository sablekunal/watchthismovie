export interface Industry {
    id: string; // Unique identifier for the industry (e.g., 'bollywood', 'hollywood')
    name: string; // Display name
    country: string; // ISO 3166-1 alpha-2 code
    emoji?: string;
}

export const INDUSTRIES: Industry[] = [
    // --- GLOBAL MAJORS ---
    { id: 'hollywood', name: 'Hollywood (United States)', country: 'US', emoji: '🇺🇸' },
    { id: 'hallyu', name: 'Hallyuwood / K-Drama (South Korea)', country: 'KR', emoji: '🇰🇷' },
    { id: 'anime', name: 'Animewood / J-Cinema (Japan)', country: 'JP', emoji: '🇯🇵' },
    { id: 'british', name: 'British Cinema (United Kingdom)', country: 'GB', emoji: '🇬🇧' },
    { id: 'china', name: 'Chinawood (Mainland China)', country: 'CN', emoji: '🇨🇳' },
    { id: 'hongkong', name: 'Cantonwood (Hong Kong)', country: 'HK', emoji: '🇭🇰' },
    { id: 'taiwan', name: 'Taiwood (Taiwan)', country: 'TW', emoji: '🇹🇼' },

    // --- EUROPEAN ---
    { id: 'france', name: 'Gaulywood (France)', country: 'FR', emoji: '🇫🇷' },
    { id: 'germany', name: 'Görliwood (Germany)', country: 'DE', emoji: '🇩🇪' },
    { id: 'italy', name: 'Cinema of Italy (Cinecittà)', country: 'IT', emoji: '🇮🇹' },
    { id: 'spain', name: 'Spanish Cinema', country: 'ES', emoji: '🇪🇸' },

    // --- INDIAN SUBCONTINENT (Maps to IN, but users identity with specific regions) ---
    { id: 'bollywood', name: 'Bollywood (Hindi)', country: 'IN', emoji: '🇮🇳' },
    { id: 'tollywood', name: 'Tollywood (Telugu & Bengali)', country: 'IN', emoji: '🇮🇳' },
    { id: 'kollywood', name: 'Kollywood (Tamil)', country: 'IN', emoji: '🇮🇳' },
    { id: 'mollywood', name: 'Mollywood (Malayalam)', country: 'IN', emoji: '🇮🇳' },
    { id: 'sandalwood', name: 'Sandalwood (Kannada)', country: 'IN', emoji: '🇮🇳' },
    { id: 'pollywood', name: 'Pollywood (Punjabi)', country: 'IN', emoji: '🇮🇳' },
    { id: 'marathi', name: 'Marathi Cinema', country: 'IN', emoji: '🇮🇳' },
    { id: 'dhollywood', name: 'Dhollywood (Gujarati)', country: 'IN', emoji: '🇮🇳' },
    { id: 'ollywood', name: 'Ollywood (Odia)', country: 'IN', emoji: '🇮🇳' },
    { id: 'bhojiwood', name: 'Bhojiwood (Bhojpuri)', country: 'IN', emoji: '🇮🇳' },
    { id: 'jollywood', name: 'Jollywood (Assamese)', country: 'IN', emoji: '🇮🇳' },
    { id: 'coastalwood', name: 'Coastalwood (Tulu)', country: 'IN', emoji: '🇮🇳' },
    { id: 'sollywood', name: 'Sollywood (Sindhi)', country: 'IN', emoji: '🇮🇳' },
    { id: 'chhollywood', name: 'Chhollywood (Chhattisgarhi)', country: 'IN', emoji: '🇮🇳' },

    // --- OTHER SOUTH ASIA ---
    { id: 'dhallywood', name: 'Dhallywood (Bangladesh)', country: 'BD', emoji: '🇧🇩' },
    { id: 'lollywood', name: 'Lollywood (Pakistan - Lahore)', country: 'PK', emoji: '🇵🇰' },
    { id: 'kariwood', name: 'Kariwood (Pakistan - Karachi)', country: 'PK', emoji: '🇵🇰' },
    { id: 'helawood', name: 'Helawood (Sri Lanka)', country: 'LK', emoji: '🇱🇰' },

    // --- MIDDLE EAST & AFRICA ---
    { id: 'turkish', name: 'Turkish Dizi', country: 'TR', emoji: '🇹🇷' },
    { id: 'nollywood', name: 'Nollywood (Nigeria)', country: 'NG', emoji: '🇳🇬' },
    { id: 'ghollywood', name: 'Ghollywood (Ghana)', country: 'GH', emoji: '🇬🇭' },
    { id: 'riverwood', name: 'Riverwood (Kenya)', country: 'KE', emoji: '🇰🇪' },

    // --- LATIN AMERICA ---
    { id: 'mexico', name: 'Mexiwood (Mexico)', country: 'MX', emoji: '🇲🇽' },
    { id: 'peru', name: 'Chollywood (Peru)', country: 'PE', emoji: '🇵🇪' },
];

export function getCountryCodesFromIndustries(selectedIds: string[]): string[] {
    const codes = new Set<string>();
    selectedIds.forEach(id => {
        const ind = INDUSTRIES.find(i => i.id === id);
        if (ind) codes.add(ind.country);
    });
    return Array.from(codes);
}
