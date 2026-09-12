import { View } from 'react-native';
import { Text } from 'heroui-native';

import { Spark } from '@/components/brand/Logo';
import { CatalogPhoto } from '@/components/catalog/CatalogPhoto';
import type { CatalogDocument, CatalogPage } from '@/lib/catalog';
import { cn } from '@/lib/utils';

const A4_RATIO = 210 / 297;

type Scale = (value: number) => number;

type PageChromeProps = {
  doc: CatalogDocument;
  label: string;
  index: number;
  total: number;
  fs: Scale;
};

function Wordmark({ fs }: { fs: Scale }) {
  return (
    <View className="flex-row items-baseline" style={{ gap: fs(3) }}>
      <Text className="font-display-medium text-foreground" style={{ fontSize: fs(15) }}>
        Fashy
      </Text>
      <View className="self-center" style={{ paddingBottom: fs(1) }}>
        <Spark size={fs(9)} />
      </View>
      <Text className="font-display text-foreground" style={{ fontSize: fs(15) }}>
        Flash
      </Text>
    </View>
  );
}

function PageHeader({ doc, label, fs }: Omit<PageChromeProps, 'index' | 'total'>) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text
        className="text-foreground uppercase"
        style={{ fontSize: fs(8), letterSpacing: fs(1.8) }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="text-muted shrink uppercase"
        style={{ fontSize: fs(7.5), letterSpacing: fs(1.4) }}
      >
        {doc.brand || 'Fashy Flash'}
      </Text>
    </View>
  );
}

function PageFooter({ doc, index, total, fs }: Omit<PageChromeProps, 'label'>) {
  return (
    <View
      className="border-border/70 flex-row items-center justify-between gap-3 border-t"
      style={{ paddingTop: fs(8), marginTop: fs(10) }}
    >
      <Text numberOfLines={1} className="text-muted shrink" style={{ fontSize: fs(8) }}>
        {doc.title}
      </Text>
      <Text className="text-muted" style={{ fontSize: fs(8) }}>
        {index + 1} / {total}
      </Text>
    </View>
  );
}

function EmptyPlate({ fs, aspect }: { fs: Scale; aspect?: number }) {
  return (
    <View
      className={cn(
        'border-border bg-ivory-deep items-center justify-center rounded-[4px] border border-dashed',
        aspect === undefined ? 'flex-1' : '',
      )}
      style={aspect === undefined ? { width: '100%' } : { width: '100%', aspectRatio: aspect }}
    >
      <Text className="text-muted uppercase" style={{ fontSize: fs(7.5), letterSpacing: fs(1.4) }}>
        No image selected
      </Text>
    </View>
  );
}

function SpecRow({ label, value, fs }: { label: string; value: string; fs: Scale }) {
  return (
    <View
      className="border-border/60 flex-row items-center justify-between border-b"
      style={{ paddingVertical: fs(7), gap: fs(12) }}
    >
      <Text className="text-muted uppercase" style={{ fontSize: fs(7.5), letterSpacing: fs(1.2) }}>
        {label}
      </Text>
      <Text
        numberOfLines={2}
        className="text-foreground shrink text-right"
        style={{ fontSize: fs(9.5), lineHeight: fs(13) }}
      >
        {value}
      </Text>
    </View>
  );
}

type CatalogPageViewProps = {
  doc: CatalogDocument;
  page: CatalogPage;
  index: number;
  total: number;
  width: number;
};

/**
 * One A4 catalog page rendered on screen exactly as it is laid out in the PDF:
 * editorial spacing, serif headings and a single idea per page.
 */
