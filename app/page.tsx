import { FeatureGrid } from "@/components/feature-grid";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ShowcaseSection } from "@/components/showcase-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrustSection } from "@/components/trust-section";
import { getHomeContent } from "@/lib/site-content";

export default async function Home() {
	const content = await getHomeContent();

	return (
		<>
			<SiteHeader />
			<main>
				<Hero />
				<ShowcaseSection content={content} />
				<HowItWorks />
				<FeatureGrid />
				<TrustSection />
			</main>
			<SiteFooter />
		</>
	);
}
