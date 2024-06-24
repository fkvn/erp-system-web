import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./apiConfig";

export const userApi = createApi({
	reducerPath: "userApi",
	baseQuery: axiosBaseQuery(),
	endpoints: (builder) => ({
		findUsers: builder.query({
			query: (params) => {
				const queryParams = new URLSearchParams(params);
				return {
					url: `/users?${queryParams.toString()}`,
				};
			},
		}),
		findUserStatus: builder.query({
			query: () => ({
				url: `/users/status`,
			}),
		}),
	}),
});

export const { useFindUsersQuery, useFindUserStatusQuery } = userApi;
