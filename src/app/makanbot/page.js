import { NavbarMakanBot } from "@/components/ui/Navbar";
import FirebaseTest from "@/components/ui/FirebaseTest";

export default function MakanbotPage() {
	return (
		<main className="container mx-auto px-6 py-16">
			<NavbarMakanBot showDummyContent={false} />
			<h1 className="text-4xl font-bold mb-4">MakanBot</h1>
			<p className="text-neutral-600 dark:text-neutral-300 mb-8">
				This is a sample MakanBot page. Build your bot UI here.
			</p>
			<div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
				<p className="mb-2 font-medium">Sample call:</p>
				<code className="block whitespace-pre-wrap break-words text-sm">
					{`GET /api/python/health → {"status":"ok"}`}
				</code>
			</div>
			<div className="mt-6">
				<FirebaseTest />
			</div>
		</main>
	);
}


