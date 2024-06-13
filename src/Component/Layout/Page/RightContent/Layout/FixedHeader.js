import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Flex, Select, Typography } from "antd";
import { Header } from "antd/lib/layout/layout";
import Title from "antd/lib/typography/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { COMPANY_ID, USER } from "../../../../../Util/constants";
import useAuth from "../../../../Hook/AuthHook/useAuth";

function FixedHeader({ message = "", extra = <></> }) {
	const { t } = useTranslation();
	const { signout } = useAuth();
	const {
		superAdmin: isUserSuperAdmin = false,
		companies: accessCompanies = [],
	} = useSelector((state) => state[`${USER}`]) ?? {};

	const [activeCompany, setActiveCompany] = useState(
		// id, label are from the api, adjust if needed
		accessCompanies?.flatMap(({ id, label }) =>
			id === (localStorage.getItem(COMPANY_ID) ?? 7)
				? {
						label: label,
					}
				: []
		)[0] ?? null
	);

	const App = () => (
		<Header
			style={{
				position: "sticky",
				top: 0,
				zIndex: 1,
				width: "100%",
				display: "flex",
				alignItems: "center",
				padding: ".2rem 0",
				backgroundColor: "ghostwhite",
			}}
		>
			<Flex
				className="w-100 c-orange1 m-0"
				justify="space-between"
				align="center"
			>
				<Select
					labelInValue
					variant="borderless"
					defaultValue={
						activeCompany ?? {
							label: "ERP System Management",
						}
					}
					style={{ maxWidth: 300 }}
					onChange={(value) => {
						console.log(value);
					}}
					disabled={isUserSuperAdmin}
					options={accessCompanies ?? []}
					labelRender={({ label }) => (
						<Title level={5} className=" m-0 p-2">
							{label || "ERP System Management"}
						</Title>
					)}
					suffixIcon={isUserSuperAdmin || <DownOutlined />}
				/>
				<Title level={4} className="c-red3-important m-0">
					{message}
				</Title>
				<Flex gap={5}>
					{extra}
					<Button type="link" className="c-red1" onClick={() => signout(true)}>
						<Flex gap={5}>
							<Typography.Text className="c-red1 text-center w-100">
								{t("sign_out_msg")}
							</Typography.Text>
							<LogoutOutlined />
						</Flex>
					</Button>
				</Flex>
			</Flex>
		</Header>
	);

	return <App />;
}

export default FixedHeader;
