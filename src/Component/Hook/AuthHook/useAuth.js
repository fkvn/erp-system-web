// import { errorMessage } from "../../../RefComponent/Hook/useMessage";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { setUser } from "../../../ApiRTKQuery/RTKSlice/userSlice";
import {
	ACCESS_TOKEN,
	REDIRECT_URI,
	SIGN_IN_PATH,
	USER,
} from "../../../Util/constants";
import { validateToken } from "../../../Util/util";
import useMessage from "../MessageHook/useMessage";

function useAuth() {
	const { errorMessage } = useMessage();
	const dispatch = useDispatch();

	const navigate = useNavigate();
	const [params] = useSearchParams();
	const redirectUri = params.get(REDIRECT_URI) || "/";
	const { pathname } = useLocation();

	const signout = () => {
		localStorage.removeItem(USER);
		localStorage.removeItem(ACCESS_TOKEN);
	};

	const signin = async (
		authState = {},
		forward = true,
		customRedirectUri = ""
	) => {
		const { access_token, ...info } = authState;

		localStorage.setItem(ACCESS_TOKEN, access_token);
		localStorage.setItem(USER, JSON.stringify(info || {}));

		// only store info into the redux, token is kept in localStorage only
		dispatch(setUser(info));

		return forward
			? navigate(`${customRedirectUri || redirectUri}`)
			: Promise.resolve();
	};

	const auth = async (
		throwError = true,
		forward = true,
		customRedirectUri = ""
	) => {
		const access_token = localStorage.getItem(ACCESS_TOKEN);
		const isValidCredential =
			validateToken(access_token || "") ?? localStorage.getItem(USER) ?? false;

		if (isValidCredential)
			return forward
				? navigate(`${customRedirectUri || redirectUri}`)
				: Promise.resolve();

		// else
		signout();
		if (throwError) errorMessage("invalid_token_msg", 2);
		if (forward && pathname !== SIGN_IN_PATH) {
			navigate(
				`${SIGN_IN_PATH}?${REDIRECT_URI}=${customRedirectUri || redirectUri}`
			);
		}

		return Promise.reject("");
	};

	// /**
	//  *
	//  * @param {*} payload  {CHANNEL_PROP, ...payload}
	//  * @param {*} forward
	//  * @returns
	//  */
	// const signup = async (
	// 	channel = EMAIL_PROP,
	// 	credentials = {},
	// 	forward = true
	// ) => {
	// 	return signupAxios(channel, credentials)
	// 		.then(() =>
	// 			successMessage("message_sign_up_success_msg").then(() =>
	// 				signin(
	// 					SIGNIN_CHANNEL_THAINOW,
	// 					{ [`${CHANNEL_PROP}`]: channel, ...credentials },
	// 					forward
	// 				)
	// 			)
	// 		)
	// 		.catch((e) => errorMessage(e).then(() => Promise.reject()));
	// };

	return {
		signout,
		signin,
		auth,
	};
}

export default useAuth;
