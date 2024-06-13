import { UserOutlined } from "@ant-design/icons";
import { Avatar, Flex, Layout, Menu, Tooltip, Typography } from "antd";
import Sider from "antd/lib/layout/Sider";
import { Footer } from "antd/lib/layout/layout";
import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { USER } from "../../../Util/constants";

function PageLayout({
	siderWidth = 220,
	props = {},
	items = [],
	itemSelectedKeys = [],
	menuProps = {},
}) {
	const { username: userUsername = "", avatarUrl: userAvatarUrl = "" } =
		useSelector((state) => state[`${USER}`]) ?? {};

	const FixedSider = () => (
		<Sider
			style={{
				overflow: "auto",
				height: "100vh",
				position: "fixed",
				left: 0,
				top: 0,
				bottom: 0,
				padding: ".5rem 1rem",
			}}
			width={siderWidth ?? 220}
			{...(props ?? {})}
		>
			<Flex align="center" gap={5} className="mb-1">
				<Avatar
					size="medium"
					{...(userAvatarUrl
						? {
								src: <img src={userAvatarUrl} alt="avatar" />,
							}
						: { icon: <UserOutlined /> })}
				/>
				<Tooltip title={userUsername} placement="bottomLeft">
					<Typography.Text className="c-white-important m-0 w-100" ellipsis>
						{userUsername}
					</Typography.Text>
				</Tooltip>
			</Flex>
			<Menu
				theme="dark"
				mode="inline"
				items={items ?? []}
				defaultSelectedKeys={itemSelectedKeys ?? []}
				{...(menuProps ?? {})}
			/>
			<Footer
				style={{
					textAlign: "center",
					position: "fixed",
					left: 0,
					bottom: 0,
					zIndex: 1,
					width: siderWidth ?? 220,
					display: "flex",
					alignItems: "center",
					padding: "0 .5rem",
					backgroundColor: "ghostWhite",
				}}
			>
				<Typography.Text className="text-center w-100">
					TEDKVN ©2024
				</Typography.Text>
			</Footer>
		</Sider>
	);

	const RightContent = () => (
		<Layout style={{ marginLeft: siderWidth ?? 220 }}>
			<Outlet />
		</Layout>
	);

	const App = () => (
		<Layout hasSider>
			<FixedSider />
			<RightContent />
		</Layout>
	);

	return <App />;
}

export default PageLayout;
