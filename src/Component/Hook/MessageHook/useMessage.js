import { Flex, message } from "antd";
import { useTranslation } from "react-i18next";

function useMessage() {
	const { t } = useTranslation("");
	const key = "erp-message";

	const CONFIG = {
		// className: "px-5 bg-primary",
		key,
		style: {
			marginTop: "10vh",
		},
		onClose: () => (document.getElementById("overlay").style.display = "none"),
	};

	const loadingMessage = async (
		contentOrKey = "processing_msg",
		duration = 0,
		showOverlay = false,
		config = {}
	) => {
		if (showOverlay) document.getElementById("overlay").style.display = "block";
		const [key = "", attributes = "{}"] = contentOrKey?.split("-{}-");

		const content =
			key.indexOf("_msg") < 0
				? contentOrKey
				: t(key, { ...JSON.parse(`${attributes}`) });
		return message
			.loading({
				content: content,
				duration: duration,
				className: "bg-warning",
				...CONFIG,
				...config,
			})
			.then(() => Promise.resolve());
	};

	const successMessage = async (
		contentOrKey = "success_msg",
		duration = 3,
		showOverlay = false,
		config = {}
	) => {
		if (showOverlay) document.getElementById("overlay").style.display = "block";
		const [key = "", attributes = "{}"] = contentOrKey?.split("-{}-");

		const content =
			key.indexOf("_msg") < 0
				? contentOrKey
				: t(key, { ...JSON.parse(`${attributes}`) }).cat;
		return message
			.success({
				content: content,
				duration: duration,
				className: "bg-success",
				...CONFIG,
				...config,
			})
			.then(() => Promise.resolve());
	};

	const errorMessage = async (
		contentOrKey = "system_error_msg",
		duration = 3,
		showOverlay = false,
		config = {}
	) => {
		if (showOverlay) document.getElementById("overlay").style.display = "block";
		const [key = "", attributes = "{}"] = contentOrKey?.split("-{}-");

		const content = (
			<Flex justify="center" style={{ fontSize: "1.5rem" }}>
				{key.indexOf("_msg") < 0
					? contentOrKey
					: t(key, { ...JSON.parse(`${attributes}`) })}
			</Flex>
		);
		return message
			.error({
				content: content,
				duration: duration,
				...CONFIG,
				...config,
			})
			.then(() => Promise.resolve());
	};

	const destroyMessage = async () => {
		message.destroy(key);
		return Promise.resolve();
	};

	return {
		loadingMessage,
		successMessage,
		errorMessage,
		destroyMessage,
	};
}

export default useMessage;
