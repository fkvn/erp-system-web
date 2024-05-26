import axios from "axios";
import { ACCESS_TOKEN } from "../../Util/constants";
import { axiosConfig } from "../../serviceEnv";

export const axiosBaseQuery =
	() =>
	async ({ url, method, data, params, headers }) => {
		const accessToken = localStorage.getItem(ACCESS_TOKEN);

		try {
			const result = await axios({
				url: axiosConfig?.baseURL + url,
				method,
				data,
				params,
				headers: {
					Authorization: accessToken ? `Bearer ${accessToken}` : "",
					...headers,
				},
			});
			return { data: result.data };
		} catch (axiosError) {
			const err = axiosError;

			return {
				error:
					err.response?.data?.message ?? err?.code ?? "Please try again later!",
			};
		}
	};
