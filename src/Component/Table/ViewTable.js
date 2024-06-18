import { Button, Flex, Form, Modal, Skeleton, Table } from "antd";
import Title from "antd/lib/typography/Title";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
	FIXED_COLUMN_INDEXES,
	HIDDEN_COLUMN_INDEXES,
} from "../../Util/constants";
import NoResult from "../NotFound/NoResult";
import ResizableTitle from "./ResizableTitle";

function ViewTable({
	id,
	data, // Initial data (optional)
	scrollX = 1000,
	scrollY = 400,
	pageSize = 10,
	currentPage = 1,
	rowKey = (record) => record?.id || "",
	footer = () => <></>,
	filterChildren, // Filter modal children
	filterForm, // Form instance from Antd's useForm
	fetchData = async () => {}, // Function to fetch data
}) {
	const { t } = useTranslation();
	const [fixedColumnIdx, setFixedColumnIdx] = useState(
		(localStorage.getItem(id) ?? {})?.[`$${FIXED_COLUMN_INDEXES}`] ?? []
	);
	const [hiddenColumnIdx, setHiddenColumnIdx] = useState(
		(localStorage.getItem(id) ?? {})?.[`$${HIDDEN_COLUMN_INDEXES}`] ?? []
	);

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const page = searchParams.get("page") || currentPage || 1;
	const limit = searchParams.get("limit") || pageSize || 10;
	const filterParams = Object.fromEntries(
		[...searchParams].filter(([key]) => key !== "page" && key !== "limit")
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
		},
		filter: {
			...filterParams, // Extract other params as filter
		},
	});

	const [tableColumns, setTableColumns] = useState([]); // Start with empty columns

	const [tableData, setTableData] = useState(data ?? []); // Initial data

	useEffect(() => {
		if (tableData.length > 0) {
			// Generate columns from data if not already present
			const generatedColumns = Object.keys(tableData[0]).map((key) => ({
				title: key
					.replace(/([A-Z])/g, " $1")
					.trim()
					.toLowerCase(), // Sentence case
				dataIndex: key,
				key,
				hidden: false,
			}));
			setTableColumns(generatedColumns);
		}
	}, [tableData]);

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
		>
			<Title level={4}>User List</Title>
			<Button type="primary" onClick={() => setIsModalVisible(true)}>
				Filter
			</Button>
			<Button type="primary" onClick={() => setIsSettingModalVisible(true)}>
				Setting
			</Button>
		</Flex>
	);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isSettingModalVisible, setIsSettingModalVisible] = useState(false);

	useEffect(() => {
		fetchTableData();
	}, []);

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

		fetchData(queryParams)
			.then(({ fetchResult, totalCount }) => {
				setTableData(fetchResult);
				setTableParams({
					...tableParams,
					pagination: {
						...tableParams.pagination,
						total: totalCount, // Update total count for pagination
					},
				});
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
				// Handle any errors that might occur during the fetch request
			});
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
			{tableColumns.length === 0 ? (
				<Skeleton active />
			) : (
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
					rowKey={rowKey}
					pagination={tableParams.pagination}
					footer={footer}
					onChange={handleTableChange}
				/>
			)}
			<Modal
				title="Filter"
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
				<Form layout="vertical">{filterChildren ?? <NoResult />}</Form>
			</Modal>

			{/* Setting Modal */}
			<Modal
				title="Column Settings"
				open={isSettingModalVisible}
				onOk={handleSettingModalOk}
				onCancel={handleSettingModalCancel}
				footer={[
					<Button key="back" onClick={handleSettingModalCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleSettingModalOk}>
						Apply
					</Button>,
				]}
			>
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
			</Modal>
		</>
	);
}

export default ViewTable;
