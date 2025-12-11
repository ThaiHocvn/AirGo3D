import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Panorama {
  id: string;
  name: string;
  url: string;
  isBookmarked?: boolean;
  createdAt?: string;
}

export interface PanoramaState {
  panoramas: Panorama[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: PanoramaState = {
  panoramas: [],
  loading: false,
  error: null,
  hasMore: true,
};

const panoramaSlice = createSlice({
  name: "panoramas",
  initialState,
  reducers: {
    setPanoramas(state, action: PayloadAction<Panorama[]>) {
      state.panoramas = action.payload;
    },
    appendPanoramas(state, action: PayloadAction<Panorama[]>) {
      state.panoramas = [...state.panoramas, ...action.payload];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload;
    },
    updatePanorama(state, action: PayloadAction<Panorama>) {
      const index = state.panoramas.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.panoramas[index] = {
          ...state.panoramas[index],
          ...action.payload,
        };
      }
    },
    removePanorama(state, action: PayloadAction<string>) {
      state.panoramas = state.panoramas.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  setPanoramas,
  appendPanoramas,
  setLoading,
  setError,
  setHasMore,
  updatePanorama,
  removePanorama,
} = panoramaSlice.actions;

export default panoramaSlice.reducer;
