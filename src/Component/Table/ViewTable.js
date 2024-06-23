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
import { RiEqualizer2Line, RiFilter2Line } from "@remixicon/react";
import { Button, Divider, Flex, Form, Modal, Switch, Table } from "antd";
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

function ViewTable({
	id,
	data: tableData = [], // Initial data (optional)
	columns = [],
	isLoading = true,
	isError = false,
	error = "",
	scrollX = 1000,
	scrollY = 400,
	pagination = {
		pageSizeOptions: [5, 10, 20, 50, 100],
		showQuickJumper: true,
		showSizeChanger: true,
		current: 1,
		pageSize: 10,
		total: 1,
	},
	columnsSetting = {
		fixedColumnIdx: [],
		hiddenColumnIdx: [],
	},
	rowKey = (record) => record?.id || "",
	footer = () => <></>,
	filter = {},
	filterChildren, // Filter modal children
	filterForm, // Form instance from Antd's useForm
	fetchData = async () => {}, // Function to trigger fetching data,
	tableProps = {},
}) {
	const { t } = useTranslation();
	const defaultSettings = JSON.parse(localStorage.getItem(id) ?? "{}");

	const [tableParams, setTableParams] = useState({
		pagination: {
			...pagination,
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]} - ${range[1]}`,
					total: total,
				}),
		},
		filter: filter,
	});

	const [tableColumns, setTableColumns] = useState(columns || []);
	const [fixedColumnIdx, setFixedColumnIdx] = useState(
		columnsSetting?.fixedColumnIdx || []
	);
	const [hiddenColumnIdx, setHiddenColumnIdx] = useState(
		columnsSetting?.hiddenColumnIdx || []
	);

	useEffect(() => {
		localStorage.setItem(
			id,
			JSON.stringify({
				...defaultSettings,
				fixedColumnIdx: fixedColumnIdx,
				hiddenColumnIdx: hiddenColumnIdx,
				columns: tableColumns,
			})
		);
	}, [fixedColumnIdx, hiddenColumnIdx, tableColumns]);

	useEffect(() => {
		fetchData(tableParams);
	}, [
		tableParams.filter,
		tableParams.pagination.current,
		tableParams.pagination.pageSize,
		tableParams.sorter,
	]);

	// since pagination is sent separately, we need to update TableParams once this is updated
	useEffect(() => {
		setTableParams({
			...tableParams,
			pagination: {
				...tableParams.pagination,
				...pagination,
			},
		});
	}, [pagination]);

	useEffect(() => {
		localStorage.setItem(id, JSON.stringify(tableParams));
	}, [tableParams]);

	const { errorMessage } = useMessage();

	if (isError) {
		errorMessage(error);
	}

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
	const transformedColumns = tableColumns.map((col, index) => ({
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
		// Apply fixed column
		fixed: fixedColumnIdx.includes(index) ? "left" : undefined,
		// Apply hidden from the state
		hidden: hiddenColumnIdx.includes(index),
		// multiple only matters for client-side sorting
		sorter: { multiple: 1 },
	}));

	const isFilterOrSortingOn = () =>
		Object.keys(tableParams?.filter ?? {})?.length > 0;

	const isColumnSettingOn = () =>
		fixedColumnIdx?.length > 0 || hiddenColumnIdx?.length > 0;

	const [isFilterVisible, setIsFilterVisible] = useState(false);

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
				<Title level={4}>User List</Title>
				<Button
					size="middle"
					type={`${isFilterOrSortingOn() || isColumnSettingOn() ? "primary" : "default"}`}
					onClick={() => setIsFilterVisible(!isFilterVisible)}
				>
					<RiFilter2Line size={20} />{" "}
					{Object.keys(tableParams?.filter ?? {})?.length > 0
						? Object.keys(tableParams?.filter ?? {})?.length
						: ""}{" "}
					Filter
				</Button>
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
						{Object.keys(tableParams?.filter ?? {})?.length > 0
							? Object.keys(tableParams?.filter ?? {})?.length
							: ""}{" "}
						Filter
					</Button>
					<Button
						size="middle"
						shape="round"
						type={`${isColumnSettingOn() ? "primary" : "default"}`}
						onClick={() => setIsColumnsModalVisible(true)}
					>
						<RiEqualizer2Line size={20} /> Columns
					</Button>
				</Flex>
			)}
		</Flex>
	);

	const handleTableChange = (pagination, _, sorter) => {
		console.log(sorter);
		setTableParams({
			...tableParams,
			pagination: {
				...tableParams.pagination,
				current: pagination.current,
				pageSize: pagination.pageSize,
			},
			sorter: (!Array.isArray(sorter) ? [sorter] : sorter).map(
				({ columnKey, order }) => ({
					columnKey,
					order,
				})
			),
		});
	};

	const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

	const handleFilterModalOk = () => {
		setTableParams({
			...tableParams,
			filter: Object.fromEntries(
				Object.entries(filterForm?.getFieldsValue()).filter(
					([_, filterValue]) => filterValue && filterValue.length > 0
				)
			),
		});
		setIsFilterModalVisible(false);
	};

	const handleFilterModalCancel = () => {
		filterForm?.setFieldsValue(tableParams?.filter);
		setIsFilterModalVisible(false);
	};

	const [isColumnsModalVisible, setIsColumnsModalVisible] = useState(false);

	const handleFixedColumnChange = (index) => {
		const updatedFixedColumnIdx = fixedColumnIdx.includes(index)
			? fixedColumnIdx.filter((i) => i !== index)
			: [...fixedColumnIdx, index];

		// Toggle fixed column index
		setFixedColumnIdx(updatedFixedColumnIdx);
	};

	const handleHiddenColumnChange = (index) => {
		const updatedHiddenColumnIdx = hiddenColumnIdx.includes(index)
			? hiddenColumnIdx.filter((i) => i !== index)
			: [...hiddenColumnIdx, index];

		// Toggle hidden column index
		setHiddenColumnIdx(updatedHiddenColumnIdx);
	};

	const handleColumnsModalCancel = () => {
		setIsColumnsModalVisible(false);
	};

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
					items={columns.map((i) => i.key)}
					strategy={horizontalListSortingStrategy}
				>
					<DragIndexContext.Provider value={dragIndex}>
						<Table
							id={id}
							className="w-100"
							loading={isLoading}
							bordered
							virtual
							title={TbHeader}
							components={{
								header: {
									cell: TableHeaderCell,
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
										columns[
											columns.findIndex((i) => i.key === dragIndex.active)
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
				open={isFilterModalVisible}
				onOk={handleFilterModalOk}
				onCancel={handleFilterModalCancel}
				footer={[
					<Button key="back" onClick={handleFilterModalCancel}>
						Cancel
					</Button>,
					...(filterChildren
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
				{filterChildren ?? <NoResult />}
			</Modal>

			{/* Setting Modal */}
			<Modal
				title={
					<Flex gap={10}>
						Column Settings{" "}
						<Button
							type="link"
							className="m-0 p-0"
							onClick={() => {
								setHiddenColumnIdx([]);
								setFixedColumnIdx([]);
								localStorage.removeItem(id);
							}}
						>
							<span style={{ fontSize: ".8rem", paddingBottom: ".2rem" }}>
								Reset Fields
							</span>
						</Button>
					</Flex>
				}
				open={isColumnsModalVisible}
				onCancel={handleColumnsModalCancel}
				footer={[
					<Button key="back" onClick={handleColumnsModalCancel}>
						Close
					</Button>,
				]}
			>
				<Divider className="m-0" />
				<Form className="py-2">
					<Flex gap={20} align="center" className="my-2" wrap>
						{tableColumns.map((col, index) => (
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
										checked={fixedColumnIdx.includes(index)}
										onClick={() => handleFixedColumnChange(index)}
									/>
									<Switch
										unCheckedChildren={"Hide"}
										checkedChildren="Show"
										checked={!hiddenColumnIdx.includes(index)}
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
