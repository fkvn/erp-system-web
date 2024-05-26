import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./apiConfig";

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: axiosBaseQuery(),
	endpoints: (builder) => ({
		signInByPassword: builder.mutation({
			query: (credentials = {}) => ({
				url: `/auth/signin-usernameOrEmail`,
				method: "POST",
				data: credentials,
			}),
		}),
	}),
});

export const { useSignInByPasswordMutation } = authApi;
