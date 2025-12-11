import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_PANORAMAS } from "../queries";

import {
  setPanoramas,
  appendPanoramas,
  setLoading,
  setError,
  setHasMore,
  Panorama,
} from "../../store/slices/panoramaSlice";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";

type Vars = {
  search?: string;
  isBookmarked?: boolean;
  limit?: number;
  offset?: number;
};

export function usePanoramas(variables: Vars = {}) {
  const dispatch = useDispatch();

  const isPaginated = typeof variables.limit === "number";

  const finalVars = isPaginated
    ? { limit: variables.limit, offset: variables.offset ?? 0, ...variables }
    : { ...variables };

  const { panoramas, loading, error, hasMore } = useSelector(
    (state: RootState) => state.panorama
  );

  const {
    data,
    loading: apolloLoading,
    error: apolloError,
    fetchMore,
    refetch,
  } = useQuery(GET_PANORAMAS, {
    variables: finalVars,
  });

  useEffect(() => {
    dispatch(setLoading(apolloLoading));
  }, [apolloLoading]);

  useEffect(() => {
    if (apolloError) dispatch(setError(apolloError.message));
  }, [apolloError]);

  useEffect(() => {
    if (data?.panoramas) {
      dispatch(setPanoramas(data.panoramas.items));
      dispatch(
        setHasMore(data.panoramas.items.length >= (finalVars.limit ?? 20))
      );
    }
  }, [data]);

  const loadMore = async () => {
    if (!isPaginated) return;

    const result = await fetchMore({
      variables: {
        ...finalVars,
        offset: panoramas.length,
      },
    });

    const newItems = result.data?.panoramas ?? [];
    dispatch(appendPanoramas(newItems));
    finalVars.limit && dispatch(setHasMore(newItems.length >= finalVars.limit));
  };

  return {
    panoramas,
    total: data?.panoramas?.total ?? 0,
    loading,
    error,
    hasMore,
    fetchMore: isPaginated ? loadMore : undefined,
    refetch,
  };
}
