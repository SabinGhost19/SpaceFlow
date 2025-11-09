// Simple Google Calendar fetch helper (no OAuth, public calendar or API key restricted)
// Docs: https://developers.google.com/calendar/api/v3/reference/events/list
// We use the Events: list endpoint with API key and calendarId to pull events for a given day.

export interface GoogleCalendarEvent {
	id: string;
	summary?: string;
	description?: string;
	start: { date?: string; dateTime?: string; timeZone?: string };
	end: { date?: string; dateTime?: string; timeZone?: string };
	location?: string;
}

export interface FetchedEvent {
	title: string;
	start: Date;
	end: Date;
	location?: string;
	description?: string;
	// lightweight hints parsed from title/description text if present
	participantsCount?: number;
	requiredAmenities?: string[];
	raw: GoogleCalendarEvent;
}

// Hardcoded credentials as requested
const API_KEY = "AIzaSyChRZCLZlHlWIiJXP2Y_1Yf0iKfepM5J6k";
const CALENDAR_ID = encodeURIComponent("lucateodor47@gmail.com");

/**
 * Fetch events for a specific date (local) from Google Calendar.
 * Uses a time range from 00:00 to 23:59 for that date in the user's local TZ.
 */
export async function fetchEventsForDate(date: Date): Promise<FetchedEvent[]> {
	if (!API_KEY || !CALENDAR_ID) return [];

	// Build timeMin/timeMax in ISO (local timezone) then convert to UTC by using toISOString
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	const timeMin = startOfDay.toISOString();
	const timeMax = endOfDay.toISOString();

	const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${encodeURIComponent(
		timeMin
	)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&key=${API_KEY}`;

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch events (${res.status})`);
	}
	const data = await res.json();
	const events: GoogleCalendarEvent[] = data.items || [];

	return events
		.map((e) => {
			const startStr = e.start.dateTime || e.start.date;
			const endStr = e.end.dateTime || e.end.date;
			if (!startStr || !endStr) return null;
			const start = new Date(startStr);
			const end = new Date(endStr);
				const base: FetchedEvent = {
					title: e.summary || "(No title)",
					start,
					end,
					location: e.location,
					description: e.description,
					raw: e,
				};
				const parsed = extractHintsFromText(`${e.summary || ""} ${e.description || ""}`);
				if (parsed.participantsCount) base.participantsCount = parsed.participantsCount;
				if (parsed.requiredAmenities && parsed.requiredAmenities.length)
					base.requiredAmenities = parsed.requiredAmenities;
				return base;
		})
		.filter(Boolean) as FetchedEvent[];
}

/**
	 * Build a structured natural-language prompt string the AI can reliably use.
	 * We provide both a human summary and a strict activity list with explicit fields.
 */
export function buildPromptFromEvents(events: FetchedEvent[], date: Date): string {
	if (events.length === 0) {
		return "Existing calendar events: (none for selected date)";
	}
	const lines = [
		`Existing calendar events for ${date.toLocaleDateString()}:`,
		...events.map((ev) => {
			const startTime = formatHM(ev.start);
			const endTime = formatHM(ev.end);
			const parts = [ev.title];
			if (ev.participantsCount) parts.push(`(${ev.participantsCount} people)`);
			if (ev.requiredAmenities?.length) parts.push(`needs ${ev.requiredAmenities.join(', ')}`);
			parts.push(`from ${startTime} to ${endTime}`);
			if (ev.location) parts.push(`at ${ev.location}`);
			return "- " + parts.join(" ");
		}),
		"You can plan rooms matching these times or adjust as needed.",
	];
	return lines.join("\n");
}

export async function importCalendarPrompt(date: Date): Promise<string> {
	const events = await fetchEventsForDate(date);
	return buildPromptFromEvents(events, date);
}

	// Helpers
	function formatHM(d: Date) {
		const h = String(d.getHours()).padStart(2, "0");
		const m = String(d.getMinutes()).padStart(2, "0");
		return `${h}:${m}`;
	}

	function sanitizeName(name: string) {
		return name.replace(/\n/g, " ").trim();
	}

	function extractHintsFromText(text: string): { participantsCount?: number; requiredAmenities?: string[] } {
		const out: { participantsCount?: number; requiredAmenities?: string[] } = {};
		const lower = text.toLowerCase();

		// participants
		const pplMatch = lower.match(/(?:for|participants?:?)\s*(\d{1,3})\s*(?:people|persons|pax)?/);
		if (pplMatch) {
			const n = parseInt(pplMatch[1], 10);
			if (!isNaN(n) && n > 0) out.participantsCount = n;
		}

		const amenities: string[] = [];
		if (/projector(s)?/.test(lower)) amenities.push("projector");
		if (/whiteboard(s)?/.test(lower)) amenities.push("whiteboard");
		if (/video\s*(call|conference)/.test(lower)) amenities.push("video conference");
		if (/wifi|wi-fi/.test(lower)) amenities.push("wifi");
		if (/(power\s*)?outlet(s)?/.test(lower)) amenities.push("power outlets");
		if (/soundproof|quiet/.test(lower)) amenities.push("soundproof");
		if (amenities.length) out.requiredAmenities = amenities;

		return out;
	}
