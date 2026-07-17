'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/types';

interface HeaderProps {
  locale: Locale;
}

const navItems: { key: string; href: string; zh: string; en: string }[] = [
  { key: 'home', href: '', zh: '首页', en: 'Home' },
  { key: 'emojis', href: '/emojis', zh: '表情', en: 'Emojis' },
  { key: 'categories', href: '/categories', zh: '分类', en: 'Categories' },
  { key: 'topics', href: '/topics', zh: '专题', en: 'Topics' },
  { key: 'articles', href: '/articles', zh: '文章', en: 'Articles' },
];

export function Header({ locale }: HeaderProps) {
  const prefix = `/${locale}`;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change or Escape
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = useCallback(
    (itemHref: string) => {
      const fullHref = prefix + itemHref;
      if (itemHref === '') return pathname === prefix || pathname === `${prefix}/`;
      return pathname.startsWith(fullHref);
    },
    [pathname, prefix]
  );

  return (
    <>
      <header
        className={`
          sticky top-0 z-sticky w-full
          bg-[var(--header-bg)] backdrop-blur-header
          border-b transition-shadow duration-normal
          ${scrolled ? 'shadow-xs border-[var(--header-border-color)]' : 'border-transparent'}
        `}
        style={{ WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link
              href={prefix}
              className="flex items-center gap-2 text-base font-semibold text-text-primary hover:text-accent transition-colors duration-fast shrink-0"
            >
              <span className="text-xl" role="img" aria-label="emoji">😊</span>
              <span>Emoji Platform</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={`${prefix}${item.href}`}
                    className={`
                      relative px-3 py-1.5 text-sm font-medium rounded-lg
                      transition-all duration-fast
                      ${active
                        ? 'text-text-primary bg-surface'
                        : 'text-text-secondary hover:text-text-primary hover:bg-[var(--color-bg-muted)]'
                      }
                    `}
                    style={
                      active
                        ? { boxShadow: '0 1px 2px var(--shadow-color-subtle)' }
                        : undefined
                    }
                  >
                    {locale === 'zh' ? item.zh : item.en}
                    {/* Active indicator */}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search button */}
              <Link
                href={`${prefix}/search`}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary
                  rounded-lg border border-border-subtle
                  hover:text-text-primary hover:border-border transition-all duration-fast
                  max-sm:hidden
                "
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{locale === 'zh' ? '搜索' : 'Search'}</span>
                <kbd
                  className="hidden lg:inline-flex items-center px-1.5 py-0.5
                             text-[11px] font-medium text-text-muted bg-bg-subtle
                             rounded border border-border-subtle leading-none"
                >
                  ⌘K
                </kbd>
              </Link>

              {/* Mobile search icon */}
              <Link
                href={`${prefix}/search`}
                className="md:hidden p-2 -mr-1 text-text-secondary hover:text-text-primary rounded-lg transition-colors duration-fast"
                aria-label={locale === 'zh' ? '搜索' : 'Search'}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Language Switcher */}
              <LanguageSwitcher locale={locale} />

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="
                  md:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary
                  rounded-lg transition-colors duration-fast
                "
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  {mobileOpen ? (
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  ) : (
                    <>
                      <path d="M3 5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        prefix={prefix}
        locale={locale}
        isActive={isActive}
      />
    </>
  );
}

/* ── Language Switcher ── */
function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const targetLocale = currentLocale === 'zh' ? 'en' : 'zh';
  const targetPath = pathname.replace(/^\/(zh|en)/, `/${targetLocale}`) || `/${targetLocale}`;

  return (
    <Link
      href={targetPath}
      className="
        hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium
        text-text-secondary hover:text-text-primary
        rounded-lg border border-border-subtle
        hover:border-border transition-all duration-fast
      "
      title={targetLocale === 'zh' ? '切换到中文' : 'Switch to English'}
    >
      {targetLocale === 'zh' ? '中' : 'EN'}
    </Link>
  );
}

/* ── Mobile Slide-out Menu ── */
function MobileMenu({
  open,
  onClose,
  navItems,
  prefix,
  locale,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  navItems: { key: string; href: string; zh: string; en: string }[];
  prefix: string;
  locale: Locale;
  isActive: (href: string) => boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <nav
        className="absolute top-0 right-0 bottom-0 w-72 bg-surface-elevated
                   shadow-lg border-l border-border animate-slide-down
                   flex flex-col overflow-y-auto"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <span className="text-sm font-semibold text-text-primary">导航</span>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="py-2 px-2 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={`${prefix}${item.href}`}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg text-[15px] font-medium
                    transition-colors duration-fast mb-0.5
                    ${active
                      ? 'text-text-primary bg-accent-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                    }
                  `}
                >
                  {locale === 'zh' ? item.zh : item.en}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-border-subtle text-xs text-text-muted">
          {locale === 'zh' ? '按 Esc 关闭菜单' : 'Press Esc to close'}
        </div>
      </nav>
    </div>
  );
}
