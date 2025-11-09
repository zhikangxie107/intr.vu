import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Auth0Provider from '../providers/Auth0Provider'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata = {
	title: 'intr.vu',
	description: 'Hackathon project with Auth0 authentication',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<Auth0Provider>
				<body className={`${geistSans.variable} ${geistMono.variable}`}>
					{children}
				</body>
			</Auth0Provider>
		</html>
	);
}
