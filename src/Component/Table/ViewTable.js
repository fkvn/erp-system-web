import { Flex, Table } from "antd";
import Title from "antd/lib/typography/Title";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
const columns = [
	{
		title: "Full Name",
		width: 100,
		dataIndex: "name",
		key: "name",
		fixed: "left",
	},
	{
		title: "Age",
		width: 100,
		dataIndex: "age",
		key: "age",
		fixed: "left",
		sorter: true,
	},
	{
		title: "Column 1",
		dataIndex: "address",
		key: "1",
	},
	{
		title: "Column 2",
		dataIndex: "address",
		key: "2",
	},
	{
		title: "Column 3",
		dataIndex: "address",
		key: "3",
	},
	{
		title: "Column 4",
		dataIndex: "address",
		key: "4",
	},
	{
		title: "Column 5",
		dataIndex: "address",
		key: "5",
	},
	{
		title: "Column 6",
		dataIndex: "address",
		key: "6",
	},
	{
		title: "Column 7",
		dataIndex: "address",
		key: "7",
	},
	{
		title: "Column 8",
		dataIndex: "address",
		key: "8",
	},
];
const data = [
	{
		key: "1",
		name: "John Brown",
		age: 32,
		address: "New York Park",
	},
	{
		key: "2",
		name: "Jim Green",
		age: 40,
		address: "London Park",
	},
	{
		key: "3",
		name: "Jim Green",
		age: 40,
		address: "London Park",
	},
];

function ViewTable({ tbHeight = 500 }) {
	const { t } = useTranslation();
	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 10,
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]}-${range[1]}`,
					total: total,
				}),
		},
	});

	const TbHeader = () => (
		<Flex
			className="w-100"
			style={{
				minHeight: "2rem",
			}}
		>
			<Title level={4}>User List</Title>
		</Flex>
	);

	const App = () => (
		<Flex vertical className="w-100">
			<Table
				virtual
				// ref={tblRef}
				title={TbHeader}
				columns={columns}
				scroll={{
					x: 2000,
					y: 400,
				}}
				style={{ zIndex: 0 }}
				size="large"
				rowKey={(record) => record.key}
				dataSource={data ?? []}
				pagination={tableParams.pagination}
				footer={() => "Footer"}
			/>
		</Flex>
	);
	return <App />;
}

export default ViewTable;
