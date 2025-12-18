import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import usersReducer from './slices/usersSlice'
import transactionsReducer from './slices/transactionsSlice'
import leaderboardsReducer from './slices/leaderboardsSlice'
import rewardsReducer from './slices/rewardsSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    transactions: transactionsReducer,
    leaderboards: leaderboardsReducer,
    rewards: rewardsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setQrData'],
        // Ignore these paths in state
        ignoredPaths: ['auth.qrData'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export default store
