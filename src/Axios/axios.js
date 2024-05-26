import axios from "axios";
import { SINGED_IN_USER } from "../Util/constants";
import { axiosConfig } from "../serviceEnv";

const instance = axios.create({
	baseURL: axiosConfig?.baseURL || "",
});

const responseHandler = (response) => {
	return response;
};

const errorHandler = async (error) => {
	let message = error.message || "Bad Request";

	if (message === "Network Error" || error.response.status === 502) {
		message =
			"Network Error! The service is down. Please come to visit the site later";
	} else if (error.response.status === 401) {
		// unauthorized
		localStorage.removeItem(SINGED_IN_USER);

		message =
			error.response.data.message ||
			error.response.data.error ||
			"Unauthorized";
	} else if (error?.response?.data?.message) {
		message = error.response.data.message;
	}

	return Promise.reject(message);
};

instance.interceptors.request.use(
	(config) => {
		const signedInUserString = localStorage.getItem(SINGED_IN_USER);

		if (signedInUserString) {
			let access_token = JSON.parse(signedInUserString)["access_token"] || "";
			config.headers.Authorization = `Bearer ${access_token}`;
		}

		return config;
	},
	(error) => Promise.reject(error)
);

instance.interceptors.response.use(
	(response) => responseHandler(response),
	(error) => errorHandler(error)
);

export default instance;
