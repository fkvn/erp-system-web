import { Flex } from "antd";
import ViewTable from "../../../../../Table/ViewTable";
import FixedFooter from "../../Layout/FixedFooter";
import FixedHeader from "../../Layout/FixedHeader";
import MainContent from "../../Layout/MainContent";

function Users() {
	const App = () => (
		<>
			<FixedHeader />
			<MainContent>
				<Flex className="w-100">{<ViewTable />}</Flex>
			</MainContent>
			<FixedFooter />
		</>
	);
	return <App />;
}

export default Users;
