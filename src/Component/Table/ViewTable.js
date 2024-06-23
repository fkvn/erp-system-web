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
	rowKey = (record) => record?.id || "",
	columns = [],
	data: tableData = [], // Initial data
	fetchData = async () => {}, // Function to trigger fetching data,
	isLoading = true,
	isError = false,
	error = "",
	virtual = true,
	virtualProps = {
		scrollX: 1000,
		scrollY: 400,
	},
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
			filter: {},
			filterForm: <></>, // Filter modal children
			form: undefined, // Form.useForm = (): [FormInstance]
		},
	},
	footer = () => <></>,
	tableProps = {},
}) {
	const { t } = useTranslation();
	const { errorMessage } = useMessage();
	if (isError) {
		errorMessage(error);
	}

	const [tableParams, setTableParams] = useState({
		pagination: {
			...params?.pagination,
			showTotal: (total, range) =>
				t("pagination_item_count_msg", {
					value: `${range[0]} - ${range[1]}`,
					total: total,
				}),
		},
		filter: params?.filter?.filter,
		sorter: [],
	});

	const { columns: localColumns, sorter } = JSON.parse(
		localStorage.getItem(id) ?? "{}"
	);

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
			// Find the sorter object that matches the current column's key
			defaultSortOrder: sorter?.find((s) => s.columnKey === col.key)?.order,
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
					<Title level={4}>User List</Title>{" "}
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
				</Flex>
				<Button
					size="middle"
					type={`${isFilterOrSortingOn() || isColumnSettingOn() ? "primary" : "default"}`}
					onClick={() => setIsFilterVisible(!isFilterVisible)}
				>
					<RiFilter2Line size={20} />{" "}
					{numberOfFiltersApplied > 0 ? numberOfFiltersApplied : ""} Filter
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
						{numberOfFiltersApplied > 0 ? numberOfFiltersApplied : ""} Filter
					</Button>
					<Button
						size="middle"
						shape="round"
						type={`${isColumnSettingOn() ? "primary" : "default"}`}
						onClick={() => setIsColumnsSettingModalVisible(true)}
					>
						<RiEqualizer2Line size={20} /> Columns
					</Button>
				</Flex>
			)}
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
									? { x: virtualProps.scrollX, y: virtualProps.scrollY }
									: undefined
							}
							title={TbHeader}
							components={{
								header: {
									cell: TableHeaderCell,
								},
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
						Column Settings{" "}
						<Button
							type="link"
							className="m-0 p-0"
							onClick={handleClearColumnsSetting}
						>
							<span style={{ fontSize: ".8rem", paddingBottom: ".2rem" }}>
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
						))}
					</Flex>
				</Form>
			</Modal>
		</>
	);
}

export default ViewTable;
