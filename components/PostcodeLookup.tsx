import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { getAddressesFromPostcode, AddressSuggestion } from '../services/addressService';
import { useJobs } from '../context/JobContext';

interface PostcodeLookupProps {
    onAddressSelected: (address: string, postcode: string) => void;
    initialPostcode?: string;
}

const PostcodeLookup: React.FC<PostcodeLookupProps> = ({ onAddressSelected, initialPostcode = '' }) => {
    const { settings } = useJobs();
    const [postcode, setPostcode] = useState(initialPostcode);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showManual, setShowManual] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!postcode.trim()) {
            setError('Please enter a postcode');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await getAddressesFromPostcode(postcode, settings.postcodeApiUrl);

            if (results.length === 0) {
                setError('No addresses found or invalid postcode. Please enter manually.');
                // Optional: automatically show manual entry on failure?
            } else {
                // Since postcodes.io only returns metadata (Town/District), we don't have a list to pick from.
                // We just take the first result (which contains the town/county) and pass it back.
                // The parent component should then allow editing of the first line.
                const result = results[0];
                onAddressSelected(result.formatted, result.postcode);

                // We clear the search box logic effectively because we've "selected" the general area.
                // You might want to show a success message or just let the parent form take over.
            }
        } catch (err) {
            setError('Error searching for postcode. Please try again or enter manually.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleManual = () => {
        setShowManual(!showManual);
        setError(null);
    };

    return (
        <div className="space-y-3">
            {!showManual ? (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Postcode Search</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                                    placeholder="e.g. SW1A 1AA"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 uppercase placeholder:normal-case transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSearch()}
                                disabled={isLoading || !postcode}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isLoading ? <span className="animate-pulse">...</span> : <Search size={18} />}
                                Find
                            </button>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    <div className="text-xs text-slate-500 italic">
                        Using free postcode lookup. House number must be entered manually.
                    </div>
                </>
            ) : null}

            <div className="text-right">
                <button
                    type="button"
                    onClick={toggleManual}
                    className="text-xs text-lawn-600 hover:text-lawn-700 font-medium underline underline-offset-2"
                >
                    {showManual ? 'Back to Postcode Search' : 'Enter Address Manually'}
                </button>
            </div>
        </div>
    );
};

export default PostcodeLookup;
