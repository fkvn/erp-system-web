import { Flex } from "antd";
import UserViewTable from "../../../../../Table/UserViewTable";
import FixedFooter from "../../Layout/FixedFooter";
import FixedHeader from "../../Layout/FixedHeader";
import MainContent from "../../Layout/MainContent";

function Users() {
	const App = () => (
		<>
			<FixedHeader />
			<MainContent>
				<Flex className="w-100">{<UserViewTable />}</Flex>
			</MainContent>
			<FixedFooter />
		</>
	);
	return <App />;
}

export default Users;
