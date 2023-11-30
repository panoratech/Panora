import { HookBaseReturn } from '@/types';
import config from '@/utils/config';
import { useState } from 'react';


//TODO: import from shared type 
export interface Job {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}
 
export interface FMReturnType extends HookBaseReturn {
  mappings: Job[];
  standardObjects: string[];
  fetchMappings: () => Promise<void>;
  fetchStandardObjects: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMapping: (id: string) => Promise<any>;
}

type FMReturnFunction = () => FMReturnType;


const useFieldMappings: FMReturnFunction = () => {
  const [mappings, setMappings] = useState<Job[]>([]);
  const [standardObjects, setStandardObjects] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/field-mapping/attribute`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMappings(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  const fetchStandardObjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/field-mapping/entities`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStandardObjects(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  //TODO
  const getMapping = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/field-mapping/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { mappings, isLoading, error, fetchMappings, standardObjects, fetchStandardObjects, getMapping };
};

export default useFieldMappings;
