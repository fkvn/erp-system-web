import { Flex, Table } from "antd";
import Title from "antd/lib/typography/Title";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FIXED_COLUMN_INX } from "../../Util/constants";
import { testUsers } from "../../Util/testData";
import ResizableTitle from "./ResizableTitle";

function ViewTable({
	id,
	columns,
	data,
	scrollX = 1000,
	scrollY = 400,
	pageSize = 10,
	currentPage = 1,
	footer = () => <></>,
}) {
	const { t } = useTranslation();
	const [fixedColumnIdx, setFixedColumnIdx] = useState(
		(localStorage.getItem(id) ?? {})?.[`$${FIXED_COLUMN_INX}`] ?? []
	);

	const [tableParams, setTableParams] = useState({
		pagination: {
			current: currentPage,
			pageSize: pageSize,
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]} - ${range[1]}`,
					total: total,
				}),
		},
	});

	const [tableColumns, setTableColumns] = useState(
		columns ?? testUsers.columns ?? []
	);

	const [tableData, setTableData] = useState(data ?? testUsers.data);

	const handleResize =
		(index) =>
		(_, { size }) => {
			const newColumns = [...tableColumns];
			newColumns[index] = {
				...newColumns[index],
				width: size.width,
			};
			setTableColumns(newColumns);
		};

	const transformedColumns = tableColumns.map((col, index) => ({
		...col,
		width: col.width ?? 200,
		// set fixed column
		fixed: fixedColumnIdx.includes(index) ? "left" : undefined,
		// enable resize header
		onHeaderCell: (column) => ({
			width: column.width,
			onResize: handleResize(index),
		}),
	}));

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

	return (
		<Table
			id={id}
			className="w-100"
			bordered
			virtual
			title={TbHeader}
			components={{
				header: {
					cell: ResizableTitle,
				},
			}}
			scroll={{
				x: scrollX,
				y: scrollY,
			}}
			columns={transformedColumns}
			dataSource={tableData}
			style={{ zIndex: 0 }}
			size="large"
			rowKey={(record) => record.key}
			pagination={tableParams.pagination}
			footer={footer}
		/>
	);
}
export default ViewTable;
