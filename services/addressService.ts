export interface AddressSuggestion {
    line1: string;
    line2?: string;
    town: string;
    county?: string;
    postcode: string;
    formatted: string;
    latitude?: number;
    longitude?: number;
}

const POSTCODES_IO_BASE_URL = 'https://api.postcodes.io';
const IDEAL_POSTCODES_BASE_URL = 'https://api.ideal-postcodes.co.uk/v1';

interface PostcodeIoResult {
    postcode: string;
    longitude: number;
    latitude: number;
    parish?: string;
    admin_district?: string;
    region?: string;
    admin_county?: string;
}

interface PostcodeIoResponse {
    status: number;
    result: PostcodeIoResult;
}

interface IdealPostcodesAddress {
    line_1: string;
    line_2: string;
    line_3: string;
    post_town: string;
    county: string;
    postcode: string;
    longitude: number;
    latitude: number;
}

interface IdealPostcodesResponse {
    result: IdealPostcodesAddress[];
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

    // Check for Ideal Postcodes API Key
    const idealPostcodesKey = import.meta.env.VITE_IDEAL_POSTCODES_API_KEY;

    if (idealPostcodesKey) {
        return fetchAddressesFromIdealPostcodes(postcode, idealPostcodesKey);
    }

    // Fallback to Postcodes.io for basic info if no API key
    return fetchMetadataFromPostcodesIo(postcode);
};

const fetchAddressesFromIdealPostcodes = async (postcode: string, apiKey: string): Promise<AddressSuggestion[]> => {
    try {
        const response = await fetch(`${IDEAL_POSTCODES_BASE_URL}/postcodes/${postcode}?api_key=${apiKey}`);

        if (!response.ok) {
            console.warn('Ideal Postcodes lookup failed, falling back to postcodes.io');
            return fetchMetadataFromPostcodesIo(postcode);
        }

        const data: IdealPostcodesResponse = await response.json();

        return data.result.map(addr => ({
            line1: addr.line_1,
            line2: addr.line_2,
            town: addr.post_town,
            county: addr.county,
            postcode: addr.postcode,
            formatted: [addr.line_1, addr.line_2, addr.post_town, addr.postcode].filter(Boolean).join(', '),
            latitude: addr.latitude,
            longitude: addr.longitude
        }));

    } catch (error) {
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

        const town = result.parish || result.admin_district || result.region || '';
        const county = result.admin_county || result.region || '';

        return [{
            line1: '',
            town: town,
            county: county,
            postcode: result.postcode,
            formatted: `(Enter Address), ${town}, ${result.postcode}`,
            latitude: result.latitude,
            longitude: result.longitude
        }];
    } catch (e) {
        return [];
    }
}


