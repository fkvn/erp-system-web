import { FloatButton } from "antd";
import { useTranslation } from "react-i18next";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { SIGN_IN_PATH } from "../../Util/constants";
import Auth from "../Auth/Auth";
import SelectCompanyPage from "../Layout/ExternalLayout/SelectCompanyPage";
import SignInPage from "../Layout/ExternalLayout/SignInPage";
import MainLayout from "../Layout/Layout/MainLayout";
import NotFound from "../NotFound/NotFound";
import Oops from "../NotFound/Oops";

function RouteContainer() {
	const { t } = useTranslation();
	// const router = createBrowserRouter(
	// 	[
	// 		{
	// 			path: "/",
	// 			Component: MainLayout,
	// 			children: [
	// 				// Outlet Body
	// 				{ index: true, Component: Home },
	// 				{
	// 					path: `${MY_PROFILE_PATH}`,
	// 					Component: MyProfile,
	// 					handle: {
	// 						// you can put whatever you want on a route handle
	// 						// here we use "crumb" and return some elements,
	// 						// this is what we'll render in the breadcrumbs
	// 						// for this route
	// 						crumb: () => {
	// 							return { path: MY_PROFILE_PATH, title: t("my_profile_msg") };
	// 						},
	// 					},
	// 				},
	// 				{
	// 					path: HELP_CENTER_PATH,
	// 					Component: HelpCenter,
	// 					handle: {
	// 						// you can put whatever you want on a route handle
	// 						// here we use "crumb" and return some elements,
	// 						// this is what we'll render in the breadcrumbs
	// 						// for this route
	// 						crumb: () => {
	// 							return { path: HELP_CENTER_PATH, title: t("help_center_msg") };
	// 						},
	// 					},
	// 				},
	// 				{
	// 					path: GUIDE_BOOK_PATH,
	// 					Component: GuideBookRoute,
	// 					handle: {
	// 						crumb: () => {
	// 							return {
	// 								path: GUIDE_BOOK_PATH,
	// 								title: t("thai_guide_book_msg"),
	// 							};
	// 						},
	// 					},
	// 					children: [
	// 						{ index: true, Component: GuideBookDashBoard },
	// 						{
	// 							path: `:id`,
	// 							Component: GuideBookDetail,
	// 						},
	// 					],
	// 				},
	// 				{ path: `${TERM_PATH}`, Component: Term },
	// 				{ path: `${POLICY_PATH}`, Component: Policy },
	// 			],
	// 			handle: {
	// 				crumb: () => {
	// 					return { path: "/", title: t("home_msg") };
	// 				},
	// 			},
	// 		},
	// 		{ path: SIGN_UP_PATH, Component: Signup },
	// 		{ path: SIGN_IN_PATH, Component: Signin },
	// 		{ path: FORGOT_PASSWORD_PATH, Component: ForgotPasswordContainer },
	// 		{ path: GUIDE_BOOK_NEW_POST_PATH, Component: NewGuideBookPost },
	// 		{
	// 			path: `${GUIDE_BOOK_EDIT_POST_PATH}/:id`,
	// 			Component: EditGuideBookPost,
	// 		},

	// 		{ path: "*", Component: NotFound },
	// 	].map((v) => {
	// 		return { ...v, errorElement: Oops };
	// 	})
	// );

	const router = createBrowserRouter(
		[
			{ path: SIGN_IN_PATH, Component: SignInPage },
			{
				path: "/",
				element: (
					<Auth>
						<Outlet />
					</Auth>
				),
				children: [
					{
						id: "index",
						path: "/",
						element: <SelectCompanyPage />,
						handle: {
							// you can put whatever you want on a route handle
							// here we use "crumb" and return some elements,
							// this is what we'll render in the breadcrumbs
							// for this route
							crumb: () => {
								return { path: "/", title: t("home_msg") };
							},
						},
					},
					{
						path: "*",
						element: <MainLayout />,
					},
				],
			},
			{ path: "*", Component: NotFound },
		].map((v) => {
			return { ...v, errorElement: Oops };
		})
	);

	const App = () => (
		<>
			<main id="main">
				<RouterProvider router={router} />
				<FloatButton.BackTop
					visibilityHeight={100}
					style={{
						width: "3rem",
						height: "3rem",
						right: "3%",
					}}
				/>
			</main>
		</>
	);

	return <App />;
}

export default RouteContainer;
