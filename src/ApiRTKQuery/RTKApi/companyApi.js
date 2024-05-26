import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./apiConfig";

export const companyApi = createApi({
	reducerPath: "companyApi",
	baseQuery: axiosBaseQuery(),
	endpoints: (builder) => ({
		findAccessibleCompanies: builder.query({
			query: (userId = -1) => ({
				url: `/companies?accessibleToUserId=${userId}`,
			}),
		}),
	}),
});

export const { useFindAccessibleCompaniesQuery } = companyApi;
