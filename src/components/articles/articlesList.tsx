import Link from 'next/link';
import Image from 'next/image';
import { Article, getExcerpt, formatArticleDate } from '@/utils/articles';

interface ArticlesListProps {
  articles: Article[];
}

export default function ArticlesList({ articles }: ArticlesListProps) {
  if (articles.length === 0) {
    return (
      <section className="px-6 md:px-14 pb-3">
        <div className="space-y-4">
          <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">Artykuły</h1>
          <p className="text-foreground-500">Brak artykułów do wyświetlenia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-14 pb-3">
      <div className="space-y-4">
        <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">Artykuły</h1>
        <div className="flex flex-col lg:grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`}>
              <div className="flex flex-col h-full rounded-xl overflow-hidden bg-content1 hover:bg-content2 transition-colors cursor-pointer">
                <div className="relative h-56 w-full">
                  {article.images.length > 0 ? (
                    <Image
                      src={article.images[0].url}
                      alt={article.images[0].title || article.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-default-200 flex items-center justify-center">
                      <span className="text-default-400">Brak zdjęcia</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4 flex-1">
                  <h3 className="text-lg md:text-xl font-semibold line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-foreground-500">{formatArticleDate(article.createdAt)}</p>
                  <p className="text-foreground-500 line-clamp-3 mt-2 flex-1">
                    {getExcerpt(article.body)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
