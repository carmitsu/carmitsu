import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { Document, BLOCKS, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';

const renderOptions: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const target = node.data.target?.fields;
      if (!target?.file) return null;

      const { file, title } = target;
      const url = file.url?.startsWith('//') ? `https:${file.url}` : file.url;
      if (!url) return null;

      const width = file.details?.image?.width || 800;
      const height = file.details?.image?.height || 600;

      return (
        <div className="my-6">
          <Image
            src={url}
            alt={title || 'Image'}
            width={width}
            height={height}
            className="rounded-xl object-cover w-full h-auto"
          />
        </div>
      );
    },
    [BLOCKS.PARAGRAPH]: (node, children) => {
      const text = node.content
        .filter((c) => c.nodeType === 'text')
        .map((c) => ('value' in c ? c.value : ''))
        .join('');
      if (text.trim() === '') return null;
      return <p className="mb-4 leading-relaxed">{children}</p>;
    },
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-3">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-5 mb-2">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 className="text-lg md:text-xl font-semibold mt-4 mb-2">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (_node, children) => (
      <h5 className="text-base md:text-lg font-semibold mt-4 mb-2">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (_node, children) => (
      <h6 className="text-sm md:text-base font-semibold mt-3 mb-2">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="list-disc mb-4 space-y-1 pl-6 marker:text-foreground-500">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="list-decimal mb-4 space-y-1 pl-6 marker:text-foreground-500">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node, children) => (
      <li className="leading-relaxed">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-foreground-500 bg-default-100 rounded-r-lg">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => (
      <hr className="my-8 border-default-200" />
    ),
    [BLOCKS.TABLE]: (_node, children) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => (
      <tr className="border-b border-default-200">{children}</tr>
    ),
    [BLOCKS.TABLE_CELL]: (_node, children) => (
      <td className="px-4 py-2">{children}</td>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
      <th className="px-4 py-2 font-semibold text-left bg-default-100">{children}</th>
    ),
  },
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
    [MARKS.CODE]: (text) => (
      <code className="bg-default-200 text-foreground px-1.5 py-0.5 rounded text-sm font-mono">{text}</code>
    ),
  },
};

interface RichTextRendererProps {
  content: Document;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  return <div>{documentToReactComponents(content, renderOptions)}</div>;
}
