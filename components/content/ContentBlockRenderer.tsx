import Image from 'next/image';

interface ContentBlock {
  id: string;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const { block_type, content_data } = block;

  switch (block_type) {
    case 'heading_h1':
      return (
        <h1 className="text-4xl font-bold text-foreground mb-6">
          {content_data.text as string}
        </h1>
      );

    case 'heading_h2':
      return (
        <h2 className="text-3xl font-semibold text-foreground mb-5">
          {content_data.text as string}
        </h2>
      );

    case 'heading_h3':
      return (
        <h3 className="text-2xl font-semibold text-foreground mb-4">
          {content_data.text as string}
        </h3>
      );

    case 'heading_h4':
      return (
        <h4 className="text-xl font-semibold text-foreground mb-3">
          {content_data.text as string}
        </h4>
      );

    case 'heading_h5':
      return (
        <h5 className="text-lg font-semibold text-foreground mb-3">
          {content_data.text as string}
        </h5>
      );

    case 'heading_h6':
      return (
        <h6 className="text-base font-semibold text-foreground mb-2">
          {content_data.text as string}
        </h6>
      );

    case 'paragraph':
      return (
        <div 
          className="prose prose-lg text-muted-foreground mb-4 max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: content_data.html_content as string 
          }} 
        />
      );

    case 'image':
      const imageUrl = content_data.url as string;
      const altText = content_data.alt as string;
      const caption = content_data.caption as string;
      
      return (
        <figure className="mb-6">
          <div className="relative w-full h-auto">
            <Image 
              src={imageUrl} 
              alt={altText}
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
          {caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );

    case 'ad_slot_manual':
      const identifier = content_data.identifier as string;
      const adSlotId = content_data.ad_slot_id as string;
      const adClient = 'ca-pub-7866498376836059'; // replace with your own AdSense client ID
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (!isDevelopment && adSlotId) {
        return (
          <>
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
              crossOrigin="anonymous"
            ></script>
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={adClient}
              data-ad-slot={adSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
            <script
              dangerouslySetInnerHTML={{
                __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
              }}
            />
          </>
        );
      }

      return (
        <div
          className={`manual-ad-slot-placeholder ${
            isDevelopment
              ? 'bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center my-6'
              : 'my-6 min-h-[50px]'
          }`}
          data-ad-identifier={identifier}
        >
          {isDevelopment && (
            <div className="text-muted-foreground">
              <div className="text-sm font-medium mb-1">Advertisement Slot</div>
              {identifier && (
                <div className="text-xs">ID: {identifier}</div>
              )}
              {adSlotId && (
                <div className="text-xs">Ad Slot: {adSlotId}</div>
              )}
            </div>
          )}
        </div>
      );

    case 'unordered_list':
      const unorderedItems = content_data.items as string[];
      
      return (
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          {unorderedItems?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'ordered_list':
      const orderedItems = content_data.items as string[];
      
      return (
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
          {orderedItems?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );

    case 'blockquote':
      const quote = content_data.text as string;
      const author = content_data.author as string;
      
      return (
        <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/30 rounded-r-lg">
          <p className="text-lg italic text-foreground mb-2">&ldquo;{quote}&rdquo;</p>
          {author && (
            <cite className="text-sm text-muted-foreground">— {author}</cite>
          )}
        </blockquote>
      );

    case 'code_block':
      const code = content_data.code as string;
      const language = content_data.language as string;
      
      return (
        <div className="mb-6">
          {language && (
            <div className="text-xs text-muted-foreground mb-1 font-mono">
              {language}
            </div>
          )}
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        </div>
      );

    case 'divider':
      return (
        <hr className="border-border my-8" />
      );

    case 'spacer':
      const height = (content_data.height as number) || 20;
      
      return (
        <div style={{ height: `${height}px` }} className="w-full" />
      );

    case 'contact_form':
      return (
        <div className="bg-card border border-border rounded-lg p-6 my-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Form</h3>
          <p className="text-muted-foreground">
            Contact form will be implemented here based on form configuration.
          </p>
        </div>
      );

    default:
      return (
        <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-4 my-4">
          <div className="text-sm text-muted-foreground">
            <strong>Unknown Block Type:</strong> {block_type}
          </div>
          <pre className="text-xs mt-2 overflow-x-auto">
            {JSON.stringify(content_data, null, 2)}
          </pre>
        </div>
      );
  }
}
