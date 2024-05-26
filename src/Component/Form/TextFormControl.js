import { Flex, Form, Input } from "antd";
import { useTranslation } from "react-i18next";

function TextFormControl({
	itemName = "",
	label = "",
	labelProp = {},
	itemProps = {},
	inputProps = {},
	required = false,
	showLabel = false,
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
					label: (
						<span {...labelProp}>{`${label} ${
							required ? "" : `(${t("field_optional_msg")})`
						}`}</span>
					),
				})}
				{...itemProps}
			>
				<Input
					allowClear
					placeholder={t("username_or_email_msg")}
					{...inputProps}
				/>
			</Form.Item>
			{extra}
		</Flex>
	);
	return <App />;
}

export default TextFormControl;
