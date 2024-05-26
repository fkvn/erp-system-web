import { Flex, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { EMAIL_FIELD } from "../../Util/constants";

function EmailFormControl({
	itemName = EMAIL_FIELD,
	label = "",
	labelProp = {},
	itemProps = {},
	inputProps = {},
	required = true,
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
						type: "email",
						message: t("invalid_email_msg"),
					},
					{
						required: required,
						message: t("field_required_msg"),
					},
				]}
				{...(showLabel && {
					label: (
						<span {...labelProp}>{`${label || t("email_label_msg")} ${
							required ? "" : `(${t("field_optional_msg")})`
						}`}</span>
					),
				})}
				{...itemProps}
			>
				<Input
					allowClear
					placeholder={`${t("email_label_msg")}${
						required ? " " : ` (${t("field_optional_msg")})`
					}`}
					{...inputProps}
				/>
			</Form.Item>
			{extra}
		</Flex>
	);
	return <App />;
}

export default EmailFormControl;
