import { Flex, Form } from "antd";
import { useForm } from "antd/es/form/Form";
import Title from "antd/lib/typography/Title";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSignInByPasswordMutation } from "../../../../../ApiRTKQuery/RTKApi/authApi";
import { USERNAME_OR_EMAIL_FIELD } from "../../../../../Util/constants";
import PasswordFormControl from "../../../../Form/PasswordFormControl";
import SubmitBtnFormControl from "../../../../Form/SubmitBtnFormControl";
import TermAgreement from "../../../../Form/TermAgreement";
import TextFormControl from "../../../../Form/TextFormControl";
import useAuth from "../../../../Hook/AuthHook/useAuth";
import useMessage from "../../../../Hook/MessageHook/useMessage";
import Header from "../Header";

function SignInPage() {
	const { t } = useTranslation();
	const { errorMessage } = useMessage();
	const { auth, signin } = useAuth();
	const [form] = useForm();
	const [mutate, { isLoading, isError, isSuccess, error, data }] =
		useSignInByPasswordMutation();

	const onSignInHandle = () => {
		form
			.validateFields()
			.then(() => mutate(form.getFieldsValue()))
			.catch(() => {});
	};

	if (isError) {
		errorMessage(error);
	}

	useEffect(() => {
		if (isSuccess) {
			signin(data);
		} else {
			auth(false).catch(() => {});
		}
	}, [isSuccess, signin, data, auth]);

	const SignInForm = (props = {}) => (
		<Form
			id="user-signin-form"
			form={form}
			layout="vertical"
			style={{
				minWidth: "10rem",
			}}
			{...props}
		>
			<Flex vertical gap={40}>
				<TextFormControl itemName={USERNAME_OR_EMAIL_FIELD} required={true} />
				<PasswordFormControl autoComplete={false} />
				<SubmitBtnFormControl loading={isLoading} onClick={onSignInHandle} />
			</Flex>
		</Form>
	);

	const App = () => (
		<>
			<Header />
			<Flex
				justify="center"
				align="center"
				style={{
					margin: "5rem 1rem",
				}}
			>
				<Flex
					vertical
					style={{
						minWidth: "20rem",
						maxWidth: "95%",
					}}
					gap={50}
				>
					<Title
						level={2}
						className="text-center"
						style={{
							textTransform: "capitalize",
						}}
					>
						{t("sign_in_msg")}
					</Title>

					<SignInForm />

					<TermAgreement />
				</Flex>
			</Flex>
		</>
	);
	return !isSuccess && <App />;
}

export default SignInPage;
