import { Trans } from "react-i18next";
import { Link } from "react-router-dom";

function TermAgreement({ divProps = {}, tranProps = {} }) {
	const App = () => (
		<div {...divProps} style={{ fontSize: "1rem" }}>
			<Trans
				i18nKey={"term_privacy_msg"}
				components={{
					term: <Link></Link>,
					privacy: <Link></Link>,
				}}
				{...tranProps}
			/>
		</div>
	);
	return <App />;
}

export default TermAgreement;
