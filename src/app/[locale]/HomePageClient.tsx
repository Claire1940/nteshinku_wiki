"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  ClipboardCheck,
  Copy,
  Download,
  Gamepad2,
  Hammer,
  Package,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Tools Grid 卡片 -> 锚点 section 映射（与下文 8 个模块 section id 一一对应）
const TOOL_SECTION_IDS = [
  "release-banner",
  "codes-rewards",
  "build-arc",
  "skills-combat",
  "pull-value",
  "character-profile",
  "outfits-cosmetics",
  "story-hangout",
];

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.nteshinku.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "NTE Shinku Wiki",
        description:
          "NTE Shinku Wiki covers Shinku's banner, build basics, Arc choices, outfits, team ideas, story unlocks, and event rewards in Neverness to Everness.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "NTE Shinku - S-Class Urban Fantasy Character Guide",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NTE Shinku Wiki",
        alternateName: "NTE Shinku",
        url: siteUrl,
        description:
          "NTE Shinku Wiki is a fan resource hub for Shinku banner, build, Arc, outfits, and team guides in Neverness to Everness.",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "NTE Shinku Wiki - Neverness to Everness Character Guide",
        },
        sameAs: [
          "https://store.steampowered.com/app/4508340/NTE_Neverness_to_Everness/",
          "https://discord.gg/6c7B8nuqvW",
          "https://www.reddit.com/r/NevernessToEverness/",
          "https://x.com/NTE_GL",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Neverness to Everness",
        gamePlatform: ["PC", "macOS", "PlayStation 5", "iOS", "Android"],
        applicationCategory: "Game",
        genre: ["RPG", "Urban Fantasy", "Open World", "Gacha"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/4508340/NTE_Neverness_to_Everness/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Neverness to Everness (NTE) - Ver.1.2 Character Trailer: Shinku",
        description:
          "Official Neverness to Everness Ver.1.2 character trailer showcasing the S-Class COSMOS character Shinku.",
        uploadDate: "2026-07-06",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/FVhLNdcAVyI",
        contentUrl: "https://www.youtube.com/watch?v=FVhLNdcAVyI",
        url: "https://www.youtube.com/watch?v=FVhLNdcAVyI",
      },
    ],
  };

  // Codes copy state + accordion state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [outfitExpanded, setOutfitExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  const handleCopyCode = (code: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        window.setTimeout(() => setCopiedCode(null), 1500);
      })
      .catch(() => {});
  };

  // 模块 eyebrow 小标签（统一样式，不同图标）
  const Eyebrow = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))]">
        {text}
      </span>
    </div>
  );

  // tier 颜色映射（全部用主题色变量 / 中性色，无硬编码 hex）
  const tierStyle = (tier: string) => {
    switch (tier) {
      case "High Priority":
        return "bg-[hsl(var(--nav-theme)/0.15)] border-[hsl(var(--nav-theme)/0.5)] text-[hsl(var(--nav-theme-light))]";
      case "Medium Priority":
        return "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.35)] text-[hsl(var(--nav-theme-light))]";
      case "Optional":
        return "bg-white/5 border-border text-foreground";
      default:
        return "bg-white/[0.03] border-border text-muted-foreground";
    }
  };

  // 兑换码类型图标
  const codeTypeIcon = (type: string) => {
    const cls = "w-3.5 h-3.5";
    if (type === "mail-reward") return <Package className={cls} />;
    if (type === "event-reward") return <Sparkles className={cls} />;
    return <Download className={cls} />;
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes-rewards")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/4508340/NTE_Neverness_to_Everness/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* ===== Video Section ===== */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="FVhLNdcAVyI"
              title="NTE Shinku - Ver.1.2 Character Trailer"
            />
          </div>
        </div>
      </section>

      {/* ===== Tools Grid - 8 Navigation Cards ===== */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOL_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: Tools Grid 之后的原生横幅 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端方形 / 桌面端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ===== Latest Updates Section（受保护模块，保留） ===== */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* ===== Module 1: Release Date and Banner Guide ===== */}
      <section id="release-banner" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Clock className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuReleaseBanner.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuReleaseBanner.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuReleaseBanner.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.nteShinkuReleaseBanner.rows.map(
              (row: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))] mb-1.5">
                    {row.label}
                  </p>
                  <p className="text-base md:text-lg font-bold mb-1">
                    {row.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{row.detail}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===== Module 2: Codes and Free Rewards ===== */}
      <section
        id="codes-rewards"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Download className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuCodesRewards.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuCodesRewards.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuCodesRewards.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.nteShinkuCodesRewards.codes.map(
              (code: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]">
                      {codeTypeIcon(code.type)}
                      {t.modules.nteShinkuCodesRewards.typeLabels[code.type]}
                    </span>
                    {code.type === "redeem-code" && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(code.code)}
                        aria-label="Copy code"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-white/10 hover:text-[hsl(var(--nav-theme-light))] transition-colors text-muted-foreground"
                      >
                        {copiedCode === code.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <code className="text-base md:text-lg font-bold tracking-wide text-[hsl(var(--nav-theme-light))] break-all mb-2">
                    {code.code}
                  </code>
                  <p className="text-sm font-medium mb-3">{code.reward}</p>
                  <p className="text-xs text-muted-foreground mt-auto pt-3 border-t border-border/60">
                    {code.claim}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 模块阅读停顿 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* ===== Module 3: Build and Arc Guide ===== */}
      <section id="build-arc" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Hammer className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuBuildArc.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuBuildArc.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuBuildArc.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.nteShinkuBuildArc.cards.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="mb-3 h-10 w-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                  <DynamicIcon
                    name={card.icon}
                    className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                  />
                </div>
                <h3 className="font-bold text-base mb-1">{card.title}</h3>
                <p className="text-sm font-semibold text-[hsl(var(--nav-theme-light))] mb-2">
                  {card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Module 4: Skills and Combat Guide ===== */}
      <section
        id="skills-combat"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Gamepad2 className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuSkillsCombat.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuSkillsCombat.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuSkillsCombat.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.nteShinkuSkillsCombat.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 320×50 + 模块间停顿 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ===== Module 5: Pull Value and Tier Context ===== */}
      <section id="pull-value" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Star className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuPullValueTier.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuPullValueTier.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuPullValueTier.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.nteShinkuPullValueTier.tiers.map(
              (tier: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <span
                    className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${tierStyle(
                      tier.tier,
                    )}`}
                  >
                    {tier.tier}
                  </span>
                  <h3 className="text-lg font-bold mb-2">{tier.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tier.summary}
                  </p>
                  <ul className="space-y-2">
                    {tier.details.map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===== Module 6: Character Profile ===== */}
      <section
        id="character-profile"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Users className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuCharacterProfile.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuCharacterProfile.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuCharacterProfile.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.nteShinkuCharacterProfile.cards.map(
              (card: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="mb-3 h-10 w-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="font-bold text-base mb-1">{card.title}</h3>
                  <p className="text-sm font-semibold text-[hsl(var(--nav-theme-light))] mb-2">
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 模块间停顿 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* ===== Module 7: Outfits and Cosmetics ===== */}
      <section id="outfits-cosmetics" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<Sparkles className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuOutfitsCosmetics.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuOutfitsCosmetics.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuOutfitsCosmetics.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-2">
            {t.modules.nteShinkuOutfitsCosmetics.outfits.map(
              (outfit: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() =>
                      setOutfitExpanded(outfitExpanded === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-semibold">{outfit.title}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]">
                        {outfit.category}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${outfitExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {outfitExpanded === index && (
                    <div className="px-5 pb-5 text-muted-foreground text-sm">
                      {outfit.content}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===== Module 8: Story and Hangout Guide ===== */}
      <section
        id="story-hangout"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <Eyebrow
              icon={<BookOpen className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />}
              text={t.modules.nteShinkuStoryHangout.eyebrow}
            />
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.nteShinkuStoryHangout.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.nteShinkuStoryHangout.intro}
            </p>
          </div>

          <div className="scroll-reveal relative pl-6 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6">
            {t.modules.nteShinkuStoryHangout.steps.map(
              (step: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.4rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                  <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===== FAQ Section ===== */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* ===== CTA Section ===== */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner before footer */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* ===== Footer ===== */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/6c7B8nuqvW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/NTE_GL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/NevernessToEverness/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/4508340/NTE_Neverness_to_Everness/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
