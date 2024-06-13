import { Footer } from "antd/lib/layout/layout";

function FixedFooter({ children, ...props }) {
	const App = () => (
		<Footer
			style={{
				textAlign: "center",
				position: "fixed",
				left: 0,
				bottom: 0,
				zIndex: 1,
				width: "100%",
				display: "flex",
				alignItems: "center",
				padding: "0 .5rem",
				backgroundColor: "wheat",
			}}
			{...props}
		>
			{children}
		</Footer>
	);

	return <App />;
}

export default FixedFooter;
