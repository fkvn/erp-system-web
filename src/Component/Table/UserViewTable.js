import { Form, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import ViewTable from "./ViewTable";

function UserViewTable() {
	const queryParams = new URLSearchParams();

	queryParams.append("page", 1);
	queryParams.append("limit", 10);

	const fetchUsers = async (queryParams) =>
		await fetch(`http://localhost:8080/api/users?${queryParams.toString()}`, {
			headers: {
				Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkN2ZlMjdhYS01NGJiLTQxOGQtODIzZi1hZGYxNTY3ZjU3MzIiLCJpYXQiOjE3MTg4NTg4NzQsImV4cCI6MTcxODk0NTI3NH0.DWBQGt4FErzGDsubZKCwaLVqK7LNyQinPJpP2Pvs8VFZhuHLenpC1jzGTjs1eZPdKix0AGkNtGIyKrenj5UG5Q`,
			},
		}).then((response) => response.json()); // Parse the JSON response

	const [filterForm] = useForm();

	const filters = (
		<Form form={filterForm} layout="vertical">
			<Form.Item label="status" name={"status"}>
				<Select
					mode="multiple" // Allow multiple selections
					// value={tableParams.filter[col.dataIndex]}
					// onChange={(value) => handleFilterChange(col.dataIndex, value)}
				>
					<Select.Option value="ACTIVE">ACTIVE</Select.Option>
					<Select.Option value="INACTIVE">INACTIVE</Select.Option>
					{/* Add more status options as needed */}
				</Select>
			</Form.Item>
		</Form>
	);

	return (
		<ViewTable
			id={"ss"}
			fetchData={fetchUsers}
			filterForm={filterForm}
			filterChildren={filters}
		/>
	);
	// return <></>;
}

export default UserViewTable;
