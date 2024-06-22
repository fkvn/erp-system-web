import { Flex, Form, Select } from "antd";
import { useTranslation } from "react-i18next";

/**
 *
 * @options [{label: "", value: ""}]
 * @returns
 */
function SelectFormControl({
	mode = "tags",
	placeholder = "Select options",
	options = [],
	itemName = "",
	label = "",
	labelProp = {},
	itemProps = {},
	selectProps = {},
	required = false,
	showLabel = true,
	allowClear = false,
	flexProp = {},
	extra = <></>,
} = {}) {
	const { t } = useTranslation();

	const App = () => (
		<Flex
			gap={10}
			align="center"
			wrap="wrap"
			justify="flex-start"
			{...flexProp}
		>
			<Form.Item
				name={itemName}
				className="m-0 w-100"
				rules={[
					{
						required: required,
						message: t("field_required_msg"),
					},
				]}
				{...(showLabel && {
					label: <span {...labelProp}>{`${label} `}</span>,
				})}
				{...itemProps}
			>
				<Select
					mode={mode} // Allow multiple selections
					allowClear={allowClear}
					placeholder={placeholder}
					{...selectProps}
				>
					{options?.map(({ value, title, props }, index) => (
						<Select.Option key={index} value={value} {...props}>
							{title}
						</Select.Option>
					))}
				</Select>
			</Form.Item>
			{extra}
		</Flex>
	);
	return <App />;
}

export default SelectFormControl;
