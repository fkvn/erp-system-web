import { Content } from "antd/lib/layout/layout";

function MainContent({ children, ...props }) {
	const App = () => (
		<Content
			style={{
				margin: "1rem 2rem",
				overflow: "initial",
				minHeight: "100vh",
			}}
			{...props}
		>
			{children}
		</Content>
	);

	return <App />;
}

export default MainContent;
