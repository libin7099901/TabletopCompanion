// 🏗️ Redux Store 配置

import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './roomStore';

export const store = configureStore({
  reducer: {
    room: roomReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 