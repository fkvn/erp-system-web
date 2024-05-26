import { createSlice } from "@reduxjs/toolkit";
import { USER } from "../../Util/constants";

const signedInUser = JSON.parse(localStorage.getItem(USER) ?? "{}");

const userSlice = createSlice({
	name: USER,
	initialState: signedInUser,
	reducers: {
		setUser(_state, { payload }) {
			// return new state
			return payload;
		},
	},
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

// https://redux-toolkit.js.org/api/createReducer#direct-state-mutation