export function CatalogPageView({ doc, page, index, total, width }: CatalogPageViewProps) {
  const fs: Scale = (value) => Math.round(((value * width) / 340) * 10) / 10;
  const pad = fs(26);
  const content = width - pad * 2;

  const chrome = { doc, index, total, fs };

  if (page.kind === 'cover') {
    const subtitle = [doc.color, doc.material].filter(Boolean).join(' · ');

    return (
      <View
        className="bg-ivory border-border overflow-hidden rounded-[10px] border"
        style={{ width, height: width / A4_RATIO, padding: pad }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Wordmark fs={fs} />
          <Text
            className="text-muted uppercase"
            style={{ fontSize: fs(7.5), letterSpacing: fs(1.4) }}
          >
            Digital catalog
          </Text>
        </View>

        <View className="flex-1" style={{ marginTop: fs(18), marginBottom: fs(16) }}>
          {page.hero ? (
            <CatalogPhoto image={page.hero} fill rounded="rounded-[4px]" />
          ) : (
            <EmptyPlate fs={fs} />
          )}
        </View>

        <View style={{ gap: fs(6) }}>
          <Text
            className="text-blush uppercase"
            style={{ fontSize: fs(8), letterSpacing: fs(1.8) }}
          >
            {doc.category || 'New piece'}
          </Text>
          <Text
            className="font-display-medium text-foreground"
            style={{ fontSize: fs(26), lineHeight: fs(30) }}
          >
            {doc.title}
          </Text>
          {subtitle ? (
            <Text className="text-charcoal-soft" style={{ fontSize: fs(9.5) }}>
              {subtitle}
            </Text>
          ) : null}
          <Text className="text-muted" style={{ fontSize: fs(8) }}>
            {doc.issue}
          </Text>
        </View>
      </View>
    );
  }

  if (page.kind === 'views') {
    return (
      <View
        className="bg-surface border-border overflow-hidden rounded-[10px] border"
        style={{ width, height: width / A4_RATIO, padding: pad }}
      >
        <PageHeader doc={doc} label={page.label} fs={fs} />

        <View
          className="flex-1 flex-row"
          style={{ gap: fs(10), marginTop: fs(14), marginBottom: fs(12) }}
        >
          {page.images.length === 0 ? (
            <EmptyPlate fs={fs} />
          ) : (
            page.images.map((image) => (
              <View key={image.id} className="flex-1" style={{ gap: fs(6) }}>
                <CatalogPhoto image={image} fill rounded="rounded-[4px]" />
                <Text
                  numberOfLines={1}
                  className="text-charcoal-soft"
                  style={{ fontSize: fs(8.5) }}
                >
                  {image.label}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ gap: fs(4) }}>
          <Text
            className="font-display-medium text-foreground"
            style={{ fontSize: fs(15), lineHeight: fs(19) }}
          >
            {doc.title}
          </Text>
          <Text className="text-muted" style={{ fontSize: fs(8.5) }}>
            {[doc.category, doc.color, doc.fit].filter(Boolean).join(' · ')}
          </Text>
        </View>

        <PageFooter {...chrome} />
      </View>
    );
  }

  if (page.kind === 'colorways') {
    const tile = (content - fs(10)) / 2;

    return (
      <View
        className="bg-surface border-border overflow-hidden rounded-[10px] border"
        style={{ width, height: width / A4_RATIO, padding: pad }}
      >
        <PageHeader doc={doc} label={page.label} fs={fs} />

        <View style={{ gap: fs(4), marginTop: fs(12) }}>
          <Text
            className="font-display-medium text-foreground"
            style={{ fontSize: fs(17), lineHeight: fs(21) }}
          >
            Available color variations
          </Text>
          <Text className="text-muted" style={{ fontSize: fs(8.5) }}>
            {doc.colorways.map((colorway) => colorway.label).join(' · ')}
          </Text>
        </View>

        <View className="flex-row flex-wrap" style={{ gap: fs(10), marginTop: fs(14) }}>
          {page.colorways.map((colorway) => (
            <View key={colorway.id} style={{ width: tile, gap: fs(5) }}>
              {page.hero ? (
                <CatalogPhoto
                  image={page.hero}
                  aspect={3 / 4}
                  tint={colorway.isBase ? undefined : colorway.hex}
                  rounded="rounded-[4px]"
                />
              ) : (
                <View
                  className="rounded-[4px]"
                  style={{ width: tile, height: (tile * 4) / 3, backgroundColor: colorway.hex }}
                />
              )}
              <View className="flex-row items-center" style={{ gap: fs(5) }}>
                <View
                  className="border-border rounded-full border"
                  style={{ width: fs(9), height: fs(9), backgroundColor: colorway.hex }}
                />
                <Text
                  numberOfLines={1}
                  className="text-charcoal-soft shrink"
                  style={{ fontSize: fs(8.5) }}
                >
                  {colorway.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-1" />
        <PageFooter {...chrome} />
      </View>
    );
  }

  const rows = [
    { label: 'Product name', value: doc.title },
    { label: 'Category', value: doc.category || '—' },
    { label: 'Color', value: doc.color || '—' },
    { label: 'Material', value: doc.material || '—' },
    { label: 'Fit', value: doc.fit || '—' },
    ...(doc.brand ? [{ label: 'Brand', value: doc.brand }] : []),
    ...(doc.sku ? [{ label: 'SKU', value: doc.sku }] : []),
  ];

  return (
    <View
      className="bg-surface border-border overflow-hidden rounded-[10px] border"
      style={{ width, height: width / A4_RATIO, padding: pad }}
    >
      <PageHeader doc={doc} label={page.label} fs={fs} />

      <View style={{ gap: fs(4), marginTop: fs(12) }}>
        <Text
          className="font-display-medium text-foreground"
          style={{ fontSize: fs(20), lineHeight: fs(24) }}
        >
          {doc.title}
        </Text>
        <Text className="text-blush uppercase" style={{ fontSize: fs(8), letterSpacing: fs(1.6) }}>
          {doc.category || 'Product data'}
        </Text>
      </View>

      <View style={{ marginTop: fs(12) }}>
        {rows.map((row) => (
          <SpecRow key={row.label} label={row.label} value={row.value} fs={fs} />
        ))}
      </View>

      <View style={{ gap: fs(7), marginTop: fs(14) }}>
        <Text
          className="text-muted uppercase"
          style={{ fontSize: fs(7.5), letterSpacing: fs(1.2) }}
        >
          Available sizes
        </Text>
        {doc.sizes.length === 0 ? (
          <Text className="text-charcoal-soft" style={{ fontSize: fs(9.5) }}>
            {doc.sizeRange || 'Size range not set'}
          </Text>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: fs(6) }}>
            {doc.sizes.map((size) => (
              <View
                key={size}
                className="border-border rounded-full border"
                style={{ paddingHorizontal: fs(9), paddingVertical: fs(3.5) }}
              >
                <Text className="text-foreground" style={{ fontSize: fs(8.5) }}>
                  {size}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {doc.description ? (
        <View style={{ gap: fs(6), marginTop: fs(14) }}>
          <Text
            className="text-muted uppercase"
            style={{ fontSize: fs(7.5), letterSpacing: fs(1.2) }}
          >
            Description
          </Text>
          <Text className="text-charcoal-soft" style={{ fontSize: fs(9), lineHeight: fs(13.5) }}>
            {doc.description}
          </Text>
        </View>
      ) : null}

      <View className="flex-1" />
      <PageFooter {...chrome} />
    </View>
  );
}
