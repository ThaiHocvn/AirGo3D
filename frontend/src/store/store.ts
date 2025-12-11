import { configureStore } from "@reduxjs/toolkit"
import panoramaReducer from "./slices/panoramaSlice"

export const store = configureStore({
  reducer: {
    panorama: panoramaReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch



