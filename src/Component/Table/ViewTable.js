import { HolderOutlined } from "@ant-design/icons";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import {
	RiEqualizer2Line,
	RiFilter2Line,
	RiRefreshLine,
} from "@remixicon/react";
import {
	Alert,
	Button,
	Divider,
	Flex,
	Form,
	Modal,
	Slider,
	Switch,
	Table,
	Tooltip,
} from "antd";
import Title from "antd/lib/typography/Title";
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Resizable } from "react-resizable";
import useMessage from "../Hook/MessageHook/useMessage";
import NoResult from "../NotFound/NoResult";

/** Drag Column Sorting Component */
const DragIndexContext = createContext({
	active: -1,
	over: -1,
});

const dragActiveStyle = (dragState, id) => {
	const { active, over, direction } = dragState;
	// drag active style
	let style = {};
	if (active && active === id) {
		style = {
			backgroundColor: "gray",
			opacity: 0.5,
		};
	}
	// dragover dashed style
	else if (over && id === over && active !== over) {
		style =
			direction === "right"
				? {
						borderRight: "1px dashed gray",
					}
				: {
						borderLeft: "1px dashed gray",
					};
	}
	return style;
};

const DragHandle = () => {
	const { setActivatorNodeRef, listeners } = useContext(DragIndexContext);
	return (
		<Button
			type="text"
			size="small"
			icon={<HolderOutlined />}
			style={{
				cursor: "move",
			}}
			ref={setActivatorNodeRef}
			{...listeners}
		/>
	);
};

const TableHeaderCell = (props) => {
	const { id, onResize, width, ...restProps } = props;

	const dragState = useContext(DragIndexContext);
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: id,
	});

	const style = {
		...restProps.style,
		transform: CSS.Translate?.toString(transform),
		transition,
		...(isDragging
			? {
					position: "relative",
					zIndex: 9999,
				}
			: {}),
		...dragActiveStyle(dragState, id),
	};
	const contextValue = useMemo(
		() => ({
			setActivatorNodeRef,
			listeners,
		}),
		[setActivatorNodeRef, listeners]
	);

	return (
		<DragIndexContext.Provider value={contextValue}>
			{!width ? (
				<th {...restProps} ref={setNodeRef} style={style} {...attributes} />
			) : (
				<Resizable
					width={width}
					height={0}
					handle={
						<span
							className="react-resizable-handle"
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					}
					onResize={onResize}
					draggableOpts={{
						enableUserSelectHack: false,
					}}
				>
					<th {...restProps} ref={setNodeRef} style={style} {...attributes} />
				</Resizable>
			)}
		</DragIndexContext.Provider>
	);
};

