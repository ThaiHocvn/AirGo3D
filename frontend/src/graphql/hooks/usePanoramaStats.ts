import { useQuery } from "@apollo/client";
import { GET_PANORAMA_STATS } from "../queries";

export function usePanoramaStats() {
  const { data, loading, error, refetch } = useQuery(GET_PANORAMA_STATS);

  return {
    stats: data?.panoramaStats,
    loading,
    error,
    refetch,
  };
}
