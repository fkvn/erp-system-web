import { Form, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import { useState } from "react";
import {
	useFindUserStatusQuery,
	useFindUsersQuery,
} from "../../ApiRTKQuery/RTKApi/userApi";
import { fromNow } from "../../Util/util";
import SelectFormControl from "../Form/SelectFormControl";
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

	const [fetchUserStatus, setFetchUserStatus] = useState(false);
	const { data: status } = useFindUserStatusQuery(
		{},
		{ skip: !fetchUserStatus }
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
		{
			title: "Updated By",
			dataIndex: "updatedBy",
			key: "updatedBy",
			render: (_, record) => {
				const { updatedBy, updatedOn } = record;
				return <Tooltip title={`${fromNow(updatedOn)}`}>{updatedBy} </Tooltip>;
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
		<Form
			form={filterForm}
			style={{
				margin: "1.5rem 1rem 2rem 0",
			}}
			requiredMark
		>
			<SelectFormControl
				mode="multiple"
				label="Status"
				itemName="status"
				options={(status ?? []).map((s) => ({
					value: s,
					title: s?.replace("_", " "),
				}))}
				selectProps={{
					className: "mx-4 w-100 ",
					onDropdownVisibleChange: () => setFetchUserStatus(true),
				}}
			/>
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
			isError={isError}
			error={error}
			fetchData={fetchUsers}
			filterForm={filterForm}
			filterChildren={filters}
		/>
	);
	// return <></>;
}

export default UserViewTable;
