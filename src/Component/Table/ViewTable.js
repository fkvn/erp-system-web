import { RiEqualizer2Line, RiFilter2Line } from "@remixicon/react";
import { Button, Divider, Flex, Form, Modal, Switch, Table } from "antd";
import Title from "antd/lib/typography/Title";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
	FIXED_COLUMN_INDEXES,
	HIDDEN_COLUMN_INDEXES,
} from "../../Util/constants";
import useMessage from "../Hook/MessageHook/useMessage";
import NoResult from "../NotFound/NoResult";
import ResizableTitle from "./ResizableTitle";

function ViewTable({
	id,
	data = [], // Initial data (optional)
	columns = [],
	isLoading = true,
	isSuccess = false,
	isError = false,
	error = "",
	scrollX = 1000,
	scrollY = 400,
	pageSize = 1,
	currentPage = 1,
	rowKey = (record) => record?.id || "",
	footer = () => <></>,
	filterChildren, // Filter modal children
	filterForm, // Form instance from Antd's useForm
	fetchData = async () => {}, // Function to trigger fetching data,
	defaultFixedColumnIdx = [],
}) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const [fixedColumnIdx, setFixedColumnIdx] = useState(
		JSON.parse(localStorage.getItem(id) ?? "{}")[`${FIXED_COLUMN_INDEXES}`] ||
			defaultFixedColumnIdx ||
			[]
	);
	const [hiddenColumnIdx, setHiddenColumnIdx] = useState(
		JSON.parse(localStorage.getItem(id) ?? "{}")[`${HIDDEN_COLUMN_INDEXES}`] ??
			[]
	);
	const { fetchResult: tableData = [], totalCount = 1 } = data;
	const [searchParams] = useSearchParams();
	const page = searchParams.get("page") || currentPage || 1;
	const limit = searchParams.get("limit") || pageSize || 10;
	const filterParams = Object.fromEntries(
		[...searchParams].filter(
			([key]) => !["page", "limit", "sortBy", "sortByOrder"].includes(key)
		)
	);

	const [tableParams, setTableParams] = useState({
		pagination: {
			pageSizeOptions: [5, 10, 20, 50, 100],
			showQuickJumper: true,
			showSizeChanger: true,
			current: parseInt(page),
			pageSize: parseInt(limit),
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]} - ${range[1]}`,
					total: total,
				}),
			total: totalCount || 1,
		},
		filter: {
			...filterParams, // Extract other params as filter
		},
	});

	const [tableColumns, setTableColumns] = useState(columns || []); // Start with empty columns

	useEffect(() => {
		if (tableData?.length > 0) {
			setTableParams({
				...tableParams,
				pagination: {
					...tableParams.pagination,
					total: totalCount, // Update total count for pagination
				},
			});
		}
	}, [data]);

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
		// Apply hidden from the state
		hidden: hiddenColumnIdx.includes(index),
	}));

	const isFilterOrSortingOn = () =>
		Object.keys(tableParams?.filter)?.length > 0;

	const isColumnSettingOn = () =>
		fixedColumnIdx?.length > 0 || hiddenColumnIdx?.length > 0;

	const TbHeader = () => (
		<Flex
			className="w-100"
			style={{
				minHeight: "2rem",
			}}
			justify="space-between"
		>
			<Title level={4}>User List</Title>
			<Flex gap={10}>
				<Button
					type={`${isFilterOrSortingOn() ? "primary" : "link"}`}
					onClick={() => setIsModalVisible(true)}
				>
					<RiFilter2Line />{" "}
					{Object.keys(filterParams)?.length > 0
						? Object.keys(filterParams)?.length
						: ""}{" "}
					Filter
				</Button>
				<Button
					type={`${isColumnSettingOn() ? "primary" : "link"}`}
					onClick={() => setIsSettingModalVisible(true)}
				>
					<RiEqualizer2Line /> Columns
				</Button>
			</Flex>
		</Flex>
	);

	const setDefaultFilterFormFields = () => {
		const updatedFilterParams = Object.keys(filterParams).reduce(
			(r, k) => ({
				...r,
				[k]: filterParams[k]?.includes(",")
					? filterParams[k].split(",")
					: filterParams[k],
			}),
			[]
		);

		filterForm.setFieldsValue(updatedFilterParams);
	};

	useEffect(() => {
		setDefaultFilterFormFields();
		fetchTableData();
	}, []);

	const { errorMessage } = useMessage();

	if (isError) {
		errorMessage(error);
	}

	const fetchTableData = async () => {
		const { filter, pagination } = tableParams;
		const queryParams = new URLSearchParams();

		// Loop through each filter property in tableParams.filter
		Object.entries(filter).forEach(([filterKey, filterValue]) => {
			if (filterValue) {
				// Check if filter value exists
				queryParams.append(filterKey, filterValue);
			}
		});

		queryParams.append("page", pagination.current);
		queryParams.append("limit", pagination.pageSize);

		fetchData(queryParams);
	};

	const handleTableChange = (pagination, _, sorter) => {
		console.log(sorter);

		const queryParams = new URLSearchParams();

		queryParams.append("page", pagination.current);
		queryParams.append("limit", pagination.pageSize);

		navigate(`${pathname}?${queryParams.toString()}`);

		// setTableParams({
		// 	...tableParams,
		// 	pagination: {
		// 		...tableParams.pagination,
		// 		current: pagination.current,
		// 		pageSize: pagination.pageSize,
		// 	},
		// });
	};

	const [isModalVisible, setIsModalVisible] = useState(false);

	const handleModalOk = () => {
		const { pagination } = tableParams;
		const filters = filterForm?.getFieldsValue() || {};
		const queryParams = new URLSearchParams();
		// Loop through each filter property in tableParams.filter
		Object.entries(filters).forEach(([filterKey, filterValue]) => {
			if (filterValue?.length > 0) {
				queryParams.append(filterKey, filterValue);
			}
		});
		queryParams.append("page", pagination.current);
		queryParams.append("limit", pagination.pageSize);
		navigate(`${pathname}?${queryParams.toString()}`);

		setIsModalVisible(false);
	};

	const handleModalCancel = () => {
		const resetFilterParams = Object.keys(tableParams?.filter).reduce(
			(r, k) => ({
				...r,
				[k]: filterParams[k]?.includes(",")
					? filterParams[k].split(",")
					: filterParams[k],
			}),
			[]
		);

		filterForm.setFieldsValue(resetFilterParams);

		setIsModalVisible(false);
	};

	const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);

	const handleSettingModalOk = () => {
		// Update localStorage with fixed and hidden columns
		localStorage.setItem(
			id,
			JSON.stringify({
				[`$${FIXED_COLUMN_INDEXES}`]: fixedColumnIdx,
				[`$${HIDDEN_COLUMN_INDEXES}`]: hiddenColumnIdx,
			})
		);
		// Update the tableColumns based on fixed and hidden columns
		setTableColumns(
			tableColumns.map((col, index) => ({
				...col,
				fixed: fixedColumnIdx.includes(index) ? "left" : undefined,
				hidden: hiddenColumnIdx.includes(index),
			}))
		);
		setIsSettingModalVisible(false);
	};

	const handleSettingModalCancel = () => {
		setIsSettingModalVisible(false);
	};

	const handleFixedColumnChange = (index) => {
		// Toggle fixed column index
		if (fixedColumnIdx.includes(index)) {
			setFixedColumnIdx(fixedColumnIdx.filter((i) => i !== index));
		} else {
			setFixedColumnIdx([...fixedColumnIdx, index]);
		}
	};

	const handleHiddenColumnChange = (index) => {
		// Toggle hidden column index
		if (hiddenColumnIdx.includes(index)) {
			setHiddenColumnIdx(hiddenColumnIdx.filter((i) => i !== index));
		} else {
			setHiddenColumnIdx([...hiddenColumnIdx, index]);
		}
	};

	return (
		<>
			<Table
				id={id}
				className="w-100"
				loading={isLoading}
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
				rowKey={rowKey}
				pagination={tableParams.pagination}
				footer={footer}
				onChange={handleTableChange}
			/>

			{/* Filter & Sorting Modal */}
			<Modal
				title={
					<Flex gap={10}>
						Filter{" "}
						<Button
							type="link"
							className="m-0 p-0"
							onClick={() => filterForm?.resetFields()}
						>
							<span style={{ fontSize: ".8rem", paddingBottom: ".2rem" }}>
								Clear Filter
							</span>
						</Button>
					</Flex>
				}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={handleModalCancel}
				footer={[
					<Button key="back" onClick={handleModalCancel}>
						Cancel
					</Button>,
					...(filterChildren
						? [
								<Button key="submit" type="primary" onClick={handleModalOk}>
									Apply
								</Button>,
							]
						: []),
				]}
				loading={isLoading}
			>
				<Divider className="m-0" />
				{filterChildren ?? <NoResult />}
			</Modal>

			{/* Setting Modal */}
			<Modal
				title="Column Settings"
				open={isSettingModalVisible}
				onOk={handleSettingModalOk}
				onCancel={handleSettingModalCancel}
				footer={[
					<Button key="back" onClick={handleSettingModalCancel}>
						Close
					</Button>,
				]}
			>
				<Divider className="m-0" />
				<Form layout="vertical" className="py-2">
					<Flex
						gap={20}
						align="center"
						// justify="space-between"
						className="my-2"
						wrap
					>
						{tableColumns.map((col, index) => (
							<Flex
								key={index}
								gap={20}
								vertical
								align=""
								className="my-2"
								wrap
							>
								<Title level={5} className=" m-0">
									{col?.title}
								</Title>

								<Flex gap={10} align="center">
									<Switch
										checkedChildren={"Fix"}
										unCheckedChildren="UnFix"
										checked={fixedColumnIdx.includes(index)}
										onClick={() => handleFixedColumnChange(index)}
									/>
									<Switch
										checkedChildren={"Hide"}
										unCheckedChildren="Show"
										checked={hiddenColumnIdx.includes(index)}
										onClick={() => handleHiddenColumnChange(index)}
									/>
								</Flex>
							</Flex>
						))}
					</Flex>
				</Form>
			</Modal>
		</>
	);
}

export default ViewTable;
