import { Form, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
	useFindUserStatusQuery,
	useFindUsersQuery,
} from "../../ApiRTKQuery/RTKApi/userApi";
import { USER, USER_VIEW_TABLE } from "../../Util/constants";
import { fromNow } from "../../Util/util";
import SelectFormControl from "../Form/SelectFormControl";
import ViewTable from "./ViewTable";

const baseColumns = [
	{
		title: "User Code",
		dataIndex: "userCode",
		key: "userCode",

		defaultSortOrder: "",
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
		title: "Created On",
		dataIndex: "createdOn",
		key: "createdOn",
		render: (_, record) => {
			const { createdOn } = record;
			return <Tooltip title={`${createdOn}`}>{fromNow(createdOn)} </Tooltip>;
		},
	},
	{
		title: "Created By",
		dataIndex: "createdBy",
		key: "createdBy",
		render: (_, record) => {
			const { createdBy } = record;
			return createdBy;
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

function UserViewTable() {
	const { pathname } = useLocation();
	const { id: userId } = useSelector((state) => state[`${USER}`]);
	const { data: status } = useFindUserStatusQuery({}, { skip: false });

	const tableId = `${userId}_${pathname.slice(1)}_${USER_VIEW_TABLE}`;
	const defaultSettings = JSON.parse(localStorage.getItem(tableId) ?? "{}");
	const { pagination, filter, fixedColumnIdx, hiddenColumnIdx, sorter } =
		defaultSettings;

	const fetchParams = (pagination, filter) => ({
		page: pagination?.current,
		limit: pagination?.pageSize,
		...(filter?.status?.length > 0 && { status: filter?.status }),
	});

	const [params, setParams] = useState(fetchParams(pagination, filter));

	const {
		isLoading,
		isError,
		error,
		data: { fetchResult = [], totalCount = 1 } = {},
	} = useFindUsersQuery(new URLSearchParams(params).toString());

	const fetchData = async (params) => {
		setParams(fetchParams(params?.pagination, params?.filter));
	};

	const columns = (defaultSettings?.columns || baseColumns)?.map((c) => ({
		...c,
		// Find the sorter object that matches the current column's key
		defaultSortOrder: sorter?.find((s) => s.columnKey === c.key)?.order,
	}));

	const [filterForm] = useForm();
	const filters = (
		<Form
			form={filterForm}
			style={{
				margin: "1.5rem 1rem 2rem 0",
			}}
			requiredMark
			initialValues={{
				status: defaultSettings?.filter?.status || [],
			}}
		>
			<SelectFormControl
				mode="multiple"
				label="Status"
				itemName="status"
				allowClear={true}
				options={status?.map((s) => ({
					value: s,
					title: s?.replace("_", " "),
				}))}
				selectProps={{
					className: "mx-4 w-100 ",
				}}
			/>
		</Form>
	);

	return (
		<ViewTable
			id={tableId}
			columns={columns}
			columnsSetting={{ fixedColumnIdx, hiddenColumnIdx }}
			isLoading={isLoading}
			fetchData={fetchData}
			data={fetchResult}
			pagination={{
				...pagination,
				total: totalCount,
			}}
			isError={isError}
			error={error}
			filter={filter}
			filterForm={filterForm}
			filterChildren={filters}
		/>
	);
}

export default UserViewTable;
