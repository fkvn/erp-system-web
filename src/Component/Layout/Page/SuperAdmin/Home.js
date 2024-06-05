import { Skeleton } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
	SUPER_ADMIN_PATH,
	USER,
	USERS,
	USERS_PATH,
} from "../../../../Util/constants";
import useMessage from "../../../Hook/MessageHook/useMessage";
import FixedSiderLayout from "../../FixedSiderLayout";
import Header from "../External/Header";

function Home() {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { superAdmin: isUserSuperAdmin = false } =
		useSelector((state) => state[`${USER}`]) ?? {};
	const { errorMessage } = useMessage();

	useEffect(() => {
		if (!isUserSuperAdmin) errorMessage(t("access_forbidden_msg"), 0);
		// default
		if (pathname === SUPER_ADMIN_PATH) navigate(USERS_PATH.slice(1));
	}, [isUserSuperAdmin, errorMessage, t, navigate, pathname]);

	const sideMenuItems = [
		{
			key: USERS,
			label: t("dashboard_msg", {
				subject: t("user_msg"),
			}),
		},
	];

	const sideMenuKeys = [
		{
			[`${SUPER_ADMIN_PATH}${USERS_PATH}`]: USERS,
		}[pathname],
	];

	const sider = {
		items: sideMenuItems,
		itemSelectedKeys: sideMenuKeys ?? [],
	};

	const App = () =>
		isUserSuperAdmin ? (
			<FixedSiderLayout sider={sider} content={<Outlet />} />
		) : (
			<>
				<Header />
				<Skeleton active />
			</>
		);
	return <App />;
}

export default Home;
