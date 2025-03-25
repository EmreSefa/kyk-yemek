import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./useAuth";
import { mealService } from "../../lib/services/mealService";

// Define types for location data
export interface City {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
  cityId: number;
}

export interface Dormitory {
  id: number;
  name: string;
  cityId: number;
  universityId?: number;
  gender?: string;
}

// Define type for user preferences context
interface UserPreferencesContextProps {
  selectedCityId: number | null;
  selectedDormId: number | null;
  selectedUniversityId: number | null;
  setSelectedCity: (cityId: number | null) => Promise<void>;
  setSelectedDorm: (dormId: number | null) => Promise<void>;
  setSelectedUniversity: (universityId: number | null) => Promise<void>;
  loading: boolean;
  cities: City[];
  dorms: Dormitory[];
  universities: University[];
  dormsByCity: (cityId: number, universityId?: number | null) => Dormitory[];
  universitiesByCity: (cityId: number) => University[];
  forceRefreshPreferences: () => Promise<{
    cityId: number | null;
    universityId: number | null;
    dormId: number | null;
  } | null>;
}

// Create context
const UserPreferencesContext =
  createContext<UserPreferencesContextProps | null>(null);

// Mock data for cities and dorms (fallback if API fails)
const CITIES: City[] = [
  { id: 1, name: "Ankara" },
  { id: 2, name: "İstanbul" },
  { id: 3, name: "İzmir" },
  { id: 4, name: "Bursa" },
  { id: 5, name: "Antalya" },
];

