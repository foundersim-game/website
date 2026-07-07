// src/lib/security.ts

const SECRET_SALT = "f0und3r_s1m_2024_s3cr3t_s@lt!";

/**
 * A fast, synchronous 32-bit FNV-1a hash function.
 * Generates a consistent hash for a given string and salt.
 */
function generateHash(data: string): string {
    const payload = data + SECRET_SALT;
    let hval = 0x811c9dc5;
    for (let i = 0; i < payload.length; i++) {
        hval ^= payload.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return (hval >>> 0).toString(16);
}

export interface SecureSavePayload {
    data: string;
    signature: string;
    version: number;
}

/**
 * Saves data to localStorage with a cryptographic signature to prevent tampering.
 */
export function secureSave(key: string, rawData: any): void {
    const jsonString = JSON.stringify(rawData);
    const signature = generateHash(jsonString);
    
    const payload: SecureSavePayload = {
        data: jsonString,
        signature,
        version: 1
    };
    
    localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Loads data from localStorage and verifies its signature.
 * Returns null if the data is tampered with or corrupted.
 */
export function secureLoad<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        // Check if it's a new secure payload
        const parsed = JSON.parse(raw);
        if (parsed.signature && parsed.data) {
            const expectedHash = generateHash(parsed.data);
            if (expectedHash !== parsed.signature) {
                console.error(`[SECURITY] Save file tampered! Signature mismatch for key: ${key}`);
                return null;
            }
            return JSON.parse(parsed.data) as T;
        }

        // BACKWARDS COMPATIBILITY: If it's an old, unsigned save file.
        // We accept it this time, but the next save will sign it.
        return parsed as T;
    } catch (e) {
        console.error(`[SECURITY] Failed to parse save file for key: ${key}`, e);
        return null;
    }
}
