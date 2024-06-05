import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Layout, Menu, Tooltip, Typography } from "antd";
import Sider from "antd/lib/layout/Sider";
import { Content, Footer, Header } from "antd/lib/layout/layout";
import Title from "antd/lib/typography/Title";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { USER } from "../../Util/constants";
import useAuth from "../Hook/AuthHook/useAuth";
import NoResult from "../NotFound/NoResult";

function FixedSiderLayout({
	sider = {
		width: 220,
		props: {},
		items: [],
		itemSelectedKeys: [],
		menuProps: {},
	},
	content = {
		marginLeft: 220,
		header: {
			title: "",
			message: "",
			extra: <></>,
		},
		body: null,
		footer: null,
	},
}) {
	const { t } = useTranslation();
	const { signout } = useAuth();
	const { username: userUsername = "", avatarUrl: userAvatarUrl = "" } =
		useSelector((state) => state[`${USER}`]) ?? {};

	const FixedSider = ({ width, props, items, itemSelectedKeys, menuProps }) => (
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
			width={width ?? 220}
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
					width: width ?? 220,
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

	const RightContent = ({ marginLeft, header, body, footer }) => (
		<Layout style={{ marginLeft: marginLeft ?? 220 }}>
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
				{
					<Flex
						className="w-100 c-orange"
						justify="space-between"
						align="center"
						style={{
							margin: "0 2rem",
						}}
					>
						<Title level={5} className=" m-0">
							{header?.title || "ERP System Management"}
						</Title>
						<Title level={4} className="c-red3-important m-0">
							{header?.message}
						</Title>
						<Flex gap={5}>
							{header?.extra}
							<Button
								type="link"
								className="c-red1"
								onClick={() => signout(true)}
							>
								<Flex gap={5}>
									<Typography.Text className="c-red1 text-center w-100">
										{t("sign_out_msg")}
									</Typography.Text>
									<LogoutOutlined />
								</Flex>
							</Button>
						</Flex>
					</Flex>
				}
			</Header>
			<Content
				style={{
					margin: "1rem 2rem",
					overflow: "initial",
					minHeight: "100vh",
				}}
			>
				{body ?? (
					<NoResult
						style={{
							marginTop: "10rem",
						}}
					/>
				)}
			</Content>
			<Footer
				style={{
					textAlign: "center",
					position: "fixed",
					left: 0,
					bottom: 0,
					zIndex: 1,
					width: "100%",
					display: "flex",
					alignItems: "center",
					padding: "0 .5rem",
					backgroundColor: "wheat",
				}}
			>
				{footer}
			</Footer>
		</Layout>
	);

	const App = () => (
		<Layout hasSider>
			<FixedSider {...sider} />
			<RightContent {...content} />
		</Layout>
	);

	return <App />;
}

export default FixedSiderLayout;
