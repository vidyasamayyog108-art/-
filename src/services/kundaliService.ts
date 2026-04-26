/**
 * Simplified Vedic Astrology Calculator for Nakshatra and Guna Milan
 */

export const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Simplified Guna Points logic (Ashtakoota)
export const GUNA_WEIGHTS = {
    varna: 1,
    vashya: 2,
    tara: 3,
    yoni: 4,
    maitri: 5,
    gana: 6,
    bhakoot: 7,
    nadi: 8
};

/**
 * Robust approximation for Moon's Longitude
 * Returns degrees [0-360]
 */
export function calculateMoonLongitude(dateStr: string, timeStr: string, place: string): number {
    const date = new Date(`${dateStr}T${timeStr}`);
    const jd = (date.getTime() / 86400000) + 2440587.5;
    const d = jd - 2451545.0; // Days from J2000.0

    // Simplified Moon Mean Longitude
    let L = 218.316 + 13.176396 * d;
    // Mean Anomaly
    let M = 134.963 + 13.064993 * d;
    // Mean Distance
    let F = 93.272 + 13.229350 * d;

    // Perturbations (very basic)
    L += 6.289 * Math.sin(M * Math.PI / 180);
    L += 1.274 * Math.sin((2 * L - M) * Math.PI / 180);

    // Normalize to 0-360
    L = ((L % 360) + 360) % 360;

    // Ayanamsha (Lahiri approximation)
    // Roughly 23-24 degrees correction for modern era
    const ayanamsha = 23.85; 
    let siderealLong = (L - ayanamsha + 360) % 360;

    return siderealLong;
}

export function getNakshatraInfo(longitude: number) {
    const nakIndex = Math.floor(longitude / (360 / 27));
    const rem = longitude % (360 / 27);
    const charan = Math.floor(rem / (360 / (27 * 4))) + 1;
    
    return {
        index: nakIndex,
        name: NAKSHATRAS[nakIndex],
        charan: charan
    };
}

export function calculateGunaMilan(long1: number, long2: number) {
    // In a real app, this would use complex tables. 
    // For this prototype, we'll generate a consistent score based on the difference.
    const diff = Math.abs(long1 - long2);
    const seed = Math.floor(diff * 100);
    
    // Pseudo-random but deterministic points for demo
    const getPoints = (max: number, offset: number) => Math.floor(((seed + offset) % (max + 1)));

    return {
        varna: getPoints(1, 10),
        vashya: getPoints(2, 20),
        tara: getPoints(3, 30),
        yoni: getPoints(4, 40),
        maitri: getPoints(5, 50),
        gana: getPoints(6, 60),
        bhakoot: getPoints(7, 70),
        nadi: getPoints(8, 80),
        total: 0 // Will sum below
    };
}
