import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import jwt_decode from "jwt-decode";
dayjs.extend(localizedFormat);

export const validateToken = (access_token = "") => {
	let isValidToken = false;

	if (access_token?.length > 0) {
		try {
			if (jwt_decode(access_token).exp >= Date.now() / 1000) {
				isValidToken = true;
			}
		} catch (e) {
			console.log(e);
		}
	}

	return isValidToken;
};

export const formatDate = (dateString, format = "LLL") => {
	return dayjs(dateString).format(format);
};
