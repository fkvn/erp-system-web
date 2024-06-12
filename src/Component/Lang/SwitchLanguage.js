import { GlobalOutlined } from "@ant-design/icons";
import { Grid, Select } from "antd";
import i18next from "i18next";
import { lngConfig } from "../../serviceEnv";

function SwitchLanguage({
	style = {
		fontSize: "1rem",
		paddingRight: ".5rem",
		color: "black",
	},
	bordered = false,
	options = [],
	selectionProps = {},
}) {
	const { useBreakpoint } = Grid;
	const screens = useBreakpoint();
	const { supportedLngs } = lngConfig;

	const App = () => (
		<Select
			labelInValue
			defaultValue={{
				value: i18next.language,
				label:
					!screens.xs &&
					supportedLngs.filter((lng) => lng.value === this?.value)[0]?.label,
			}}
			suffixIcon={
				<GlobalOutlined
					style={{
						pointerEvents: "none",
					}}
				/>
			}
			style={{
				...(screens.xs && { minWidth: "120px" }),
				maxWidth: "10rem",
				...style,
			}}
			size="large"
			variant={bordered}
			onChange={(res) => i18next.changeLanguage(res?.value)}
			options={options}
			{...selectionProps}
		/>
	);
	return supportedLngs.length > 1 && <App />;
}

export default SwitchLanguage;
