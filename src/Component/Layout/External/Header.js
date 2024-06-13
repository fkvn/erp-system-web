import { CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Grid, Image } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { medias } from "../../../Asset/Asset";
import { REDIRECT_URI } from "../../../Util/constants";
import useMessage from "../../Hook/MessageHook/useMessage";
import SwitchLanguage from "../../Lang/SwitchLanguage";

function Header({
	onBeforeClose = () => Promise.resolve(),
	extra = <></>,
	closeBtn = true,
}) {
	const { useBreakpoint } = Grid;
	const screens = useBreakpoint();
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const redirectUri = params.get(REDIRECT_URI) || "/";
	const { destroyMessage } = useMessage();

	const App = () => (
		<>
			<Flex
				justify="space-between"
				align="center"
				style={{
					margin: screens.md ? ".3rem 2rem" : ".3rem 1rem",
				}}
			>
				<Flex justify="space-between" align="center">
					<Link to={"/"}>
						<Image
							alt="Logo"
							src={medias.logo()}
							width={35}
							placeholder={true}
							preview={false}
						/>
					</Link>
				</Flex>

				<Flex justify="space-between" align="center" gap={20}>
					{extra}
					<SwitchLanguage />
					{closeBtn && (
						<Button
							type="primary"
							className="border-0 px-2 mx-2 custom-center bg-red1"
							size="medium"
							icon={<CloseOutlined className="text-white" />}
							onClick={() =>
								onBeforeClose().then(() => {
									destroyMessage();
									navigate(`${redirectUri}`);
								})
							}
							style={{ fontSize: "1rem" }}
						/>
					)}
				</Flex>
			</Flex>
			<Divider className="m-0 p-0" />
		</>
	);
	return <App />;
}

export default Header;
