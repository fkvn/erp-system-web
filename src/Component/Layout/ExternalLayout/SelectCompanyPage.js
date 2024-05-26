import { Avatar, Button, Empty, Flex, List, Skeleton } from "antd";
import Title from "antd/lib/typography/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useFindAccessibleCompaniesQuery } from "../../../ApiRTKQuery/RTKApi/companyApi";
import { COMPANY_ID, USER } from "../../../Util/constants";
import SubmitBtnFormControl from "../../Form/SubmitBtnFormControl";
import useAuth from "../../Hook/AuthHook/useAuth";
import PageHeader from "./Header/Pageheader";

function SelectCompanyPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { signout } = useAuth();
	const companyId = localStorage.getItem(COMPANY_ID) ?? "";
	const user = useSelector((state) => state[`${USER}`]);

	const SignOut = () => (
		<>
			<Button
				type="link"
				className="c-red1"
				onClick={() => {
					signout();
					window.open("/", "_self");
				}}
			>
				{t("sign_out_msg")}
			</Button>
		</>
	);

	const { isLoading, isSuccess, data } = useFindAccessibleCompaniesQuery(
		user?.id
	);

	const [companies] = useState(data ?? []);

	const CompanyList = () =>
		isLoading ? (
			<Skeleton active />
		) : isSuccess && (companies ?? []).length > 0 ? (
			<List
				pagination={{
					position: "bottom",
					align: "center",
					pageSize: 10,
					hideOnSinglePage: true,
				}}
				dataSource={companies}
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
			<Empty
				description={
					<Flex justify="center" className="text-center c-blue1 my-3">
						<span
							style={{
								maxWidth: "30rem",
							}}
						>
							{t("no_result_msg")}
						</span>
					</Flex>
				}
			/>
		);

	const registerCompanyBtn = (
		<SubmitBtnFormControl
			onClick={() => navigate("/register-company")}
			title={t("register_company_msg")}
		/>
	);

	const superAdminBtn = user.superAdmin && (
		<Link className="text-center w-100" to={`admin`}>
			{t("admin_portal_msg")}
		</Link>
	);

	useEffect(() => {
		if (companyId) navigate(`${companyId}`);
	});

	const App = () => (
		<>
			<PageHeader
				closeBtn={false}
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
					{registerCompanyBtn}
					{superAdminBtn}
				</Flex>
			</Flex>
		</>
	);
	return <App />;
}

export default SelectCompanyPage;
