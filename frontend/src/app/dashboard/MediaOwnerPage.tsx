"use client";

import React from "react";
import { addMedia, getAllMedia } from "../../services/MediaService";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import styles from "./MediaOwnerPage.module.css";
import {
	Modal,
	TextInput,
	Select,
	Checkbox,
	Button,
	ScrollArea,
} from "@mantine/core";


export default function MediaOwnerPage() {
	const [opened, setOpened] = React.useState(false);
	const [category, setCategory] = React.useState<string | null>(null);
	const [rows, setRows] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(false);

	// form state
	const [mediaName, setMediaName] = React.useState("");
	const [ownerName, setOwnerName] = React.useState("");
	const [resolution, setResolution] = React.useState("");
	const [displayType, setDisplayType] = React.useState<string | null>(null);
	const [loopDuration, setLoopDuration] = React.useState("");
	const [aspectRatio, setAspectRatio] = React.useState("");
	const [widthCm, setWidthCm] = React.useState<string>("");
	const [heightCm, setHeightCm] = React.useState<string>("");
	const [priceInput, setPriceInput] = React.useState("");
	const [dailyImpressions, setDailyImpressions] = React.useState<number | null>(null);
	const [addressInput, setAddressInput] = React.useState("");

	const [selectedDays, setSelectedDays] = React.useState<Record<string, boolean>>({
		Monday: true,
		Tuesday: true,
		Wednesday: true,
		Thursday: true,
		Friday: true,
		Saturday: false,
		Sunday: false,
	});

	const [dayTimes, setDayTimes] = React.useState<Record<string, { start: string; end: string }>>(() => ({
		Monday: { start: "00:00", end: "00:00" },
		Tuesday: { start: "00:00", end: "00:00" },
		Wednesday: { start: "00:00", end: "00:00" },
		Thursday: { start: "00:00", end: "00:00" },
		Friday: { start: "00:00", end: "00:00" },
		Saturday: { start: "00:00", end: "00:00" },
		Sunday: { start: "00:00", end: "00:00" },
	}));

	function updateDayTime(day: string, part: "start" | "end", value: string) {
		setDayTimes((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				[part]: value,
			},
		}));
	}

	const [selectedMonths, setSelectedMonths] = React.useState<Record<string, boolean>>(() => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		const obj: Record<string, boolean> = {};
		months.forEach((m) => (obj[m] = true));
		return obj;
	});

	function resetForm() {
		setMediaName("");
		setOwnerName("");
		setResolution("");
		setDisplayType(null);
		setLoopDuration("");
		setAspectRatio("");
		setPriceInput("");
		setDailyImpressions(null);
		setAddressInput("");
		setSelectedDays({ Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false });
		setDayTimes((p) => {
			const copy = { ...p };
			Object.keys(copy).forEach((k) => (copy[k] = { start: "00:00", end: "00:00" }));
			return copy;
		});
	}

	// Load all media from the backend when the component mounts
	React.useEffect(() => {
		let mounted = true;
		setLoading(true);
		getAllMedia()
			.then((data) => {
				if (!mounted) return;
				const mapped = (data || []).map((m) => ({
					id: m.id,
					name: m.title,
					image: m.imageUrl ?? null,
					adsDisplayed: 0,
					pending: 0,
					status: m.status ?? "Pending Admin Approval",
					timeUntil: "-",
					price: m.price ? (typeof m.price === "number" ? `$${m.price}` : String(m.price)) : "$0",
				}));
				setRows(mapped);
			})
			.catch((err) => {
				console.error("Failed to load media:", err);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, []);

	async function handleSave() {
		// minimal validation
		if (!mediaName) return alert("Please enter a media name");

		// build schedule object from selected months and per-day times
		const selectedMonthsArray = Object.keys(selectedMonths).filter((m) => !!selectedMonths[m]);
		const weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		const weeklySchedule = weekOrder.map((d) => {
			const isActive = !!selectedDays[d];
			return {
				dayOfWeek: d,
				isActive,
				startTime: isActive ? (dayTimes[d]?.start ?? null) : null,
				endTime: isActive ? (dayTimes[d]?.end ?? null) : null,
			};
		});

		const scheduleObj = {
			selectedMonths: selectedMonthsArray,
			weeklySchedule,
		};

		const payload = {
			title: mediaName,
			mediaOwnerName: ownerName,
			address: addressInput,
			resolution: resolution,
			aspectRatio: aspectRatio,
			loopDuration: loopDuration ? Number(loopDuration) : null,
			width: widthCm ? Number(widthCm) : null,
			height: heightCm ? Number(heightCm) : null,
			price: priceInput ? priceInput : null,
			schedule: scheduleObj,
			status: null,
			typeOfDisplay: displayType,
		};

		try {
			const created = await addMedia(payload);
			const newRow = {
				id: created.id,
				name: mediaName,
				image: created.imageUrl ?? null,
				adsDisplayed: 0,
				pending: 0,
				status: created.status ?? "Pending Admin Approval",
				timeUntil: "-",
				price: priceInput || "$0",
			};
			setRows((r) => [newRow, ...r]);
			setOpened(false);
			resetForm();
		} catch (err: any) {
			console.error(err);
			alert("Failed to save media: " + (err?.message ?? err));
		}
	}

	return (
		<div className={styles.pageRoot}>
			<NavBar />

			<div className={styles.container}>
				<aside className={styles.sidebar}>
					<ul className={styles.sideList}>
						<li className={styles.sideItem}>Overview</li>
						<li className={`${styles.sideItem} ${styles.active}`}>Media</li>
						<li className={styles.sideItem}>Displayed ads</li>
						<li className={styles.sideItem}>
							Ad requests <span className={styles.badge}>{rows.length}</span>
						</li>
						<li className={styles.sideItem}>Transactions</li>
					</ul>
				</aside>

				<main className={styles.main}>
					<div className={styles.headerRow}>
						<button className={styles.addButton} onClick={() => setOpened(true)}>
							Add new media
						</button>
					</div>

					<Modal
						opened={opened}
						onClose={() => setOpened(false)}
						title="Publish Media"
						size="lg"
							centered
							overlayProps={{ opacity: 0.55 }}
						>
							<ScrollArea style={{ height: 420 }}>
						<div style={{ paddingRight: 8 }}>
							<h3>Details</h3>
							<TextInput label="Media Name" placeholder="Media name" value={mediaName} onChange={(e) => setMediaName(e.currentTarget.value)} required />
							<div style={{ height: 12 }} />
							<TextInput label="Media Owner" placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.currentTarget.value)} />
							<div style={{ height: 12 }} />

							<div style={{ height: 12 }} />
							<TextInput label="Address" placeholder="Placeholder text" value={addressInput} onChange={(e) => setAddressInput(e.currentTarget.value)} required />

							<div style={{ height: 12 }} />
									<Select
										label="Type of display"
										data={[{ value: "DIGITAL", label: "Digital" }, { value: "POSTER", label: "Poster" }]}
										placeholder="Select type"
										value={displayType ?? undefined}
										onChange={(v) => {
											const val = typeof v === "string" ? v : (v as string | null);
											setDisplayType(val);
											setCategory(val);
											if (val === "POSTER") {
												// clear digital-only fields
												setResolution("");
												setAspectRatio("");
											}
											if (val === "DIGITAL") {
												// clear poster-only fields
												setWidthCm("");
												setHeightCm("");
											}
										}}
									/>
							<div style={{ height: 12 }} />
							{displayType?.toLowerCase() ===  "digital" && (
								<TextInput label="Loop duration (sec)" placeholder="e.g. 30" value={loopDuration} onChange={(e) => setLoopDuration(e.currentTarget.value)} />
							)}
							{displayType?.toLowerCase() === "digital" && (
								<>
									<div style={{ height: 12 }} />
									<TextInput label="Resolution (px)" placeholder="Ex. 1920x1080" value={resolution} onChange={(e) => setResolution(e.currentTarget.value)} required />

									<div style={{ height: 12 }} />
									<TextInput label="Aspect ratio" placeholder="e.g. 16:9" value={aspectRatio} onChange={(e) => setAspectRatio(e.currentTarget.value)} />
								</>
							)}

							{displayType?.toLowerCase() === "poster" && (
								<>
									<div style={{ height: 12 }} />
									<div style={{ display: "flex", gap: 8 }}>
										<TextInput label="Width (cm)" placeholder="Ex. 80" type="number" style={{ flex: 1 }} value={widthCm} onChange={(e) => setWidthCm(e.currentTarget.value)} />
										<TextInput label="Height (cm)" placeholder="Ex. 200" type="number" style={{ flex: 1 }} value={heightCm} onChange={(e) => setHeightCm(e.currentTarget.value)} />
									</div>
								</>
							)}

							<div style={{ height: 12 }} />
							<TextInput label="Price (per week)" placeholder="$50" type="text" value={priceInput} onChange={(e) => setPriceInput(e.currentTarget.value)} />

								<div style={{ height: 18 }} />
								<h3>Months</h3>
							<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
								{Object.keys(selectedMonths).map((m) => (
									<Checkbox key={m} label={m} checked={!!selectedMonths[m]} onChange={(e) => setSelectedMonths((p) => ({ ...p, [m]: (e.target as HTMLInputElement).checked }))} />
								))}
							</div>

								<div style={{ height: 18 }} />
								<h3>Days & Times</h3>
								<div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 8, alignItems: "center" }}>
									<div />
									<strong>Start</strong>
									<strong>End</strong>
									{[
										"Monday",
										"Tuesday",
										"Wednesday",
										"Thursday",
										"Friday",
										"Saturday",
										"Sunday",
									].map((d) => (
										<React.Fragment key={d}>
											<Checkbox
												label={d}
												checked={!!selectedDays[d]}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
													setSelectedDays((prev) => ({ ...prev, [d]: (e.target as HTMLInputElement).checked }))
												}
											/>
											<TextInput
												placeholder={selectedDays[d] ? "00:00" : "Closed"}
												disabled={!selectedDays[d]}
												type="time"
												value={dayTimes[d]?.start ?? ""}
												onChange={(e) => updateDayTime(d, "start", e.currentTarget.value)}
											/>
											<TextInput
												placeholder={selectedDays[d] ? "00:00" : "Closed"}
												disabled={!selectedDays[d]}
												type="time"
												value={dayTimes[d]?.end ?? ""}
												onChange={(e) => updateDayTime(d, "end", e.currentTarget.value)}
											/>
										</React.Fragment>
									))}
								</div>
							</div>
						</ScrollArea>

						<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
							<Button variant="default" onClick={() => setOpened(false)} style={{ marginRight: 8 }}>
								Cancel
							</Button>
							<Button onClick={handleSave}>Save</Button>
						</div>
					</Modal>

					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Image</th>
									<th>Name</th>
									<th>Ads displayed</th>
									<th>Ads pending for approval</th>
									<th>Status</th>
									<th>Time until next update</th>
									<th>Price</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{rows.map((row) => (
									<tr key={row.id} className={styles.row}>
										<td>
											{row.image ? (
												<img src={row.image} alt={row.name} className={styles.thumb} />
											) : (
												<div className={styles.thumb} />
											)}
										</td>
										<td>{row.name}</td>
										<td>{`${row.adsDisplayed} ads currently displayed`}</td>
										<td>{`${row.pending} pending for approval`}</td>
										<td>
											<span
												className={
													row.status === "Active" ? styles.statusActive : styles.statusInactive
												}
											>
												{row.status}
											</span>
										</td>
										<td>{row.timeUntil}</td>
										<td>{row.price}</td>
										<td className={styles.actions}>
											<button className={styles.iconBtn}>✎</button>
											<button className={styles.iconBtn}>🗑️</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className={styles.pagination}>
						<button className={styles.pageBtn}>&larr;</button>
						<button className={`${styles.pageBtn} ${styles.current}`}>1</button>
						<button className={styles.pageBtn}>2</button>
						<button className={styles.pageBtn}>3</button>
						<span className={styles.ellipsis}>…</span>
						<button className={styles.pageBtn}>68</button>
						<button className={styles.pageBtn}>&rarr;</button>
					</div>
				</main>
			</div>

			<Footer />
		</div>
	);
}

