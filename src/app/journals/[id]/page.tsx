import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { journals } from "@/content/journals";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ShareArticleButton } from "@/components/ui/ShareArticleButton";

interface JournalPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JournalPageProps) {
  const resolvedParams = await params;
  const journal = journals.find((j) => j.id === resolvedParams.id);
  
  if (!journal) {
    return {
      title: "Not Found",
      description: "The article you're looking for does not exist.",
    };
  }

  return {
    title: `${journal.title} | YogaJam Journals`,
    description: journal.excerpt,
  };
}

export default async function JournalReadingPage({ params }: JournalPageProps) {
  const resolvedParams = await params;
  const journal = journals.find((j) => j.id === resolvedParams.id);

  if (!journal) {
    notFound();
  }

  // Get 3 random related articles for the "Read Next" section
  const relatedArticles = journals
    .filter(j => j.id !== journal.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Calculate read time
  const wordCount = journal.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] w-full">
        <Image 
          src={journal.image}
          alt={journal.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/10" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16 pt-32">
          <div className="max-w-3xl mx-auto w-full px-6">
            <div className="flex items-center gap-3 mb-6">
              <time dateTime={journal.date} className="text-sm font-bold tracking-widest uppercase text-accent">
                {new Date(journal.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight mb-6">
              {journal.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
              {journal.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* Reading Container */}
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        
        {/* Author / Metadata / Share */}
        <div className="flex flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface flex items-center justify-center">
              <span className="font-heading font-bold text-accent">YJ</span>
            </div>
            <div>
              <div className="font-medium text-foreground text-lg">YogaJam Editorial</div>
              <div className="text-sm text-foreground-secondary">{readTimeMinutes} min read</div>
            </div>
          </div>
          <ShareArticleButton />
        </div>

        {/* Prose Content */}
        <div 
          className="prose prose-invert prose-lg md:prose-xl max-w-none
                     prose-headings:font-heading prose-headings:font-bold prose-headings:text-white
                     prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
                     prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                     prose-p:text-foreground-secondary prose-p:leading-relaxed prose-p:mb-8
                     prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                     prose-blockquote:border-l-accent prose-blockquote:bg-surface/50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:text-white prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:my-10
                     prose-li:text-foreground-secondary prose-li:my-2
                     prose-ul:my-8 prose-ol:my-8
                     prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: journal.content }}
        />
      </article>

      {/* Read Next Section */}
      <section className="py-12 md:py-16 relative z-10">
        <Container>
          <div className="flex flex-row justify-between items-end mb-6 gap-4">
            <SectionHeading title="Read Next" align="left" />
            <Link href="/journals" className="inline-flex group items-center gap-1.5 md:gap-2 text-foreground-secondary hover:text-accent-warm transition-colors text-sm md:text-base font-medium pb-1">
              <span>View all</span>
              <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar">
            {relatedArticles.map((article) => (
              <article 
                key={article.id} 
                className="flex-none w-[85vw] sm:w-[350px] md:w-[400px] h-[350px] relative group overflow-hidden bg-surface snap-start"
              >
                <Link href={`/journals/${article.id}`} className="block w-full h-full relative">
                  <Image 
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <header className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <time dateTime={article.date} className="text-sm font-medium text-white/70">
                          {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-heading text-white mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                        {article.title}
                      </h3>
                      <p className="text-white/80 line-clamp-2 text-sm md:text-base leading-relaxed">
                        {article.excerpt}
                      </p>
                    </header>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
