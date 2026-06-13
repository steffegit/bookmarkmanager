import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Download,
	Grid2X2,
	Grid3X3,
	LayoutGrid,
	LayoutList,
	Monitor,
	Moon,
	Sun,
} from "lucide-react";
import { useState } from "react";
import { ExportDialog } from "@/components/ExportDialog";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import {
	type GridColumns,
	type SortBy,
	useSettings,
	type ViewMode,
} from "@/hooks/useSettings";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
				{title}
			</p>
			<div className="flex flex-col gap-1">{children}</div>
		</div>
	);
}

function SettingRow({
	label,
	description,
	children,
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between px-3 py-3 rounded-sm border border-border bg-card">
			<div>
				<p className="text-xs font-medium text-foreground">{label}</p>
				{description && (
					<p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
						{description}
					</p>
				)}
			</div>
			<div className="shrink-0 ml-4">{children}</div>
		</div>
	);
}

function SegmentedControl<T extends string>({
	value,
	onChange,
	options,
}: {
	value: T;
	onChange: (v: T) => void;
	options: { value: T; label: React.ReactNode; title?: string }[];
}) {
	return (
		<div className="flex items-center gap-px bg-foreground/[0.06] border border-border rounded-sm p-px">
			{options.map((opt) => (
				<button
					key={String(opt.value)}
					type="button"
					title={opt.title}
					onClick={() => onChange(opt.value)}
					className={`flex items-center justify-center gap-1 h-6 px-2.5 rounded-[3px] text-xs font-mono transition-all duration-100 ${
						value === opt.value
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function SettingsPage() {
	const { settings, update } = useSettings();
	const { theme, setTheme } = useTheme();
	const { isAuthenticated } = useAuth();
	const [isExportOpen, setIsExportOpen] = useState(false);

	return (
		<div className="flex-1 flex justify-center px-4 py-12">
			<div className="flex flex-col max-w-lg w-full gap-8">
				<div>
					<h1 className="text-sm font-semibold text-foreground tracking-tight">
						Settings
					</h1>
					<p className="text-[11px] text-muted-foreground font-mono mt-0.5">
						Preferences are saved locally in your browser.
					</p>
				</div>

				<Section title="Appearance">
					<SettingRow
						label="Theme"
						description="Choose your preferred color scheme"
					>
						<SegmentedControl
							value={theme as string}
							onChange={(v) => setTheme(v as "dark" | "light" | "system")}
							options={[
								{
									value: "light",
									label: (
										<>
											<Sun className="w-3 h-3" />
											<span className="hidden sm:inline">Light</span>
										</>
									),
									title: "Light",
								},
								{
									value: "dark",
									label: (
										<>
											<Moon className="w-3 h-3" />
											<span className="hidden sm:inline">Dark</span>
										</>
									),
									title: "Dark",
								},
								{
									value: "system",
									label: (
										<>
											<Monitor className="w-3 h-3" />
											<span className="hidden sm:inline">System</span>
										</>
									),
									title: "System",
								},
							]}
						/>
					</SettingRow>
				</Section>

				<Section title="Layout">
					<SettingRow
						label="View mode"
						description="How bookmarks are displayed on the dashboard"
					>
						<SegmentedControl<ViewMode>
							value={settings.viewMode}
							onChange={(v) => update({ viewMode: v })}
							options={[
								{
									value: "grid",
									label: (
										<>
											<LayoutGrid className="w-3 h-3" />
											<span className="hidden sm:inline">Grid</span>
										</>
									),
									title: "Grid",
								},
								{
									value: "list",
									label: (
										<>
											<LayoutList className="w-3 h-3" />
											<span className="hidden sm:inline">List</span>
										</>
									),
									title: "List",
								},
							]}
						/>
					</SettingRow>

					{settings.viewMode === "grid" && (
						<SettingRow
							label="Grid columns"
							description="Number of columns in the bookmark grid"
						>
							<SegmentedControl<string>
								value={String(settings.gridColumns)}
								onChange={(v) =>
									update({ gridColumns: Number(v) as GridColumns })
								}
								options={[
									{
										value: "2",
										label: (
											<>
												<Grid2X2 className="w-3 h-3" />
												<span className="hidden sm:inline">2</span>
											</>
										),
										title: "2 columns",
									},
									{
										value: "3",
										label: (
											<>
												<Grid3X3 className="w-3 h-3" />
												<span className="hidden sm:inline">3</span>
											</>
										),
										title: "3 columns",
									},
									{
										value: "4",
										label: (
											<>
												<LayoutGrid className="w-3 h-3" />
												<span className="hidden sm:inline">4</span>
											</>
										),
										title: "4 columns",
									},
								]}
							/>
						</SettingRow>
					)}

					<SettingRow
						label="Default sort"
						description="How bookmarks are sorted by default"
					>
						<SegmentedControl<SortBy>
							value={settings.sortBy}
							onChange={(v) => update({ sortBy: v })}
							options={[
								{ value: "newest", label: "Newest", title: "Newest first" },
								{ value: "oldest", label: "Oldest", title: "Oldest first" },
								{ value: "alphabetical", label: "A–Z", title: "Alphabetical" },
							]}
						/>
					</SettingRow>
				</Section>

				{isAuthenticated && (
					<Section title="Data">
						<button
							type="button"
							className="flex items-center justify-between px-3 py-3 rounded-sm border border-border bg-card hover:border-primary/25 hover:bg-card/60 transition-all duration-150 group w-full text-left"
							onClick={() => setIsExportOpen(true)}
						>
							<div className="flex items-center gap-3">
								<Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
								<div>
									<p className="text-xs font-medium text-foreground">
										Export bookmarks
									</p>
									<p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
										Download as JSON or browser-compatible HTML
									</p>
								</div>
							</div>
						</button>
					</Section>
				)}

				<Link
					to="/"
					className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono w-fit"
				>
					← Back
				</Link>
			</div>

			<ExportDialog open={isExportOpen} setOpen={setIsExportOpen} />
		</div>
	);
}
