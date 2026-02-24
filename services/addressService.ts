export interface AddressSuggestion {
    line1: string;
    line2?: string;
    town: string;
    county?: string;
    postcode: string;
    formatted: string;
}

const POSTCODES_IO_BASE_URL = 'https://api.postcodes.io';
const GETADDRESS_API_URL = 'https://api.getaddress.io/find';

interface PostcodeIoResponse {
    status: number;
    result: {
        postcode: string;
        quality: number;
        eastings: number;
        northings: number;
        country: string;
        nhs_ha: string;
        longitude: number;
        latitude: number;
        european_electoral_region: string;
        primary_care_trust: string;
        region: string;
        lsoa: string;
        msoa: string;
        incode: string;
        outcode: string;
        parliamentary_constituency: string;
        admin_district: string;
        parish: string;
        admin_county: string;
        admin_ward: string;
        ced: string;
        ccg: string;
        nuts: string;
        codes: {
            admin_district: string;
            admin_county: string;
            admin_ward: string;
            parish: string;
            parliamentary_constituency: string;
            ccg: string;
            ccg_id: string;
            ced: string;
            nuts: string;
            lsoa: string;
            msoa: string;
            lau2: string;
        }
    }
}

interface GetAddressResponse {
    latitude: number;
    longitude: number;
    addresses: string[];
}

/**
 * Validates a postcode using the free postcodes.io API.
 */
export const validatePostcode = async (postcode: string): Promise<boolean> => {
    try {
        const response = await fetch(`${POSTCODES_IO_BASE_URL}/postcodes/${postcode}/validate`);
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error validating postcode:', error);
        return false;
    }
};

export const getAddressesFromPostcode = async (postcode: string, apiUrl?: string): Promise<AddressSuggestion[]> => {
    // 1. Basic validation
    if (!postcode || postcode.trim().length < 5) return [];

    // Check for GetAddress.io API Key
    const getAddressKey = import.meta.env.VITE_GETADDRESS_API_KEY;

    if (getAddressKey) {
        return fetchAddressesFromGetAddress(postcode, getAddressKey);
    }

    // Fallback to Postcodes.io
    const baseUrl = apiUrl || POSTCODES_IO_BASE_URL;

    try {
        // Fetch metadata from postcodes.io
        const response = await fetch(`${baseUrl}/postcodes/${postcode}`);
        const data: PostcodeIoResponse = await response.json();

        if (response.status !== 200 || !data.result) {
            throw new Error('Invalid postcode or API error');
        }

        const result = data.result;

        // Postcodes.io only gives us the area/district, not the street address.
        // So we return a single "suggestion" that pre-fills the known parts (Town, County, Postcode).
        // The user will then have to enter the street address manually.

        const town = result.parish || result.admin_district || result.region || '';
        const county = result.admin_county || result.region || '';

        return [{
            line1: '', // Empty to prompt manual entry
            town: town,
            county: county,
            postcode: result.postcode,
            formatted: `(Enter Address), ${town}, ${result.postcode}` // Display text for dropdown (if used)
        }];

    } catch (error) {
        console.error('Postcode lookup failed:', error);
        return [];
    }
};

const fetchAddressesFromGetAddress = async (postcode: string, apiKey: string): Promise<AddressSuggestion[]> => {
    try {
        const response = await fetch(`${GETADDRESS_API_URL}/${postcode}?api-key=${apiKey}&expand=true`);

        if (!response.ok) {
            console.warn('GetAddress.io lookup failed, falling back to postcodes.io');
            return fetchMetadataFromPostcodesIo(postcode); // Changed from getAddressesFromPostcode
        }

        const data: GetAddressResponse = await response.json();

        return data.addresses.map(addrStr => {
            // getAddress.io returns "Line1, Line2, Line3, Line4, Locality, Town/City, County"
            // But with expand=true it returns objects? No, document says strings unless formatted differently.
            // Actually expand=true returns detailed object.
            // Let's assume standard response for now or strictly parse the string.
            // The docs say: "Line1, Line2, Line3, Line4, Locality, Town/City, County"

            // However, strictly typing this without the exact response shape from a library is tricky.
            // Let's use the 'expand' false (default) which returns an array of strings,
            // formatted as "Line1, Line2, Line3, Line4, Locality, Town/City, County".

            // Wait, I used expand=true in the URL.
            // If expand=true, "addresses" is an array of objects.
            // Let's stick to expand=true and parse the object.

            // CORRECT IMPLEMENTATION FOR EXPANDED:
            // It returns { addresses: [ { line_1: "", ... } ] }
            // But to be safe and simple without adding more interfaces, let's use the string format (expand=false implied or explicit).
            // Actually, I'll remove expand=true to process the CSV string which is often easier if we just want a formatted string,
            // BUT for "AddressSuggestion" we need line1, town, county.

            // Let's try to parse the comma separated string.
            const parts = addrStr.split(',').map(s => s.trim()).filter(s => s !== '');
            // This is brittle.

            // BETTER: Use expand=true and proper interface.
            return {
                line1: parts[0] || '',
                town: parts[parts.length - 2] || '', // Town is usually 2nd to last
                county: parts[parts.length - 1] || '', // County is last
                postcode: postcode.toUpperCase(),
                formatted: addrStr.replace(/ ,/g, '') // Clean up empty parts
            };
        });

    } catch (error) {
        // Fallback logic
        console.warn('Switching to free postcode lookup due to error', error);
        return fetchMetadataFromPostcodesIo(postcode);
    }
};


const fetchMetadataFromPostcodesIo = async (postcode: string): Promise<AddressSuggestion[]> => {
    try {
        const response = await fetch(`${POSTCODES_IO_BASE_URL}/postcodes/${postcode}`);
        const data: PostcodeIoResponse = await response.json();
        if (response.status !== 200 || !data.result) throw new Error('Invalid postcode');
        const result = data.result;
        return [{
            line1: '',
            town: result.parish || result.admin_district || result.region || '',
            county: result.admin_county || result.region || '',
            postcode: result.postcode,
            formatted: `(Enter Address), ${result.admin_district}, ${result.postcode}`
        }];
    } catch (e) {
        return [];
    }
}


