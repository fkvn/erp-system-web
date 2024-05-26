import { Image } from "antd";
import ReactLoading from "react-loading";
import { logo } from "../../Asset/Asset";

function useImage() {
	const image = ({ className = "", ...inputProps }, center = true) =>
		((props = {}) => <Image {...props} />)({
			width: 45,
			src: logo,
			preview: false,
			onError: (e) => {
				e.target.style.border = "1px solid";
				e.target.style.padding = "0.5rem";
			},
			fallback: (
				<ReactLoading
					type="spin"
					color="#0000FF"
					height={"1.5rem"}
					width={"1.5rem"}
				/>
			),
			className: `${className} ${center ? "custom-center" : ""} d-block`,
			...inputProps,
			style: {
				objectFit: "cover",
				...inputProps?.style,
			},
		});

	return {
		image,
	};
}

export default useImage;
