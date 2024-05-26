import { Button, Popconfirm } from "antd";
import { Typography } from "antd/lib";
import { Trans, useTranslation } from "react-i18next";

function SubmitBtnFormControl({
	type = "primary",
	title = "",
	className = "",
	style = {},
	disabled = false,
	popconfirm = false,
	onPopConfirm = () => {},
	loading = false,
	onClick = () => {},
	btnProps = {},
}) {
	const { t } = useTranslation();
	let btnTitle = loading ? t("processing_msg") : title || t("submit_msg");

	const App = () => (
		<Popconfirm
			title={t("delete_record_msg")}
			description={
				<Typography.Text>
					<Trans
						i18nKey={"delete_record_msg_confirm"}
						ns="Default"
						components={{
							danger: <div className="text-danger"></div>,
						}}
					/>
				</Typography.Text>
			}
			onConfirm={onPopConfirm}
			okButtonProps={{
				className: "custom-center m-2 flex-end",
				style: {
					padding: ".8rem",
				},
			}}
			disabled={!popconfirm}
			showCancel={false}
			okText={t("yes_msg")}
		>
			<Button
				type={type}
				className={`my-2 bg-red1 custom-center ${className}`}
				style={{
					fontSize: "1rem",
					padding: ".7rem 2rem",
					borderRadius: ".5rem",
					...style,
				}}
				disabled={disabled || loading}
				loading={loading}
				onClick={onClick}
				{...btnProps}
			>
				{btnTitle}
			</Button>
		</Popconfirm>
	);

	return <App />;
}

export default SubmitBtnFormControl;