const DORMS: Dormitory[] = [
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
const UNIVERSITY_STORAGE_KEY = "kyk_yemek_selected_university";
const DORM_STORAGE_KEY = "kyk_yemek_selected_dorm";

// Fix for type issues with city parsing
const parseCities = (data: any): City[] => {
  console.log("Raw cities data:", JSON.stringify(data, null, 2));

  if (!data || !Array.isArray(data)) {
    console.warn("No city data available or invalid format");
    return [];
  }

  try {
    const parsed = data
      .map((item) => {
        // Check if the required fields exist
        if (item.id === undefined || item.city_name === undefined) {
          console.warn("Missing fields in city data item:", item);
          return null;
        }

        return {
          id: typeof item.id === "number" ? item.id : Number(item.id),
          name:
            typeof item.city_name === "string"
              ? item.city_name
              : String(item.city_name),
        };
      })
      .filter((item): item is City => item !== null); // Type-safe filter

    console.log("Parsed cities:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error("Error parsing cities:", error);
    return [];
  }
};

// Fix for type issues with dormitory parsing
const parseDormitories = (data: any): Dormitory[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  try {
    return data.map((item) => ({
      id: typeof item.id === "number" ? item.id : Number(item.id),
      name:
        typeof item.dorm_name === "string"
          ? item.dorm_name
          : String(item.dorm_name),
      cityId:
        typeof item.city_id === "number" ? item.city_id : Number(item.city_id),
      // universityId is not present in the database, set to undefined
      universityId: undefined,
      gender: item.gender || undefined,
    }));
  } catch (error) {
    console.error("Error parsing dormitories:", error);
    return [];
  }
};

// Fix for university parsing
const parseUniversities = (data: any): University[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  try {
    return data.map((item) => ({
      id: typeof item.id === "number" ? item.id : Number(item.id),
      name: typeof item.name === "string" ? item.name : String(item.name),
      cityId:
        item.city_id !== null && item.city_id !== undefined
          ? typeof item.city_id === "number"
            ? item.city_id
            : Number(item.city_id)
          : 0,
    }));
  } catch (error) {
    console.error("Error parsing universities:", error);
    return [];
  }
};

// Interface for the context value
interface UserPreferencesContextValue {
  // Preferences
  selectedCityId: number | null;
  selectedUniversityId: number | null;
  selectedDormId: number | null;

  // Cities
  cities: City[];
  loading: boolean;
  error: string | null;

  // Universities
  universities: University[];
  universitiesLoading: boolean;
  universitiesByCity: (cityId: number) => University[];

  // Dormitories
  dorms: Dormitory[];
  dormsLoading: boolean;
  dormsByCity: (cityId: number, universityId?: number | null) => Dormitory[];

  // Methods
  setSelectedCity: (cityId: number | null) => Promise<void>;
  setSelectedUniversity: (universityId: number | null) => Promise<void>;
  setSelectedDorm: (dormId: number | null) => Promise<void>;

  // New methods
  forceRefreshPreferences: () => Promise<{
    cityId: number | null;
    universityId: number | null;
    dormId: number | null;
  } | null>;
}

// Provider component
export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth context for checking user state
  const auth = useAuth();
  const user = auth.user;
  // There's no 'error' property in AuthContextProps, use isLoading instead
  const authLoading = auth.isLoading;

  // State for selected preferences
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [selectedDormId, setSelectedDormId] = useState<number | null>(null);

  // Global data state
  const [cities, setCities] = useState<City[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);

        // Try to fetch cities from the meal service
        try {
          const citiesData = await mealService.getCities();
          if (citiesData && citiesData.length > 0) {
            const parsedCities = parseCities(citiesData);
            setCities(parsedCities);
          } else {
            // Fallback to mock data
            setCities(CITIES);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
          // Fallback to mock data
          setCities(CITIES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const cityIdStr = await AsyncStorage.getItem(CITY_STORAGE_KEY);
        const dormIdStr = await AsyncStorage.getItem(DORM_STORAGE_KEY);
        const universityIdStr = await AsyncStorage.getItem(
          UNIVERSITY_STORAGE_KEY
        );

        console.log("Initial preferences from AsyncStorage:", {
          cityIdStr,
          dormIdStr,
          universityIdStr,
        });

        // If user is logged in, try loading their preferences from the database
        if (user && !authLoading) {
          console.log("User is logged in, loading preferences from database");
          await loadUserPreferences();
        } else {
          console.log(
            "User not logged in or auth error, using AsyncStorage only"
          );

          // Validate preferences against the database
          await validateStoredPreferences(
            cityIdStr ? Number(cityIdStr) : null,
            universityIdStr ? Number(universityIdStr) : null,
            dormIdStr ? Number(dormIdStr) : null
          );

          // After validation, set the values from AsyncStorage again to get the corrected values
          const validatedCityId = await AsyncStorage.getItem(CITY_STORAGE_KEY);
          const validatedDormId = await AsyncStorage.getItem(DORM_STORAGE_KEY);
          const validatedUniversityId = await AsyncStorage.getItem(
            UNIVERSITY_STORAGE_KEY
          );

          if (validatedCityId) {
            const cityId = Number(validatedCityId);
            setSelectedCityId(cityId);

            // Load dormitories for the selected city
            if (cityId) {
              loadDormitories(cityId);
            }
          }

          if (validatedDormId) {
            setSelectedDormId(Number(validatedDormId));
          }

          if (validatedUniversityId) {
            setSelectedUniversityId(Number(validatedUniversityId));
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Validate that stored IDs actually exist in the database
  const validateStoredPreferences = async (
    cityId: number | null,
    universityId: number | null,
    dormId: number | null
  ) => {
    try {
      // Validate city ID
      if (cityId) {
        const { data: cityData, error: cityError } = await supabase
          .from("cities")
          .select("id")
          .eq("id", cityId)
          .single();

        if (cityError || !cityData) {
          console.log(`City ID ${cityId} not found in database, resetting`);
          await AsyncStorage.removeItem(CITY_STORAGE_KEY);
          setSelectedCityId(null);
        }
      }

      // Validate university ID
      if (universityId) {
        const { data: uniData, error: uniError } = await supabase
          .from("universities")
          .select("id")
          .eq("id", universityId)
          .single();

        if (uniError || !uniData) {
          console.log(
            `University ID ${universityId} not found in database, resetting`
          );
          await AsyncStorage.removeItem(UNIVERSITY_STORAGE_KEY);
          setSelectedUniversityId(null);

          // Also update the database if user is logged in
          if (user && !authLoading) {
            await supabase
              .from("users")
              .update({ university_id: null })
              .eq("id", user.id);
          }
        }
      }

      // Validate dorm ID
      if (dormId) {
        const { data: dormData, error: dormError } = await supabase
          .from("dormitories")
          .select("id")
          .eq("id", dormId)
          .single();

        if (dormError || !dormData) {
          console.log(`Dorm ID ${dormId} not found in database, resetting`);
          await AsyncStorage.removeItem(DORM_STORAGE_KEY);
          setSelectedDormId(null);

          // Also update the database if user is logged in
          if (user && !authLoading) {
            await supabase
              .from("users")
              .update({ dormitory_id: null })
              .eq("id", user.id);
          }
        }
      }
    } catch (error) {
      console.error("Error validating preferences:", error);
    }
  };

  // Load dormitories for a specific city or use mock data
  const loadDormitories = async (cityId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from mealService
      try {
        const dormsData = await mealService.getDormitories(cityId);

        if (dormsData && dormsData.length > 0) {
          const parsedDorms = parseDormitories(dormsData);
          setDormitories(parsedDorms);
        } else {
          // Filter mock data if no real data
          const filteredDorms = DORMS.filter((dorm) => dorm.cityId === cityId);
          setDormitories(filteredDorms);
        }
      } catch (err) {
        console.error("Failed to load dormitories from service:", err);
        // Filter mock data as fallback
        const filteredDorms = DORMS.filter((dorm) => dorm.cityId === cityId);
        setDormitories(filteredDorms);
      }
    } catch (err) {
      console.error("Failed in loadDormitories:", err);
      setError("Bir hata oluştu");
      // Ensure we always have some data
      const filteredDorms = DORMS.filter((dorm) => dorm.cityId === cityId);
      setDormitories(filteredDorms);
    } finally {
      setLoading(false);
    }
  };

  // Load user preferences
  const loadUserPreferences = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Try directly getting the user preferences - this might fail initially
      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("city_id, dormitory_id, university_id")
          .eq("id", user.id)
          .maybeSingle(); // Use maybeSingle instead of single

        // If we got data, use it
        if (userData) {
          if (userData.city_id) {
            setSelectedCityId(userData.city_id);
            // Load dormitories for this city
            await loadDormitories(userData.city_id);
          }

          if (userData.dormitory_id) {
            setSelectedDormId(userData.dormitory_id);
          }

          if (userData.university_id) {
            setSelectedUniversityId(userData.university_id);
          }
        }
      } catch (err) {
        console.error("Failed to load user preferences:", err);
      }
    } catch (err) {
      console.error("Error in loadUserPreferences:", err);
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Update user city preference in database and storage
  const updateUserCity = async (cityId: number) => {
    try {
      console.log(`Saving city ID ${cityId} to AsyncStorage...`);
      await AsyncStorage.setItem(CITY_STORAGE_KEY, cityId.toString());
      console.log("City saved to AsyncStorage successfully");

      // Clear dorm selection if city changes
      if (
        selectedDormId !== null &&
        dormitories.find((d) => d.id === selectedDormId)?.cityId !== cityId
      ) {
        console.log("City changed, clearing dormitory selection");
        await AsyncStorage.removeItem(DORM_STORAGE_KEY);
        setSelectedDormId(null);
      }

      // Load dormitories for the new city
      await loadDormitories(cityId);

      // Update in database if user is logged in
      if (user && !authLoading) {
        console.log(
          `Updating city_id to ${cityId} in users table for user ID: ${user.id}`
        );
        const { data, error } = await supabase
          .from("users")
          .update({ city_id: cityId, updated_at: new Date() })
          .eq("id", user.id);

        if (error) {
          console.error("Failed to update city in database:", error);
        } else {
          console.log(`Successfully updated city_id to ${cityId} in database`);
        }
      } else {
        console.log(
          "User not logged in or auth error, skipping database update"
        );
      }
    } catch (err) {
      console.error("Failed to update city:", err);
    }
  };

  // Update user university preference in database and storage
  const updateUserUniversity = async (universityId: number) => {
    try {
      console.log(`Saving university ID ${universityId} to AsyncStorage...`);
      await AsyncStorage.setItem(
        UNIVERSITY_STORAGE_KEY,
        universityId.toString()
      );
      console.log("University saved to AsyncStorage successfully");

      // Update in database if user is logged in
      if (user && !authLoading) {
        console.log(
          `Updating university_id to ${universityId} in users table for user ID: ${user.id}`
        );
        const { data, error } = await supabase
          .from("users")
          .update({ university_id: universityId, updated_at: new Date() })
          .eq("id", user.id);

        if (error) {
          console.error("Failed to update university in database:", error);
        } else {
          console.log(
            `Successfully updated university_id to ${universityId} in database`
          );
        }
      } else {
        console.log(
          "User not logged in or auth error, skipping database update"
        );
      }
    } catch (err) {
      console.error("Failed to update university:", err);
    }
  };

  // Update user dorm preference in database and storage
  const updateUserDorm = async (dormId: number) => {
    try {
      await AsyncStorage.setItem(DORM_STORAGE_KEY, dormId.toString());

      // Update in database if user is logged in
      if (user && !authLoading) {
        console.log(
          `Updating dormitory_id to ${dormId} in users table for user ID: ${user.id}`
        );
        const { data, error } = await supabase
          .from("users")
          .update({ dormitory_id: dormId, updated_at: new Date() })
          .eq("id", user.id);

        if (error) {
          console.error("Failed to update dormitory in database:", error);
        } else {
          console.log(
            `Successfully updated dormitory_id to ${dormId} in database`
          );
        }
      }
    } catch (err) {
      console.error("Failed to update dormitory:", err);
    }
  };

  // Public function to set a city
  const setSelectedCity = async (cityId: number | null) => {
    console.log(`Setting selected city to: ${cityId}`);
    setSelectedCityId(cityId);

    if (cityId === null) {
      // Clear saved city
      console.log("Clearing saved city");
      await AsyncStorage.removeItem(CITY_STORAGE_KEY);
      // Clear dorm too
      setSelectedDormId(null);
      await AsyncStorage.removeItem(DORM_STORAGE_KEY);
    } else {
      // Update city preference
      console.log(`Updating city preference to ID: ${cityId}`);
      await updateUserCity(cityId);
    }

    // Log the current state after updating
    console.log("City preference updated. Current state:", {
      selectedCityId: cityId,
      universities: universities.length,
      dorms: dormitories.length,
    });
  };

  // Public function to set a university
  const setSelectedUniversity = async (universityId: number | null) => {
    setSelectedUniversityId(universityId);

    if (universityId === null) {
      // Clear saved university
      await AsyncStorage.removeItem(UNIVERSITY_STORAGE_KEY);
    } else {
      // Update university preference
      await updateUserUniversity(universityId);
    }
  };

  // Public function to set a dorm
  const setSelectedDorm = async (dormId: number | null) => {
    setSelectedDormId(dormId);

    if (dormId === null) {
      // Clear saved dorm
      await AsyncStorage.removeItem(DORM_STORAGE_KEY);
    } else {
      // Update dorm preference
      await updateUserDorm(dormId);
    }
  };

  // Helper to get dorms for a city and optionally university
  const dormsByCity = (cityId: number, universityId?: number | null) => {
    let filteredDorms = dormitories.filter((dorm) => dorm.cityId === cityId);

    // If universityId is provided and we have university-specific dorms, filter further
    if (universityId !== undefined && universityId !== null) {
      const universitySpecificDorms = filteredDorms.filter(
        (dorm) => dorm.universityId === universityId
      );

      // If we have university-specific dorms, return those
      // Otherwise, fall back to all dorms for the city
      if (universitySpecificDorms.length > 0) {
        return universitySpecificDorms;
      }
    }

    return filteredDorms;
  };

  // Load universities for a specific city
  const loadUniversitiesForCity = async (cityId: number) => {
    try {
      console.log(`Loading universities for city ID: ${cityId}...`);
      setLoading(true);
      setError(null);

      // Try to fetch from mealService
      try {
        const universitiesData = await mealService.getUniversities(cityId);
        console.log(
          `Universities data received:`,
          universitiesData ? `${universitiesData.length} items` : "no data"
        );

        if (universitiesData && universitiesData.length > 0) {
          const parsedUniversities = parseUniversities(universitiesData);
          console.log(
            `Successfully parsed ${parsedUniversities.length} universities for city ${cityId}`
          );
          setUniversities(parsedUniversities);
        } else {
          console.warn(`No universities found for city ID: ${cityId}`);
          setUniversities([]);
        }
      } catch (err) {
        console.error(
          `Failed to load universities from service for city ${cityId}:`,
          err
        );
        setUniversities([]);
      }
    } catch (err) {
      console.error(
        `Failed in loadUniversitiesForCity for city ${cityId}:`,
        err
      );
      setError("Bir hata oluştu");
      setUniversities([]);
    } finally {
      setLoading(false);
      console.log(`Finished loading universities for city ${cityId}`);
    }
  };

  // Helper to get universities for a city
  const universitiesByCity = (cityId: number) => {
    return universities.filter((university) => university.cityId === cityId);
  };

  // Add a function to force reload preferences from AsyncStorage
  const forceRefreshPreferences = async () => {
    try {
      console.log("Force refreshing user preferences...");

      // Get from AsyncStorage first
      const cityIdStr = await AsyncStorage.getItem(CITY_STORAGE_KEY);
      const universityIdStr = await AsyncStorage.getItem(
        UNIVERSITY_STORAGE_KEY
      );
      const dormIdStr = await AsyncStorage.getItem(DORM_STORAGE_KEY);

      console.log("Current AsyncStorage values:", {
        cityIdStr,
        universityIdStr,
        dormIdStr,
      });

      if (cityIdStr) {
        const cityId = Number(cityIdStr);
        if (!isNaN(cityId)) {
          setSelectedCityId(cityId);

          // Load dormitories for this city
          await loadDormitories(cityId);

          console.log(`Set city ID to ${cityId}`);
        }
      }

      if (universityIdStr) {
        const universityId = Number(universityIdStr);
        if (!isNaN(universityId)) {
          setSelectedUniversityId(universityId);
          console.log(`Set university ID to ${universityId}`);
        }
      }

      if (dormIdStr) {
        const dormId = Number(dormIdStr);
        if (!isNaN(dormId)) {
          setSelectedDormId(dormId);
          console.log(`Set dormitory ID to ${dormId}`);
        }
      }

      // Only if we have a city ID but not the other values, try the database
      if (cityIdStr && (!universityIdStr || !dormIdStr) && user) {
        await loadUserPreferences();
      }

      return {
        cityId: cityIdStr ? Number(cityIdStr) : null,
        universityId: universityIdStr ? Number(universityIdStr) : null,
        dormId: dormIdStr ? Number(dormIdStr) : null,
      };
    } catch (error) {
      console.error("Error in forceRefreshPreferences:", error);
      return null;
    }
  };

  const contextValue: UserPreferencesContextValue = {
    selectedCityId,
    selectedUniversityId,
    selectedDormId,
    cities,
    universities,
    dorms: dormitories,
    loading,
    error,
    universitiesLoading: loading,
    dormsLoading: loading,
    setSelectedCity,
    setSelectedUniversity,
    setSelectedDorm,
    universitiesByCity,
    dormsByCity,
    forceRefreshPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Hook to use the user preferences context
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
