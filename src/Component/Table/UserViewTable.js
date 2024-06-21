import { Form, Select, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import { useState } from "react";
import { useFindUsersQuery } from "../../ApiRTKQuery/RTKApi/userApi";
import { fromNow } from "../../Util/util";
import ViewTable from "./ViewTable";

function UserViewTable() {
	const [fetchData, setFetchData] = useState({
		skip: true,
		params: "",
	});

	const { isLoading, isError, isSuccess, error, data } = useFindUsersQuery(
		fetchData.params,
		{
			skip: fetchData.skip,
		}
	);

	const defaultFixedColumnIdx = [2];

	const columns = [
		{
			title: "User Code",
			dataIndex: "userCode",
			key: "userCode",
		},
		{
			title: "User Name",
			dataIndex: "username",
			key: "username",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Created By",
			dataIndex: "createdBy",
			key: "createdBy",
			render: (_, record) => {
				const { createdBy, createdOn } = record;
				return <Tooltip title={`${fromNow(createdOn)}`}>{createdBy} </Tooltip>;
			},
		},
	];

	const fetchUsers = async (queryParams) => {
		setFetchData({
			skip: false,
			params: queryParams.toString(),
		});
	};

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
			columns={columns}
			isLoading={isLoading}
			defaultFixedColumnIdx={defaultFixedColumnIdx}
			isSuccess={isSuccess}
			data={data}
			error={error}
			fetchData={fetchUsers}
			filterForm={filterForm}
			filterChildren={filters}
		/>
	);
	// return <></>;
}

export default UserViewTable;
