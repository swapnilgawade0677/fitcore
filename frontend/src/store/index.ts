import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import membersReducer from './membersSlice';
import trainersReducer from './trainersSlice';
import plansReducer from './plansSlice';
import attendanceReducer from './attendanceSlice';
import paymentsReducer from './paymentsSlice';
import equipmentReducer from './equipmentSlice';
import workoutsReducer from './workoutsSlice';
import dashboardReducer from './dashboardSlice';
import inquiriesReducer from './inquiriesSlice';
import feedbacksReducer from './feedbacksSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    trainers: trainersReducer,
    plans: plansReducer,
    attendance: attendanceReducer,
    payments: paymentsReducer,
    equipment: equipmentReducer,
    workouts: workoutsReducer,
    dashboard: dashboardReducer,
    inquiries: inquiriesReducer,
    feedbacks: feedbacksReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;