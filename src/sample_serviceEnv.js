const envOptions = ["local", "dev", "prod"];

export const env = envOptions[0];
export const baseUrl = {
	local: "",
	dev: "",
	prod: "",
}[env];

export const axiosConfig = {
	baseURL: baseUrl,
};

export const lngConfig = {
	supportedLngs: [
		{
			value: "",
			label: "",
		},
	],
	i18ApiKey: "",
};
