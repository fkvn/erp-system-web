import {
	ACCESS_TOKEN,
	PASSWORD_FIELD,
	USERNAME,
	USERNAME_OR_EMAIL_FIELD,
	USER_AUTHORITIES,
} from "../Util/constants";
import axios from "./axios";

export const signInByPasswordAxios = async (credentails = {}) =>
	axios
		.post(`/auth/signin-usernameOrEmail`, {
			usernameOrEmail: credentails[`${USERNAME_OR_EMAIL_FIELD}`],
			password: credentails[`${PASSWORD_FIELD}`],
		})
		.then(({ data }) => {
			const { access_token, authorities, username } = data;
			const signedInUser = {
				[`${ACCESS_TOKEN}`]: access_token,
				[`${USER_AUTHORITIES}`]: authorities,
				[`${USERNAME}`]: username,
			};
			return Promise.resolve(signedInUser);
		})
		.catch((e) => Promise.reject(e));
