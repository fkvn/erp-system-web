import { Flex } from "antd";
import FixedFooter from "../../Layout/FixedFooter";
import FixedHeader from "../../Layout/FixedHeader";
import MainContent from "../../Layout/MainContent";

function Users() {
	const App = () => (
		<>
			<FixedHeader />
			<MainContent>
				<Flex>ssss</Flex>
			</MainContent>
			<FixedFooter />
		</>
	);
	return <App />;
}

export default Users;