/** App Component */
function ViewTable({
	id,
	header = {
		title: "",
		actions: <></>,
	},
	rowKey = (record) => record?.id || "",
	columns = [],
	data: tableData = [], // Initial data
	fetchData = async () => {}, // Function to trigger fetching data,
	refetch = () => {}, // Function to refetch data,
	isLoading = true,
	isError = false,
	error = "",
	virtual = true,
	scrollX = 1000,
	params = {
		pagination: {
			pageSizeOptions: [5, 10, 20, 50, 100],
			showQuickJumper: true,
			showSizeChanger: true,
			current: 1,
			pageSize: 10,
			total: 1,
		},
		filter: {
			// should initialize the filter fields, otherwise, the Cancel modal won't reset for the 1st render
			filter: {},
			filterForm: <></>, // Filter modal children
			form: undefined, // Form.useForm = (): [FormInstance]
		},
	},
	rowActions = <></>,
	rowSelection = {},
	footer = () => <></>,
	tableProps = {},
}) {
	const { t } = useTranslation();
	const { loadingMessage, errorMessage } = useMessage();

	const [scrollY, setScrollY] = useState(400);

	useEffect(() => {
		if (isError) {
			errorMessage(error, 0.5).then((e) => {
				if (e.toLowerCase().includes("sortable")) {
					// Remove the latest element from the sorter array
					setTableParams((prevParams) => {
						// Access prevParams here
						const newSorter = prevParams.sorter.slice(0, -1); // Remove the last element
						// Find the key of the removed sorter element
						const removedSorterKey = newSorter[newSorter.length - 1]?.columnKey;
						// Update tableColumns to remove defaultSortOrder for the removed sorter key
						setTableColumns((prevColumns) =>
							prevColumns.map((col) =>
								col.key === removedSorterKey
									? { ...col, sorter: "" } // Remove defaultSortOrder
									: col
							)
						);
						return {
							...prevParams,
							sorter: newSorter,
						};
					});
				}
			});
		}
	}, [isError, error]); // Add dependencies to the useEffect hook

	const { columns: localColumns, sorter = [] } = JSON.parse(
		localStorage.getItem(id) ?? "{}"
	);

	const [tableParams, setTableParams] = useState({
		pagination: {
			pageSizeOptions: [5, 10, 20, 50, 100],
			showQuickJumper: true,
			showSizeChanger: true,
			pageSize: 10,
			current: 1,
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]} - ${range[1]}`,
					total: total,
				}),
			total: 1,
			...params?.pagination,
		},
		filter: params?.filter?.filter,
		sorter: sorter,
	});

	// get the localColumns first if any
	const [tableColumns, setTableColumns] = useState(
		localColumns?.length > 0 ? localColumns : columns
	);
	/** Drag Column Sorting */
	const [dragIndex, setDragIndex] = useState({
		active: -1,
		over: -1,
	});
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				// https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
				distance: 1,
			},
		})
	);
	const onDragEnd = ({ active, over }) => {
		if (active.id !== over?.id) {
			setTableColumns((prevState) => {
				const activeIndex = prevState.findIndex((i) => {
					return i.key === active?.id;
				});
				const overIndex = prevState.findIndex((i) => i.key === over?.id);
				return arrayMove(prevState, activeIndex, overIndex);
			});
		}
		setDragIndex({
			active: -1,
			over: -1,
		});
	};
	const onDragOver = ({ active, over }) => {
		const activeIndex = columns.findIndex((i) => i.key === active.id);
		const overIndex = columns.findIndex((i) => i.key === over?.id);
		setDragIndex({
			active: active.id,
			over: over?.id,
			direction: overIndex > activeIndex ? "right" : "left",
		});
	};

	/** Resizable setting */
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

	/** transformed columns for drag sorting and resizable */
	const transformedColumns = tableColumns.map((col, index) => {
		return {
			...col,
			title: (
				<Flex gap={10}>
					<DragHandle />
					{col.title}
				</Flex>
			),
			width: col.width ?? 200,
			onHeaderCell: (column) => ({
				// id for drag sorting
				id: `${col.key}`,
				// width and onResize for resizable setting
				width: column.width,
				onResize: handleResize(index),
			}),
			onCell: () => ({
				id: `${col.key}`,
			}),
			// multiple's value only matters for client-side sorting
			sorter: { multiple: 1 },
			// prevent sorter back to default status.
			sortDirections: ["descend", "ascend"],
			// Find the sorter object that matches the current column's key
			sortOrder: sorter?.find((s) => s.columnKey === col.key)?.order,
			// Restore render function from based column
			render: columns.find((c) => c.key === col.key)?.render,
		};
	});

	useEffect(() => {
		fetchData(tableParams);
	}, [
		tableParams.filter,
		tableParams.pagination.current,
		tableParams.pagination.pageSize,
		tableParams.sorter,
	]);

	useEffect(() => {
		setTableParams({
			...tableParams,
			pagination: {
				...tableParams.pagination,
				total: params?.pagination?.total,
			},
		});
	}, [params?.pagination?.total]);

	useEffect(() => {
		// Check if localColumns is null or has fewer elements than columns
		if (localColumns?.length >= 0 && localColumns.length < columns?.length) {
			// Find the elements in columns that are not in localColumns
			const newColumns = columns.filter(
				(column) =>
					!localColumns?.some((localColumn) => localColumn.key === column.key)
			);

			// Concatenate the new columns to the end of the existing localColumns
			setTableColumns([...localColumns, ...newColumns]);
		}
	}, [columns]);

	// update localStorage
	useEffect(() => {
		localStorage.setItem(
			id,
			JSON.stringify({
				...tableParams,
				columns: [...tableColumns],
			})
		);
	}, [tableColumns, tableParams]);

	const numberOfFiltersApplied = Object.values(
		tableParams?.filter ?? {}
	).filter(
		(filterValue) =>
			filterValue !== undefined &&
			filterValue !== null &&
			filterValue.length > 0
	).length;

	const isFilterOrSortingOn = () => numberOfFiltersApplied > 0;

	const isColumnSettingOn = () =>
		tableColumns.findIndex((c) => (c.fixed && c.fixed !== "") || c.hidden) > -1;

	const [isFilterVisible, setIsFilterVisible] = useState(false);

	const handleTableChange = (pagination, _, sorter) => {
		setTableParams({
			...tableParams,
			pagination: {
				...tableParams.pagination,
				current: pagination.current,
				pageSize: pagination.pageSize,
			},
			sorter: (!Array.isArray(sorter) ? [sorter] : sorter).flatMap((item) =>
				item.order ? { columnKey: item.columnKey, order: item.order } : []
			),
		});
	};

	const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

	const handleFilterModalOk = () => {
		const filterForm = params?.filter?.form;

		// 1. Get filter values from the form
		const filterValues = filterForm?.getFieldsValue();

		// 2. Create a new filter object with only valid values
		const filter = Object.fromEntries(
			Object.entries(filterValues).filter(
				([_, filterValue]) =>
					filterValue !== undefined &&
					filterValue !== null &&
					filterValue.length > 0
			)
		);

		// 3. Update tableParams with the new filter
		setTableParams({
			...tableParams,
			filter,
		});

		setIsFilterModalVisible(false);
	};

	const handleClearFilter = (autoApply = false) => {
		const filterForm = params?.filter?.form;
		const filterKeys = Object.keys(filterForm?.getFieldsValue());
		const filter = filterForm?.setFieldsValue(
			Object.fromEntries(filterKeys.map((key) => [key, null]))
		);

		if (autoApply)
			setTableParams({
				...tableParams,
				filter,
			});
	};

	const handleFilterModalCancel = () => {
		const filterForm = params?.filter?.form;

		filterForm?.setFieldsValue(tableParams?.filter);

		setIsFilterModalVisible(false);
	};

	const [isColumnsSettingModalVisible, setIsColumnsSettingModalVisible] =
		useState(false);

	const handleFixedColumnsChange = (index) => {
		const updatedTableColumns = [...tableColumns];
		const column = updatedTableColumns[index];

		// Toggle the 'fixed' property of the column
		column.fixed = column.fixed && column.fixed !== "" ? "" : "left";

		console.log(column);

		// Update the tableColumns state
		setTableColumns(updatedTableColumns);
	};

	const handleHiddenColumnsChange = (index) => {
		const updatedTableColumns = [...tableColumns];
		const column = updatedTableColumns[index];

		// Toggle the 'fixed' property of the column
		column.hidden = !column.hidden;

		// Update the tableColumns state
		setTableColumns(updatedTableColumns);
	};

	const handleClearColumnsSetting = () => {
		setScrollY(400);
		setTableColumns((prevColumns) =>
			prevColumns.map((column) => ({
				...column,
				fixed: "", // Clear fixed property
				hidden: false, // Set hidden to false
			}))
		);
	};

	const handleColumnsModalCancel = () => {
		setIsColumnsSettingModalVisible(false);
	};

	const handleRefresh = () => {
		loadingMessage("Refreshing...", isLoading ? 0 : 0.1);

		typeof rowSelection?.setSelectedRowKeys === "function" &&
			rowSelection?.setSelectedRowKeys([]);

		// refresh datasource
		refetch();
	};

	const handleTableHeightChange = (newHeight = 400) => setScrollY(newHeight);

	const AlertNumOfSelectedItems = ({ numOfSelectedItems }) =>
		numOfSelectedItems > 0 && (
			<Alert
				message={`Selected ${numOfSelectedItems} items`}
				type="info"
				action={rowActions}
			/>
		);

	const TbHeader = () => (
		<Flex vertical gap={10}>
			<Flex
				className="w-100"
				style={{
					minHeight: "2rem",
				}}
				align="center"
				justify="space-between"
			>
				<Flex gap={10}>
					<Title level={4}>{header?.title || "Table Items"}</Title>{" "}
					{numberOfFiltersApplied > 0 && (
						<Button
							type="link"
							className="p-0"
							onClick={() => {
								handleClearFilter(true);
							}}
						>
							Clear filter
						</Button>
					)}
					{tableParams?.sorter?.length > 0 && (
						<Button
							type="link"
							className="p-0"
							onClick={() => {
								setTableParams({
									...tableParams,
									sorter: [],
								});
							}}
						>
							Clear sorting
						</Button>
					)}
				</Flex>
				<Flex gap={10}>
					{header?.actions}
					<Tooltip title="Refresh">
						<Button className="p-2" onClick={handleRefresh}>
							<RiRefreshLine size={20} color="blue" />
						</Button>
					</Tooltip>
					<Button
						size="middle"
						type={`${isFilterOrSortingOn() || isColumnSettingOn() ? "primary" : "default"}`}
						onClick={() => setIsFilterVisible(!isFilterVisible)}
					>
						<RiFilter2Line size={20} />{" "}
						{numberOfFiltersApplied > 0 ? numberOfFiltersApplied : ""} Filter
					</Button>
				</Flex>
			</Flex>
			<Divider className="m-0" />
			{isFilterVisible && (
				<Flex gap={10}>
					<Button
						size="middle"
						shape="round"
						type={`${isFilterOrSortingOn() ? "primary" : "default"}`}
						onClick={() => setIsFilterModalVisible(true)}
					>
						<RiFilter2Line size={20} />{" "}
						{numberOfFiltersApplied > 0 ? numberOfFiltersApplied : ""} Filter
					</Button>
					<Button
						size="middle"
						shape="round"
						type={`${isColumnSettingOn() ? "primary" : "default"}`}
						onClick={() => setIsColumnsSettingModalVisible(true)}
					>
						<RiEqualizer2Line size={20} /> Settings
					</Button>
				</Flex>
			)}
			<AlertNumOfSelectedItems
				numOfSelectedItems={rowSelection?.selectedRowKeys?.length || 0}
			/>
		</Flex>
	);

	return (
		<>
			<DndContext
				sensors={sensors}
				modifiers={[restrictToHorizontalAxis]}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
				collisionDetection={closestCenter}
			>
				<SortableContext
					items={tableColumns.map((i) => i.key)}
					strategy={horizontalListSortingStrategy}
				>
					<DragIndexContext.Provider value={dragIndex}>
						<Table
							id={id}
							rowKey={rowKey}
							bordered
							size="large"
							className="w-100"
							style={{ zIndex: 0 }}
							loading={isLoading}
							virtual={virtual}
							scroll={
								virtual
									? {
											x: scrollX,
											y: scrollY,
										}
									: undefined
							}
							title={TbHeader}
							components={{
								header: {
									cell: TableHeaderCell,
								},
							}}
							rowSelection={{
								columnWidth: 70,
								fixed: true,
								preserveSelectedRowKeys: true,
								selections: [
									Table.SELECTION_ALL,
									Table.SELECTION_INVERT,
									Table.SELECTION_NONE,
								],
								...rowSelection,
							}}
							columns={transformedColumns}
							dataSource={tableData}
							pagination={tableParams.pagination}
							onChange={handleTableChange}
							footer={footer}
							{...tableProps}
						/>
					</DragIndexContext.Provider>
				</SortableContext>
				<DragOverlay>
					<table>
						<tbody>
							<tr>
								<th
									style={{
										backgroundColor: "gray",
										padding: 16,
									}}
								>
									{
										tableColumns[
											tableColumns.findIndex((i) => i.key === dragIndex.active)
										]?.title
									}
								</th>
							</tr>
						</tbody>
					</table>
				</DragOverlay>
			</DndContext>

			{/* Filter & Sorting Modal */}
			<Modal
				title={
					<Flex gap={10}>
						Filter{" "}
						<Button type="link" className="m-0 p-0" onClick={handleClearFilter}>
							<span style={{ fontSize: ".8rem", paddingBottom: ".2rem" }}>
								Clear Filter
							</span>
						</Button>
					</Flex>
				}
				open={isFilterModalVisible}
				onOk={handleFilterModalOk}
				onCancel={handleFilterModalCancel}
				footer={[
					<Button key="back" onClick={handleFilterModalCancel}>
						Cancel
					</Button>,
					...(params?.filter?.filterForm
						? [
								<Button
									key="submit"
									type="primary"
									onClick={handleFilterModalOk}
								>
									Apply
								</Button>,
							]
						: []),
				]}
				loading={isLoading}
			>
				<Divider className="m-0" />
				{params?.filter?.filterForm ?? <NoResult />}
			</Modal>

			{/* Setting Modal */}
			<Modal
				title={
					<Flex gap={10}>
						Settings{" "}
						<Button
							type="link"
							className="m-0 p-0"
							onClick={handleClearColumnsSetting}
						>
							<span style={{ fontSize: ".8rem", paddingBottom: ".4rem" }}>
								Reset Fields
							</span>
						</Button>
					</Flex>
				}
				open={isColumnsSettingModalVisible}
				onCancel={handleColumnsModalCancel}
				footer={[
					<Button key="back" onClick={handleColumnsModalCancel}>
						Close
					</Button>,
				]}
			>
				<Divider className="m-0" />
				<Form className="py-2">
					<Flex vertical gap={15} className="my-2">
						<Flex className="w-100" gap={10}>
							<Title level={5} className="m-0 w-100">
								Table Height
							</Title>
							<Slider
								className="w-100"
								min={50}
								max={1000}
								onChange={handleTableHeightChange}
								value={typeof scrollY === "number" ? scrollY : 0}
							/>
						</Flex>
					</Flex>
					<Flex vertical gap={15} className="my-2">
						<Table
							size="middle"
							columns={[
								{ title: "Columns", key: "columns", dataIndex: "title" },
								{ title: "Actions", dataIndex: "actions", key: "actions" },
							]}
							dataSource={tableColumns.map((col, index) => ({
								title: col?.title,
								key: index,
								actions: (
									<Flex gap={10} align="center" wrap>
										<Switch
											checkedChildren={"Fix"}
											unCheckedChildren="UnFix"
											checked={col?.fixed && col?.fixed !== ""}
											onClick={() => handleFixedColumnsChange(index)}
										/>
										<Switch
											unCheckedChildren={"Hide"}
											checkedChildren="Show"
											checked={!col?.hidden}
											onClick={() => handleHiddenColumnsChange(index)}
										/>
									</Flex>
								),
							}))}
							pagination={{
								pageSize: 10,
							}}
						/>

						{/* {tableColumns.map((col, index) => (
							<Flex
								key={index}
								gap={20}
								align=""
								className="my-2 w-100"
								justify="space-between"
							>
								<Title level={5} className=" m-0">
									{col?.title}
								</Title>

								<Flex gap={10} align="center" wrap>
									<Switch
										checkedChildren={"Fix"}
										unCheckedChildren="UnFix"
										checked={col?.fixed && col?.fixed !== ""}
										onClick={() => handleFixedColumnsChange(index)}
									/>
									<Switch
										unCheckedChildren={"Hide"}
										checkedChildren="Show"
										checked={!col?.hidden}
										onClick={() => handleHiddenColumnsChange(index)}
									/>
								</Flex>
							</Flex>
						))} */}
					</Flex>
				</Form>
			</Modal>
		</>
	);
}

export default ViewTable;
