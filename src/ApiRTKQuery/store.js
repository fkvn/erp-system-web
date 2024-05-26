import { configureStore } from "@reduxjs/toolkit";
import { USER } from "../Util/constants";
import { authApi } from "./RTKApi/authApi";
import { companyApi } from "./RTKApi/companyApi";
import userSlice from "./RTKSlice/userSlice";

// Automatically adds the thunk middleware and the Redux DevTools extension
const store = configureStore({
	// Automatically calls `combineReducers`
	reducer: {
		// RTK Query
		[authApi.reducerPath]: authApi.reducer,
		[companyApi.reducerPath]: companyApi.reducer,
		// RTK Slice to mutate reducers
		[`${USER}`]: userSlice,
	},
	// Adding the api middleware enables caching, invalidation, polling,
	// and other useful features of `rtk-query`.
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(authApi.middleware, companyApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch);

export default store;
