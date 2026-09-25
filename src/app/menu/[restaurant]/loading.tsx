/* Skeleton shown while the menu is fetched. Mirrors the real layout so nothing jumps when it arrives. */
const surface = "bg-[#F9FAFB] [@media(prefers-color-scheme:dark)]:bg-[#121212]";
const block = "animate-pulse bg-black/[0.06] [@media(prefers-color-scheme:dark)]:bg-white/[0.07]";

export default function MenuLoading() {
	return (
		<div className={`min-h-dvh ${surface}`} aria-busy="true" aria-live="polite">
			<span className="sr-only">Loading menu…</span>
			<div className="border-b border-black/5 [@media(prefers-color-scheme:dark)]:border-white/10">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
					<div className="flex items-center gap-3">
						<div className={`size-10 rounded-xl sm:size-12 sm:rounded-2xl ${block}`} />
						<div className="space-y-2">
							<div className={`h-5 w-36 rounded-md sm:w-44 ${block}`} />
							<div className={`h-3 w-24 rounded-md ${block}`} />
						</div>
					</div>
					<div className="flex gap-2">
						<div className={`h-11 w-20 rounded-full ${block}`} />
						<div className={`size-11 rounded-full ${block}`} />
					</div>
				</div>
				<div className="mx-auto flex max-w-6xl gap-2 overflow-hidden px-4 pt-0.5 pb-2.5 sm:px-6 lg:px-8">
					{[28, 24, 20, 24].map((w, i) => (
						<div key={i} className={`h-10 shrink-0 rounded-full ${block}`} style={{ width: `${w * 4}px` }} />
					))}
				</div>
			</div>
			<div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
				<div className={`mb-5 h-44 rounded-2xl sm:mb-6 sm:h-60 lg:h-72 lg:rounded-3xl ${block}`} />
				<div className={`mb-6 h-12 rounded-2xl sm:mb-8 lg:max-w-md ${block}`} />
				<div className={`mb-4 h-7 w-44 rounded-md ${block}`} />
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="overflow-hidden rounded-2xl border border-black/5 [@media(prefers-color-scheme:dark)]:border-white/10">
							<div className={`aspect-square ${block}`} />
							<div className="space-y-2 p-3 sm:p-3.5">
								<div className={`h-4 w-4/5 rounded ${block}`} />
								<div className={`h-3 w-1/2 rounded ${block}`} />
								<div className={`mt-3 h-5 w-16 rounded ${block}`} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
