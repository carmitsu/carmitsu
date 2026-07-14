import Image from 'next/image';
import { Article, formatArticleDate } from '@/utils/articles';
import RichTextRenderer from './richTextRenderer';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <section className="px-6 md:px-14 pb-3 my-2">
      <article className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="max-md:text-2xl md:text-3xl lg:text-4xl">{article.title}</h1>
          <p className="text-foreground-500">{formatArticleDate(article.createdAt)}</p>
        </div>

        <div className="prose-custom">
          <RichTextRenderer content={article.body} />
        </div>

        {article.images.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-default-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.images.map((asset, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden h-48 sm:h-64 md:h-80">
                  <Image
                    src={asset.url}
                    alt={asset.title || article.title}
                    fill
                    unoptimized
                    className="object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
