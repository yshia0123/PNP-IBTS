"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, FileText, UserCheck, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useGlobalSearch, type SearchResult } from "./hooks";

const TYPE_ICON = {
  personnel: Users,
  claim: FileText,
  retiree: UserCheck,
} as const;

/**
 * GlobalSearch (SSOT Phase 4 step 14). Debounced, role-scoped search with a
 * results dropdown. Selecting a result navigates to the relevant module.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const { data, isFetching } = useGlobalSearch(debounced);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  const showDropdown = open && debounced.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search personnel, claims, benefits..."
        aria-label="Global search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="global-search-results"
        className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {isFetching && showDropdown && (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}

      {showDropdown && (
        <ul
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-md border border-border bg-surface shadow-lg"
        >
          {!data || data.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              {isFetching ? "Searching…" : `No results for "${debounced}".`}
            </li>
          ) : (
            data.map((result) => {
              const Icon = TYPE_ICON[result.type];
              return (
                <li key={`${result.type}-${result.id}`} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => go(result)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {result.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.sublabel}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
