import { Avatar, Button, Flex, List } from "antd";
import Title from "antd/lib/typography/Title";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { USER } from "../../../../../Util/constants";
import useAuth from "../../../../Hook/AuthHook/useAuth";
import NoResult from "../../../../NotFound/NoResult";
import Header from "../Header";

function SelectCompany() {
	const { t } = useTranslation();
	const { signout } = useAuth();
	const {
		superAdmin: isUserSuperAdmin = false,
		companies: accessCompanies = [],
	} = useSelector((state) => state[`${USER}`]) ?? {};

	const SignOut = () => (
		<>
			<Button type="link" className="c-red1" onClick={() => signout(true)}>
				{t("sign_out_msg")}
			</Button>
		</>
	);

	const CompanyList = () =>
		(accessCompanies ?? []).length > 0 ? (
			<List
				pagination={{
					position: "bottom",
					align: "center",
					pageSize: 10,
					hideOnSinglePage: true,
				}}
				dataSource={accessCompanies}
				renderItem={(item, index) => (
					<List.Item key={index}>
						<List.Item.Meta
							avatar={<Avatar src={`${item.logo}`} />}
							title={<Link to={`${item.id}`}>{item.title}</Link>}
						/>
					</List.Item>
				)}
			/>
		) : (
			<NoResult />
		);

	// const registerCompanyBtn = (
	// 	<SubmitBtnFormControl
	// 		tooltipTitle={!isUserSuperAdmin && t("access_forbidden_msg")}
	// 		disabled={!isUserSuperAdmin}
	// 		onClick={() => navigate("/register-company")}
	// 		title={t("register_company_msg")}
	// 	/>
	// );

	const superAdminBtn = isUserSuperAdmin && (
		<Link className="text-center w-100" to={`admin`}>
			{t("admin_portal_msg")}
		</Link>
	);

	const App = () => (
		<>
			<Header
				closeBtn={true}
				extra={
					<>
						<SignOut />
					</>
				}
			/>
			<Flex
				justify="center"
				align="center"
				style={{
					margin: "5rem 1rem",
				}}
			>
				<Flex
					vertical
					style={{
						minWidth: "20rem",
						maxWidth: "95%",
					}}
					gap={20}
				>
					<Title level={2} className="text-center">
						{t("select_company_msg")}
					</Title>
					<CompanyList />
					{superAdminBtn}
				</Flex>
			</Flex>
		</>
	);
	return <App />;
}

export default SelectCompany;
