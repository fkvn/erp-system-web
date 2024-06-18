import ViewTable from "./ViewTable";

function UserViewTable() {
	const queryParams = new URLSearchParams();

	queryParams.append("page", 1);
	queryParams.append("limit", 10);

	const fetchUsers = async (queryParams) =>
		await fetch(`http://localhost:8080/api/users?${queryParams.toString()}`, {
			headers: {
				Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkN2ZlMjdhYS01NGJiLTQxOGQtODIzZi1hZGYxNTY3ZjU3MzIiLCJpYXQiOjE3MTg2NjE0MzUsImV4cCI6MTcxODc0NzgzNX0.22SEJUJyfKq31aorAHciAmAalKmphG-avJHo6FZN8ZIp0p4FsxFbu8v42ZHCkDnqi5BrlOmhkeGrV4RlZ7keCQ`,
			},
		}).then((response) => response.json()); // Parse the JSON response

	// const filters = (
	// 	<Form.Item label="status">
	// 		<Select
	// 			mode="multiple" // Allow multiple selections
	// 			value={tableParams.filter[col.dataIndex]}
	// 			onChange={(value) => handleFilterChange(col.dataIndex, value)}
	// 		>
	// 			<Select.Option value="ACTIVE">ACTIVE</Select.Option>
	// 			<Select.Option value="INACTIVE">INACTIVE</Select.Option>
	// 			{/* Add more status options as needed */}
	// 		</Select>
	// 	</Form.Item>
	// );

	return <ViewTable fetchData={fetchUsers} />;
	// return <></>;
}

export default UserViewTable;
