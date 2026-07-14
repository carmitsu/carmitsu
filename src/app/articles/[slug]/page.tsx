import Navigation from '@/components/navbar';
import Footer from '@/components/footer';
import ArticleDetail from '@/components/articles/articleDetail';
import { getArticles, getArticleBySlug } from '@/utils/articles';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const language = process.env.SITE_LANGUAGE || 'pl';
  const articles = await getArticles(language);
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const language = process.env.SITE_LANGUAGE || 'pl';
  const article = await getArticleBySlug(slug, language);

  if (!article) {
    return { title: 'Artykuł nie znaleziony' };
  }

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || 'https://carmitsu.pl';

  return {
    title: article.title,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      url: `${baseUrl}/articles/${article.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const language = process.env.SITE_LANGUAGE || 'pl';
  const article = await getArticleBySlug(slug, language);

  if (!article) {
    notFound();
  }

  return (
    <main>
      <Navigation />
      <ArticleDetail article={article} />
      <Footer />
    </main>
  );
}
