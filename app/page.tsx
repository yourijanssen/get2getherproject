import type { Metadata } from "next";
import Image from "next/image";
import heroArtwork from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 1.png";
import loyaltyCard from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 21.png";
import giftArtwork from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 24.png";
import swapWorkshop from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 4.png";
import flowerWorkshop from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 7.png";
import texturedWorkshop from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 10.png";
import { SiteHeader } from "@/components/site-header";
import { homeContent, resolveLanguage } from "@/lib/language";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const language = resolveLanguage((await searchParams).lang);
  const content = homeContent[language];

  return {
    title: "Get2Gether",
    description: content.metaDescription,
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const language = resolveLanguage((await searchParams).lang);
  const content = homeContent[language];
  const workshopImages = [swapWorkshop, flowerWorkshop, texturedWorkshop];

  return (
    <>
      <SiteHeader language={language} />
      <main lang={language}>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heading}</h1>
            <p>{content.intro}</p>
            <a className="primary-link" href="#about">
              {content.heroCta}
            </a>
          </div>
          <Image
            className="hero-image"
            src={heroArtwork}
            alt=""
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
          />
        </section>

        <section className="content-section" id="about">
          <div>
            <h2>{content.sections.aboutTitle}</h2>
            <p>{content.sections.aboutBody}</p>
          </div>
          <Image src={flowerWorkshop} alt="" sizes="(max-width: 760px) 100vw, 40vw" />
        </section>

        <section className="services-section" id="services">
          <header className="section-heading">
            <h2>{content.sections.servicesTitle}</h2>
            <p>{content.sections.servicesBody}</p>
          </header>
          <div className="service-grid">
            <article className="service-card">
              <Image src={giftArtwork} alt="" sizes="(max-width: 760px) 100vw, 38vw" />
              <div>
                <h3>{content.sections.giftCardTitle}</h3>
                <p>{content.sections.giftCardBody}</p>
              </div>
            </article>
            <article className="service-card">
              <Image src={loyaltyCard} alt="" sizes="(max-width: 760px) 100vw, 38vw" />
              <div>
                <h3>{content.sections.loyaltyCardTitle}</h3>
                <p>{content.sections.loyaltyCardBody}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="content-section content-section-alt" id="projects">
          <Image src={texturedWorkshop} alt="" sizes="(max-width: 760px) 100vw, 40vw" />
          <div>
            <h2>{content.sections.projectsTitle}</h2>
            <p>{content.sections.projectsBody}</p>
          </div>
        </section>

        <section className="references-section" id="references">
          <header className="section-heading">
            <h2>{content.sections.referencesTitle}</h2>
            <p>{content.sections.referencesBody}</p>
          </header>
          <div className="reference-grid">
            {content.references.map((reference, index) => (
              <article className="reference-card" key={reference.title}>
                <Image
                  src={workshopImages[index]}
                  alt=""
                  sizes="(max-width: 760px) 100vw, 30vw"
                />
                <h3>{reference.title}</h3>
                <p>{reference.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <h2>{content.sections.contactTitle}</h2>
          <p>{content.sections.contactBody}</p>
        </section>
      </main>
    </>
  );
}
