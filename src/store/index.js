import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import usersReducer from './slices/usersSlice'
import dropsReducer from './slices/dropsSlice'
import collectionsReducer from './slices/collectionsSlice'
import postsReducer from './slices/postsSlice'
import feesReducer from './slices/feesSlice'
import settingsReducer from './slices/settingsSlice'
import rewardsReducer from './slices/rewardsSlice'
import walletsReducer from './slices/walletsSlice'
import bannersReducer from './slices/bannersSlice'
import treasuryReducer from './slices/treasurySlice'
import rewardsDistributionReducer from './slices/rewardsDistributionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    drops: dropsReducer,
    collections: collectionsReducer,
    posts: postsReducer,
    fees: feesReducer,
    settings: settingsReducer,
    rewards: rewardsReducer,
    wallets: walletsReducer,
    banners: bannersReducer,
    treasury: treasuryReducer,
    rewardsDistribution: rewardsDistributionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setQrData'],
        ignoredPaths: ['auth.qrData'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export default store
