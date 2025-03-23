import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./useAuth";

// Define types for location data
export interface City {
  id: number;
  name: string;
}

export interface Dormitory {
  id: number;
  name: string;
  cityId: number;
}

// Define type for user preferences context
interface UserPreferencesContextProps {
  selectedCityId: number | null;
  selectedDormId: number | null;
  setSelectedCity: (cityId: number | null) => Promise<void>;
  setSelectedDorm: (dormId: number | null) => Promise<void>;
  loading: boolean;
  cities: City[];
  dorms: Dormitory[];
  dormsByCity: (cityId: number) => Dormitory[];
}

// Create context
const UserPreferencesContext =
  createContext<UserPreferencesContextProps | null>(null);

// Default mock data for cities and dorms to ensure we always have data
const DEFAULT_CITIES: City[] = [
  { id: 1, name: "Ankara" },
  { id: 2, name: "İstanbul" },
  { id: 3, name: "İzmir" },
  { id: 4, name: "Bursa" },
  { id: 5, name: "Antalya" },
];

const DEFAULT_DORMS: Dormitory[] = [
  { id: 1, name: "Ankara KYK Yurdu 1", cityId: 1 },
  { id: 2, name: "Ankara KYK Yurdu 2", cityId: 1 },
  { id: 3, name: "İstanbul KYK Yurdu 1", cityId: 2 },
  { id: 4, name: "İstanbul KYK Yurdu 2", cityId: 2 },
  { id: 5, name: "İzmir KYK Yurdu", cityId: 3 },
  { id: 6, name: "Bursa KYK Yurdu", cityId: 4 },
  { id: 7, name: "Antalya KYK Yurdu", cityId: 5 },
];

// Storage keys
const CITY_STORAGE_KEY = "kyk_yemek_selected_city";
const DORM_STORAGE_KEY = "kyk_yemek_selected_dorm";

// Provider component
export const UserPreferencesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedDormId, setSelectedDormId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  const [dormitories, setDormitories] = useState<Dormitory[]>(DEFAULT_DORMS);
  const [error, setError] = useState<string | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const cityIdStr = await AsyncStorage.getItem(CITY_STORAGE_KEY);
        const dormIdStr = await AsyncStorage.getItem(DORM_STORAGE_KEY);

        if (cityIdStr) {
          setSelectedCityId(Number(cityIdStr));
        }

        if (dormIdStr) {
          setSelectedDormId(Number(dormIdStr));
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Load cities list from the database
  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("cities")
        .select("id, city_name")
        .order("city_name");

      if (error) {
        console.error("Error loading cities:", error);
        setError("Şehir listesi yüklenemedi");
        return;
      }

      // Map database fields to interface fields
      const mappedCities: City[] = (data || []).map((item) => ({
        id: item.id,
        name: item.city_name,
      }));

      // Only update if we got data
      if (mappedCities.length > 0) {
        setCities(mappedCities);
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Load dormitories for a specific city
  const loadDormitories = async (cityId: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("dormitories")
        .select("id, dorm_name, city_id")
        .eq("city_id", cityId)
        .order("dorm_name");

      if (error) {
        console.error("Error loading dormitories:", error);
        setError("Yurt listesi yüklenemedi");
        return;
      }

      // Map database fields to interface fields
      const mappedDorms: Dormitory[] = (data || []).map((item) => ({
        id: item.id,
        name: item.dorm_name,
        cityId: item.city_id,
      }));

      // Only update if we got data
      if (mappedDorms.length > 0) {
        setDormitories((prev) => {
          // Merge with existing dorms, removing any duplicates
          const existingDormIds = new Set(prev.map((d) => d.id));
          const newDorms = mappedDorms.filter(
            (d) => !existingDormIds.has(d.id)
          );
          return [...prev, ...newDorms];
        });
      }
    } catch (err) {
      console.error("Failed to load dormitories:", err);
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Load user preferences
  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("users")
        .select("city_id, dorm_id")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading user preferences:", error);
        setError("Kullanıcı tercihleri yüklenemedi");
        return;
      }

      if (data?.city_id) {
        setSelectedCityId(data.city_id);
        await loadDormitories(data.city_id);
      }

      if (data?.dorm_id) {
        setSelectedDormId(data.dorm_id);
      }
    } catch (err) {
      console.error("Failed to load user preferences:", err);
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Update user city preference
  const updateUserCity = async (cityId: number) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("users")
        .update({ city_id: cityId, dorm_id: null })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating city preference:", error);
        setError("Şehir tercihi güncellenemedi");
        return false;
      }

      setSelectedCityId(cityId);
      setSelectedDormId(null);
      await loadDormitories(cityId);

      return true;
    } catch (err) {
      console.error("Failed to update city preference:", err);
      setError("Bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user dormitory preference
  const updateUserDorm = async (dormId: number) => {
    if (!user || !selectedCityId) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("users")
        .update({ dorm_id: dormId })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating dormitory preference:", error);
        setError("Yurt tercihi güncellenemedi");
        return false;
      }

      setSelectedDormId(dormId);
      return true;
    } catch (err) {
      console.error("Failed to update dormitory preference:", err);
      setError("Bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load cities and user preferences on mount
  useEffect(() => {
    loadCities();
  }, []);

  // Load user preferences when user changes
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    } else {
      // Keep the default values when not authenticated
      setLoading(false);
    }
  }, [user]);

  // Handler to set selected city
  const setSelectedCity = async (cityId: number | null) => {
    try {
      setSelectedCityId(cityId);

      if (cityId === null) {
        await AsyncStorage.removeItem(CITY_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(CITY_STORAGE_KEY, cityId.toString());

        // If user is authenticated, update in database
        if (user) {
          updateUserCity(cityId);
        }
      }

      // Reset dormitory selection if city changes
      setSelectedDorm(null);
    } catch (error) {
      console.error("Failed to save city preference:", error);
    }
  };

  // Handler to set selected dormitory
  const setSelectedDorm = async (dormId: number | null) => {
    try {
      setSelectedDormId(dormId);

      if (dormId === null) {
        await AsyncStorage.removeItem(DORM_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(DORM_STORAGE_KEY, dormId.toString());

        // If user is authenticated, update in database
        if (user && selectedCityId) {
          updateUserDorm(dormId);
        }
      }
    } catch (error) {
      console.error("Failed to save dorm preference:", error);
    }
  };

  // Helper function to get dorms by city
  const dormsByCity = (cityId: number) => {
    return dormitories.filter((dorm) => dorm.cityId === cityId);
  };

  const value = {
    selectedCityId,
    selectedDormId,
    setSelectedCity,
    setSelectedDorm,
    loading,
    cities,
    dorms: dormitories,
    dormsByCity,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Custom hook to use the context
export const useUserPreferences = (): UserPreferencesContextProps => {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }

  return context;
};

export default useUserPreferences;
