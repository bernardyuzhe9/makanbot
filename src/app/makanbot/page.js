"use client";
import { NavbarMakanBot } from "@/components/ui/Navbar";
import { useChat } from "@/hooks/useChat";
import { useState } from "react";

export default function MakanbotPage() {
  const { messages, restaurants, isLoading, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState("");
	return (
		<main className="min-h-screen bg-background text-foreground">
			<NavbarMakanBot showDummyContent={false} />
			<section className="mx-auto max-w-7xl px-4 md:px-8 pt-24 md:pt-36 pb-24">
				<header className="mb-8 md:mb-12">
					<h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
						Find great food nearby with MakanBot
					</h1>
					<p className="mt-3 md:mt-4 text-neutral-600 dark:text-neutral-300 max-w-2xl">
						Describe your cravings, cuisine, budget, or distance. I’ll suggest places with details, maps, and tips.
					</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Chat panel */}
					<div className="lg:col-span-7">
						<div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/60 backdrop-blur p-4 md:p-6">
							<div className="space-y-4 md:space-y-6 max-h-[60vh] md:max-h-[68vh] overflow-y-auto pr-1">
								{/* Real chat messages */}
								{messages.map((message) => (
									<div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}>
										{message.type === "bot" && (
											<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
												MB
											</div>
										)}
										<div className={`rounded-xl px-3 py-2 text-sm md:text-base max-w-[85%] ${
											message.type === "user" 
												? "bg-primary text-primary-foreground" 
												: "bg-neutral-100 dark:bg-neutral-900"
										}`}>
											{message.content}
										</div>
										{message.type === "user" && (
											<div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
										)}
									</div>
								))}
								{isLoading && (
									<div className="flex gap-3">
										<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
											MB
										</div>
										<div className="rounded-xl bg-neutral-100 dark:bg-neutral-900 px-3 py-2 text-sm md:text-base">
											<div className="flex items-center gap-2">
												<div className="flex gap-1">
													<div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
													<div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
													<div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
												</div>
												<span className="text-neutral-500">Thinking...</span>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="sticky bottom-0 left-0 right-0 mt-4">
								<form 
									onSubmit={(e) => {
										e.preventDefault();
										if (inputMessage.trim()) {
											sendMessage(inputMessage);
											setInputMessage("");
										}
									}}
									className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 flex items-center gap-2"
								>
									<input
										type="text"
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										placeholder="Find sushi under RM30 near KLCC, open now…"
										className="flex-1 bg-transparent outline-none text-sm md:text-base px-2 py-2"
										disabled={isLoading}
									/>
									<button 
										type="submit"
										disabled={isLoading || !inputMessage.trim()}
										className="shrink-0 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isLoading ? "..." : "Send"}
									</button>
								</form>
								<div className="mt-2 flex flex-wrap gap-2">
									{["Breakfast","Halal","Spicy","Open now","< 2km"].map((chip) => (
										<button 
											key={chip} 
											onClick={() => {
												setInputMessage(chip);
												sendMessage(chip);
											}}
											className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
										>
											{chip}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
					{/* Suggestions panel */}
					<div className="lg:col-span-5">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
							{restaurants.length > 0 ? (
								restaurants.slice(0, 4).map((restaurant, i) => (
									<div key={i} className="group overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/60 backdrop-blur">
										<div className="relative h-32 md:h-40 w-full bg-neutral-200 dark:bg-neutral-800" />
										<div className="p-4">
											<div className="flex items-center justify-between gap-2">
												<h3 className="font-medium">{restaurant.name}</h3>
												<span className="text-xs text-neutral-500">{restaurant.rating || "4.0"} ★</span>
											</div>
											<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
												{restaurant.vicinity || "Great food nearby"} • {restaurant.price_level || "$$"}
											</p>
											<div className="mt-3 flex items-center justify-between">
												<button className="text-xs rounded-md px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">View</button>
												<button className="text-xs rounded-md px-3 py-1.5 border border-neutral-200 dark:border-neutral-800">Directions</button>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="col-span-2 text-center py-12 text-neutral-500 dark:text-neutral-400">
									<p>Ask MakanBot for food recommendations to see restaurants here!</p>
								</div>
							)}
						</div>
			</div>
			</div>
			</section>
		</main>
	);
}


