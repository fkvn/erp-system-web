import { Empty, Flex } from "antd";
import { useTranslation } from "react-i18next";

function NoResult(props) {
	const { t } = useTranslation();
	const App = () => (
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
			{...props}
		/>
	);
	return <App />;
}

export default NoResult;
