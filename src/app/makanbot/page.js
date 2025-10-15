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
											<div className="whitespace-pre-wrap">
												{message.content.split('\n').map((line, index) => {
													// Handle bold text formatting
													if (line.includes('**') && !line.includes(' - ')) {
														const parts = line.split(/(\*\*.*?\*\*)/g);
														return (
															<div key={index} className="mb-1">
																{parts.map((part, partIndex) => {
																	if (part.startsWith('**') && part.endsWith('**')) {
																		return (
																			<strong key={partIndex} className="font-semibold text-neutral-900 dark:text-neutral-100">
																				{part.slice(2, -2)}
																			</strong>
																		);
																	}
																	return part;
																})}
															</div>
														);
													}
													return <div key={index} className="mb-1">{line}</div>;
												})}
											</div>
											
											{/* Place Cards */}
											{message.places && message.places.length > 0 && (
												<div className="mt-3 space-y-2">
													{message.places.map((place) => (
														<div 
															key={place.id}
															className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:shadow-md transition-shadow"
															onClick={() => {
																// Open Google Maps or show more info
																const searchQuery = encodeURIComponent(`${place.name} ${place.description}`);
																window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
															}}
														>
															<div className="flex items-start gap-3">
																<div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
																	📍
																</div>
																<div className="flex-1">
																	<h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
																		{place.name}
																	</h4>
																	<p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
																		{place.description}
																	</p>
																	<div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
																		Tap to view on Maps →
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											)}
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
						{/* Price Range Summary */}
						{restaurants.length > 0 && (
							<div className="mb-4 p-3 bg-muted/50 rounded-lg border">
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium">💰 Price Range:</span>
									{(() => {
										const priceLevels = restaurants.map(r => r.price_level).filter(p => p !== undefined && p !== null);
										
										if (priceLevels.length === 0) {
											return <span className="text-muted-foreground">NA</span>;
										}
										
										const minPrice = Math.min(...priceLevels);
										const maxPrice = Math.max(...priceLevels);
										
										// Convert Google Maps price levels to estimated RM ranges for Malaysia
										const getPriceRange = (level) => {
											switch(level) {
												case 0: return "RM1 - RM20";
												case 1: return "RM20 - RM40";
												case 2: return "RM40 - RM60";
												case 3: return "RM60 - RM80";
												case 4: return "RM80 - RM100";
												default: return "NA";
											}
										};
										
										if (minPrice === maxPrice) {
											return <span className="text-muted-foreground">{getPriceRange(minPrice)}</span>;
										} else {
											const minRange = getPriceRange(minPrice);
											const maxRange = getPriceRange(maxPrice);
											// Extract the min and max values
											const minValue = minRange.split(' - ')[0];
											const maxValue = maxRange.includes('+') ? maxRange : maxRange.split(' - ')[1];
											return <span className="text-muted-foreground">{`${minValue} - ${maxValue}`}</span>;
										}
									})()}
								</div>
							</div>
						)}
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
							{restaurants.length > 0 ? (
								restaurants.slice(0, 4).map((restaurant, i) => (
									<div key={i} className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
										{/* Restaurant Photo */}
										<div className="relative h-48 w-full overflow-hidden">
											{restaurant.photos && restaurant.photos.length > 0 ? (
												<img 
													src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=AIzaSyCphF8h1fw6g2n9ys60PX3Oa-by9h7lUcU`}
													alt={restaurant.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
												/>
											) : (
												<div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
													<div className="text-6xl">🍽️</div>
												</div>
											)}
											{/* Rating Badge */}
											<div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
												<span className="text-yellow-500 text-sm">★</span>
												<span className="text-sm font-medium">{restaurant.rating || "4.0"}</span>
											</div>
										</div>
										
										{/* Restaurant Info */}
										<div className="p-4 space-y-3">
											{/* Name and Price Level */}
											<div className="flex items-start justify-between gap-2">
												<h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2">
													{restaurant.name}
												</h3>
												<div className="text-right">
													<div className="text-sm font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
														{(() => {
															const level = restaurant.price_level;
															if (level === undefined || level === null) {
																return "NA";
															}
															// Convert Google Maps price level to estimated RM range
															switch(level) {
																case 0: return "RM1-20";
																case 1: return "RM20-40";
																case 2: return "RM40-60";
																case 3: return "RM60-80";
																case 4: return "RM80-100";
																default: return "NA";
															}
														})()}
													</div>
													<div className="text-xs text-muted-foreground">
														{restaurant.price_level === 1 ? "Budget" : 
														 restaurant.price_level === 2 ? "Moderate" :
														 restaurant.price_level === 3 ? "Expensive" :
														 restaurant.price_level === 4 ? "Very Expensive" : 
														 restaurant.price_level === undefined || restaurant.price_level === null ? "Price varies" : "Moderate"}
													</div>
												</div>
											</div>
											
											{/* Address */}
											<p className="text-sm text-muted-foreground line-clamp-2">
												{restaurant.vicinity || "Great food nearby"}
											</p>
											
											{/* Price Level and Operating Hours */}
											<div className="flex items-center justify-between gap-2">
												{/* Price Level Badge */}
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													restaurant.price_level === 1 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
													restaurant.price_level === 2 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
													restaurant.price_level === 3 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" :
													restaurant.price_level === 4 ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
													"bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
												}`}>
													💰 {(() => {
														const level = restaurant.price_level;
														if (level === undefined || level === null) {
															return "NA";
														}
														// Convert Google Maps price level to estimated RM range
														switch(level) {
															case 0: return "RM1-20";
															case 1: return "RM20-40";
															case 2: return "RM40-60";
															case 3: return "RM60-80";
															case 4: return "RM80-100";
															default: return "NA";
														}
													})()} • {
														restaurant.price_level === 1 ? "Budget" : 
														restaurant.price_level === 2 ? "Moderate" :
														restaurant.price_level === 3 ? "Expensive" :
														restaurant.price_level === 4 ? "Very Expensive" : 
														restaurant.price_level === undefined || restaurant.price_level === null ? "NA" : "Moderate"
													}
												</span>
												
												{/* Operating Hours */}
												{restaurant.opening_hours && (
													<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														restaurant.opening_hours.open_now 
															? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
															: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
													}`}>
														<div className={`w-2 h-2 rounded-full mr-1.5 ${
															restaurant.opening_hours.open_now ? "bg-green-500" : "bg-red-500"
														}`}></div>
														{restaurant.opening_hours.open_now ? "Open Now" : "Closed"}
													</span>
												)}
											</div>
											
											{/* Action Buttons */}
											<div className="flex gap-2 pt-2">
												<button 
													onClick={() => {
														const searchQuery = encodeURIComponent(restaurant.name + " " + restaurant.vicinity);
														window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
													}}
													className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
												>
													View Details
												</button>
												<button 
													onClick={() => {
														const searchQuery = encodeURIComponent(restaurant.name + " " + restaurant.vicinity);
														window.open(`https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`, '_blank');
													}}
													className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
												>
													Directions
												</button>
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


