import { RiEqualizer2Line, RiFilter2Line } from "@remixicon/react";
import { Button, Flex, Form, Modal, Table } from "antd";
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
	pageSize = 10,
	currentPage = 1,
	rowKey = (record) => record?.id || "",
	footer = () => <></>,
	filterChildren, // Filter modal children
	filterForm, // Form instance from Antd's useForm
	fetchData = async () => {}, // Function to trigger fetching data,
	defaultFixedColumnIdx = [],
}) {
	const { t } = useTranslation();
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

	console.log(data);

	const navigate = useNavigate();
	const { pathname } = useLocation();
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

	const TbHeader = () => (
		<Flex
			className="w-100"
			style={{
				minHeight: "2rem",
			}}
			justify="space-between"
		>
			<Title level={4}>User List</Title>
			<Flex gap={0}>
				<Button type="primary" onClick={() => setIsModalVisible(true)}>
					<RiFilter2Line />
				</Button>
				<Button type="link" onClick={() => setIsSettingModalVisible(true)}>
					<RiEqualizer2Line />
				</Button>
			</Flex>
		</Flex>
	);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);

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

		// Object.fromEntries(
		// 	Object.entries(filterParams).map(([key, value]) => {
		// 		console.log(key, " - " + value);
		// 		console.log(value?.includes(",") ? value.split(",") : value);
		// 		console.log({
		// 			[key]: value?.includes(",") ? value.split(",") : value,
		// 		});
		// 		return {
		// 			[key]:value,
		// 		};
		// 	})
		// );
		console.log(filterParams);
		console.log(updatedFilterParams);

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
		// .then((aa) => {
		// 	console.log(aa);
		// 	const { fetchResult, totalCount } = aa;
		// 	setTableData(fetchResult);
		// 	setTableParams({
		// 		...tableParams,
		// 		pagination: {
		// 			...tableParams.pagination,
		// 			total: totalCount, // Update total count for pagination
		// 		},
		// 	});
		// })
		// .catch((error) => {
		// 	console.error("Error fetching data:", error);
		// 	// Handle any errors that might occur during the fetch request
		// });
	};

	const handleTableChange = (pagination) => {
		setTableParams({
			...tableParams,
			pagination: {
				...tableParams.pagination,
				current: pagination.current,
				pageSize: pagination.pageSize,
			},
		});
	};

	const handleModalOk = () => {
		const { pagination } = tableParams;
		const filters = filterForm?.getFieldsValue() || {};
		const queryParams = new URLSearchParams();
		// Loop through each filter property in tableParams.filter
		Object.entries(filters).forEach(([filterKey, filterValue]) => {
			if (filterValue) {
				// Check if filter value exists
				queryParams.append(filterKey, filterValue);
			}
		});
		queryParams.append("page", pagination.current);
		queryParams.append("limit", pagination.pageSize);

		// Update localStorage with fixed and hidden columns
		localStorage.setItem(
			id,
			JSON.stringify({
				[`${FIXED_COLUMN_INDEXES}`]: fixedColumnIdx,
				[`${HIDDEN_COLUMN_INDEXES}`]: hiddenColumnIdx,
			})
		);

		navigate(`${pathname}?${queryParams.toString()}`);
		setIsModalVisible(false);
	};

	const handleModalCancel = () => {
		setIsModalVisible(false);
	};

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

			{/* Setting Modal */}
			<Modal
				title="Table Setting"
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
			>
				<Flex vertical>
					{/* Filter form */}
					{filterChildren ?? <NoResult />}
					{/* Fixed and Hidden setting */}
					<Form layout="vertical">
						{tableColumns.map((col, index) => (
							<Form.Item
								key={index}
								label={col.title}
								className="d-flex align-items-center"
							>
								<Button
									type="primary"
									onClick={() => handleFixedColumnChange(index)}
								>
									{fixedColumnIdx.includes(index) ? "Unfix" : "Fix"}
								</Button>
								<Button
									type="primary"
									onClick={() => handleHiddenColumnChange(index)}
								>
									{hiddenColumnIdx.includes(index) ? "Show" : "Hide"}
								</Button>
							</Form.Item>
						))}
					</Form>
				</Flex>
			</Modal>
		</>
	);
}

export default ViewTable;
