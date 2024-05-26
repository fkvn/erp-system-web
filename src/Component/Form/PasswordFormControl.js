import { Flex, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { CONFIRM_PASSWORD_FIELD, PASSWORD_FIELD } from "../../Util/constants";

function PasswordFormControl({
	newPasswordForm = false,
	constrains = false,
	itemName = PASSWORD_FIELD,
	label = "",
	itemProps = {},
	inputProps = {},
	required = true,
	showLabel = false,
	withConfirmPassword = false,
	confirmPasswordProps: {
		confirmPasswordName = CONFIRM_PASSWORD_FIELD,
		confirmPasswordLabel,
		...confirmPasswordProps
	} = {},
	confirmPasswordInputProps = {},
	showConfirmPasswordLabel = true,
	flexProp = {},
	autoComplete = false,
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
					{
						...(constrains && {
							pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{8,20}$/,
							message: t("password_constrains_msg"),
						}),
					},
				]}
				{...(showLabel && {
					label: `${
						label || t(`password_label_msg${newPasswordForm ? "_new" : ""}`)
					} ${required ? "" : `(${t("field_optional_msg")})`}`,
				})}
				hasFeedback={true}
				shouldUpdate={true}
				{...itemProps}
			>
				<Input.Password
					allowClear
					// this is to turn off autocomplete
					autoComplete={`${autoComplete ? "password" : "new-password"}`}
					placeholder={`${t(`password_label_msg${newPasswordForm ? "_new" : ""}`)}${
						required ? " " : ` (${t("field_optional_msg")})`
					} `}
					style={{
						paddingRight: "10px",
					}}
					{...inputProps}
				/>
			</Form.Item>
			{/* if allows confirm password, it is required */}
			{withConfirmPassword && (
				<Form.Item
					name={confirmPasswordName}
					className="m-0 w-100"
					dependencies={[itemName]}
					hasFeedback
					rules={[
						{
							required: withConfirmPassword,
							message: t("field_required_msg"),
						},
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue(itemName) === value) {
									return Promise.resolve();
								}
								return Promise.reject(
									new Error(`${t("invalid_password_msg_confirm")}!`)
								);
							},
						}),
					]}
					{...(showConfirmPasswordLabel && {
						label: `${
							confirmPasswordLabel ||
							t(`password_label_msg_confirm${newPasswordForm ? "_new" : ""}`)
						}`,
					})}
					{...confirmPasswordProps}
				>
					<Input.Password
						allowClear
						autoComplete={`${autoComplete ? "password" : "new-password"}`}
						placeholder={t(
							`password_label_msg_confirm${newPasswordForm ? "_new" : ""}`
						)}
						style={{
							paddingRight: "10px",
						}}
						{...confirmPasswordInputProps}
					/>
				</Form.Item>
			)}
		</Flex>
	);

	return <App />;
}

export default PasswordFormControl;
