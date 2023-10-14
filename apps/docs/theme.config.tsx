import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router';



const config: DocsThemeConfig = {
	logo: <span>Motomon</span>,
	project: {
		link: "https://github.com/",
	},
	chat: {
		link: "https://discord.com/channels/",
	},
	docsRepositoryBase: "https://github.com/",
	footer: {
		text: (
			<span>Apache 2.0 {new Date().getFullYear()} © Motomon</span>
		),
	},
	editLink: {
		text: (
			<span>Contribute to Motomon | Edit on GitHub</span>
		),
	},
	primaryHue: {light: 315, dark: 315},
	useNextSeoProps() {
		const { asPath } = useRouter();
		if (asPath !== "/") {
			return {
				titleTemplate: "%s",
			};
		}
	},
	themeSwitch: {
		useOptions() {
			return {
				light: "Light",
				dark: "Dark",
				system: "System",
			};
		},
	},
};

export default config
