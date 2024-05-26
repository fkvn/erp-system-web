import {
	AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	ShopOutlined,
	TeamOutlined,
	UploadOutlined,
	UserOutlined,
	VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import Title from "antd/lib/typography/Title";
import React from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { USER } from "../../../Util/constants";

function MainLayout() {
	const { t } = useTranslation();
	const { Header, Content, Footer, Sider } = Layout;
	const items = [
		UserOutlined,
		VideoCameraOutlined,
		UploadOutlined,
		BarChartOutlined,
		CloudOutlined,
		AppstoreOutlined,
		TeamOutlined,
		ShopOutlined,
	].map((icon, index) => ({
		key: String(index + 1),
		icon: React.createElement(icon),
		label: `nav ${index + 1}`,
	}));

	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	const sideMenuItems = [
		{
			key: USER,
			icon: <UserOutlined />,
			label: t("user_msg"),
		},
	];

	const LeftFixedSider = () => (
		<Sider
			style={{
				overflow: "auto",
				height: "100vh",
				position: "fixed",
				left: 0,
				top: 0,
				bottom: 0,
				paddingTop: "1rem",
			}}
		>
			<Title level={3} className="c-orange-important text-center">
				{" "}
				ERP System
			</Title>
			<Menu theme="dark" mode="inline" items={sideMenuItems} />
		</Sider>
	);

	const RightContentLayout = () => (
		<Layout style={{ marginLeft: 200 }}>
			<Header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 1,
					width: "100%",
					display: "flex",
					alignItems: "center",
					paddingTop: ".5rem",
					paddingBottom: ".5rem",
				}}
			>
				<div className="demo-logo" />
				<Menu
					theme="dark"
					mode="horizontal"
					defaultSelectedKeys={["2"]}
					items={items}
					style={{
						flex: 1,
						minWidth: 0,
					}}
				/>
			</Header>
			<Content style={{ margin: "100px 16px 0", overflow: "initial" }}>
				<Outlet />
			</Content>
			<Footer style={{ textAlign: "center" }}>
				Ant Design ©{new Date().getFullYear()} Created by Ant UED
			</Footer>
		</Layout>
	);

	const App = () => (
		<Layout hasSider>
			<LeftFixedSider />
			<RightContentLayout />
		</Layout>
	);

	return <App />;
}

export default MainLayout;
