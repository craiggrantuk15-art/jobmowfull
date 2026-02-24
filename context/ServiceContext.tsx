import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '../types';
import { DEFAULT_SERVICES } from '../constants';
import { supabase } from '../lib/supabase';

interface ServiceContextType {
    services: Service[];
    addService: (service: Service) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
    getService: (id: string) => Service | undefined;
    refreshServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<Service[]>(() => {
        const saved = localStorage.getItem('jobmow_services');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Check for obsolete IDs and clear if found
            if (parsed.some((s: any) => s.id === 'mowing' || s.id === 'hedge-cutting')) {
                localStorage.removeItem('jobmow_services');
                return DEFAULT_SERVICES;
            }
            return parsed;
        }
        return DEFAULT_SERVICES;
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase.from('services').select('*').eq('active', true);
            if (error) throw error;
            if (data && data.length > 0) {
                setServices(data as Service[]);
                localStorage.setItem('jobmow_services', JSON.stringify(data));
            } else {
                // If no services in DB yet, use defaults but don't force write them yet
                // The admin can add them via the UI
                setServices(prev => prev.length > 0 ? prev : DEFAULT_SERVICES);
            }
        } catch (e) {
            console.error("Error fetching services", e);
        }
    };

    useEffect(() => {
        localStorage.setItem('jobmow_services', JSON.stringify(services));
    }, [services]);

    const addService = async (service: Service) => {
        const { error } = await supabase.from('services').insert([service]);
        if (error) throw error;
        setServices(prev => [...prev, service]);
    };

    const updateService = async (updatedService: Service) => {
        const { error } = await supabase.from('services').update(updatedService).eq('id', updatedService.id);
        if (error) throw error;
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    };

    const deleteService = async (id: string) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const getService = (id: string) => {
        return services.find(s => s.id === id);
    };

    return (
        <ServiceContext.Provider value={{
            services,
            addService,
            updateService,
            deleteService,
            getService,
            refreshServices: fetchServices
        }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (context === undefined) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};
