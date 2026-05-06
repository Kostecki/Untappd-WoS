import { useEffect, useRef } from "react";

export function useUmamiIdentify(
	userId: number,
	email: string,
	username: string,
) {
	const hasIdentified = useRef(false);

	useEffect(() => {
		if (hasIdentified.current) return;
		if (!userId || !email || !username) return;

		if (typeof window !== "undefined" && window.umami) {
			window.umami.identify({ userId, email, username });
			hasIdentified.current = true;
		}
	}, [userId, email, username]);
}
