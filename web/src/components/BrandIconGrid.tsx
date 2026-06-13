import {
	Apple,
	Facebook,
	Github,
	Gitlab,
	Globe,
	Instagram,
	Linkedin,
	MessageCircle,
	Music2,
	Slack,
	Twitch,
	Twitter,
	Youtube,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

function SpotifyIcon({ style }: { style?: React.CSSProperties }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" style={style}>
			<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.758-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 11-.453-1.492c3.633-1.102 8.147-.568 11.233 1.329a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.533-1.072 9.404-.865 13.115 1.338a.934.934 0 11-.954 1.608z" />
		</svg>
	);
}


function WhatsAppIcon({ style }: { style?: React.CSSProperties }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" style={style}>
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
		</svg>
	);
}

type IconComp = ComponentType<{ style?: React.CSSProperties }>;

const ICONS: IconComp[] = [
	Github as IconComp,
	Gitlab as IconComp,
	Twitter as IconComp,
	Youtube as IconComp,
	Facebook as IconComp,
	Instagram as IconComp,
	Linkedin as IconComp,
	Twitch as IconComp,
	Slack as IconComp,
	Apple as IconComp,
	Music2 as IconComp,
	MessageCircle as IconComp,
	Globe as IconComp,
	SpotifyIcon,
	WhatsAppIcon,
];

const CELL = 70;
const COLS = 28;
const ROWS = 22;
const POOL = 90;
const FADE_MS = 1300;
const MIN_HOLD_MS = 2500;
const MAX_HOLD_MS = 6500;

const PEAK_OPACITY = 0.9;
const CELL_BG_OPACITY = 0.09;
const ICON_OPACITY = 0.28;

interface FloatingIcon {
	id: number;
	col: number;
	row: number;
	iconIndex: number;
	visible: boolean;
}

function seeded(n: number): number {
	const x = Math.sin(n * 9301 + 49297) * 233280;
	return x - Math.floor(x);
}

function getRandomCell(existing: FloatingIcon[]): { col: number; row: number } {
	const occupied = new Set(existing.map((i) => `${i.col},${i.row}`));
	let col: number, row: number, tries = 0;
	do {
		col = Math.floor(Math.random() * COLS);
		row = Math.floor(Math.random() * ROWS);
		tries++;
	} while (occupied.has(`${col},${row}`) && tries < 60);
	return { col, row };
}

function initIcons(): FloatingIcon[] {
	return Array.from({ length: POOL }, (_, id) => ({
		id,
		col: Math.floor(seeded(id * 7 + 1) * COLS),
		row: Math.floor(seeded(id * 11 + 3) * ROWS),
		iconIndex: Math.floor(seeded(id * 13 + 5) * ICONS.length),
		visible: false,
	}));
}

const PATTERN_ID = "bgp-grid";
const GRADIENT_ID = "bgp-fade";
const MASK_ID = "bgp-mask";

// Applied to outer wrapper — fades center so hero text stays clean
const OUTER_MASK =
	"radial-gradient(ellipse 60% 70% at 50% 50%, transparent 10%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.6) 65%, black 80%)";

export function BrandIconGrid() {
	const [icons, setIcons] = useState<FloatingIcon[]>(initIcons);
	const cancelledRef = useRef(false);

	useEffect(() => {
		cancelledRef.current = false;
		const timers: ReturnType<typeof setTimeout>[] = [];

		function cycle(id: number) {
			if (cancelledRef.current) return;

			// Step 1: fade in at current position
			setIcons((prev) =>
				prev.map((icon) =>
					icon.id === id ? { ...icon, visible: true } : icon,
				),
			);

			const holdTime =
				MIN_HOLD_MS + Math.random() * (MAX_HOLD_MS - MIN_HOLD_MS);

			const t1 = setTimeout(() => {
				if (cancelledRef.current) return;

				// Step 2: fade out
				setIcons((prev) =>
					prev.map((icon) =>
						icon.id === id ? { ...icon, visible: false } : icon,
					),
				);

				const t2 = setTimeout(() => {
					if (cancelledRef.current) return;

					// Step 3: teleport to a new random cell with a new icon
					setIcons((prev) => {
						const others = prev.filter((i) => i.id !== id);
						const { col, row } = getRandomCell(others);
						return prev.map((icon) =>
							icon.id === id
								? {
										...icon,
										col,
										row,
										iconIndex: Math.floor(Math.random() * ICONS.length),
										visible: false,
									}
								: icon,
						);
					});

					// Step 4: tiny delay so React renders new position at opacity 0
					// before we trigger the fade-in, preventing a visible jump
					const t3 = setTimeout(() => cycle(id), 80);
					timers.push(t3);
				}, FADE_MS + 120);
				timers.push(t2);
			}, holdTime);
			timers.push(t1);
		}

		// Stagger initial start times so not all icons appear at once
		icons.forEach((icon) => {
			const t0 = setTimeout(
				() => cycle(icon.id),
				Math.random() * MAX_HOLD_MS,
			);
			timers.push(t0);
		});

		return () => {
			cancelledRef.current = true;
			timers.forEach(clearTimeout);
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div
			className="absolute inset-0 overflow-hidden pointer-events-none select-none text-foreground"
			aria-hidden="true"
			style={{ maskImage: OUTER_MASK, WebkitMaskImage: OUTER_MASK }}
		>
			{/* Oversized container so skew doesn't expose edges */}
			<div
				className="absolute"
				style={{
					width: "170%",
					height: "170%",
					left: "-35%",
					top: "-35%",
					transform: "skewY(-18deg)",
				}}
			>
				{/* Grid lines */}
				<svg className="absolute inset-0 w-full h-full" aria-hidden="true">
					<defs>
						<pattern
							id={PATTERN_ID}
							width={CELL}
							height={CELL}
							patternUnits="userSpaceOnUse"
						>
							<path
								d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
								fill="none"
								stroke="currentColor"
								strokeWidth="0.5"
								strokeOpacity="0.09"
							/>
						</pattern>
						<radialGradient
							id={GRADIENT_ID}
							cx="50%"
							cy="50%"
							r="50%"
							gradientUnits="objectBoundingBox"
						>
							<stop offset="0%" stopColor="white" stopOpacity="0" />
							<stop offset="45%" stopColor="white" stopOpacity="0.25" />
							<stop offset="75%" stopColor="white" stopOpacity="1" />
						</radialGradient>
						<mask id={MASK_ID}>
							<rect
								width="100%"
								height="100%"
								fill={`url(#${GRADIENT_ID})`}
							/>
						</mask>
					</defs>
					<rect
						width="100%"
						height="100%"
						fill={`url(#${PATTERN_ID})`}
						mask={`url(#${MASK_ID})`}
					/>
				</svg>

				{/* Teleporting icon cells */}
				{icons.map((icon) => {
					const Icon = ICONS[icon.iconIndex];
					return (
						<div
							key={icon.id}
							className="absolute"
							style={{
								left: icon.col * CELL,
								top: icon.row * CELL,
								width: CELL,
								height: CELL,
								opacity: icon.visible ? PEAK_OPACITY : 0,
								transition: `opacity ${FADE_MS}ms ease-in-out`,
							}}
						>
							{/* Cell highlight */}
							<div
								className="absolute inset-0"
								style={{
									backgroundColor: "currentColor",
									opacity: CELL_BG_OPACITY,
								}}
							/>
							{/* Icon */}
							<div className="absolute inset-0 flex items-center justify-center">
								<Icon style={{ width: 22, height: 22, opacity: ICON_OPACITY }} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
