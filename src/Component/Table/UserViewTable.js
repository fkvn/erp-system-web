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

function UserViewTable() {
	const { pathname } = useLocation();
	const { id: userId } = useSelector((state) => state[`${USER}`]);
	const { data: status } = useFindUserStatusQuery({}, { skip: false });

	const tableId = `${userId}_${pathname.slice(1)}_${USER_VIEW_TABLE}`;

	const {
		pagination,
		filter = {},
		sorter,
	} = JSON.parse(localStorage.getItem(tableId) ?? "{}");

	const fetchParams = (pagination, filter, sorter) => {
		const params = {
			page: pagination?.current || 1,
			limit: pagination?.pageSize || 10,
			...(filter?.status?.length > 0 && { status: filter?.status }),
			...(sorter?.length > 0 &&
				sorter.reduce(
					({ sortBy = [], sortOrder = [] }, s) => ({
						sortBy: [...sortBy, s.columnKey],
						sortOrder: [...sortOrder, s.order === "ascend" ? "ASC" : "DESC"],
					}),
					{}
				)),
		};

		return params;
	};

	const [params, setParams] = useState(fetchParams(pagination, filter, sorter));

	const {
		isLoading,
		isError,
		error,
		data: { fetchResult = [], totalCount = 1 } = {},
	} = useFindUsersQuery(params);

	const fetchData = async (params) => {
		setParams(fetchParams(params?.pagination, params?.filter, params?.sorter));
	};

	const baseColumns = [
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
			title: "Created On",
			dataIndex: "createdOn",
			key: "createdOn",
			// render: (_, record) => {
			// 	const { createdOn } = record;
			// 	return <Tooltip title={`${createdOn}`}>{fromNow(createdOn)} </Tooltip>;
			// },
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

	const [filterForm] = useForm();

	// initialize the filter fields
	if (filter) {
		switch (true) {
			case !filter.status:
				filter.status = [];
				break;
			// Add more cases here if needed
		}
	}

	// initialize the filter form
	const formFilter = (
		<Form
			form={filterForm}
			style={{
				margin: "1.5rem 1rem 2rem 0",
			}}
			requiredMark
			initialValues={{
				status: filter?.status || [],
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
			columns={baseColumns}
			isLoading={isLoading}
			fetchData={fetchData}
			data={fetchResult}
			params={{
				pagination: {
					...pagination,
					total: totalCount,
				},
				filter: {
					filter: filter,
					filterForm: formFilter,
					form: filterForm,
				},
			}}
			isError={isError}
			error={error}
		/>
	);
}

export default UserViewTable;
