"use client";

import {
  Activity,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  HandCoins,
  LayoutGrid,
  List,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAppLocalHydration } from "@/lib/apps/use-app-local-hydration";
import { filterItemsBySearch } from "@/lib/apps/filter-items-by-search";
import { appCrudToast, appLoanPaymentRecordedToast, appLoanPaymentsUpdatedToast } from "@/lib/app-toasts";
import {
  createEmptyNSKLoansSchema,
  LOANS_VIEW_MODES,
  type LoanDirection,
  type LoanFilterId,
  type LoanPayment,
  type LoansViewMode,
  type NSKLoanItem,
} from "@/lib/loans/schema";
import {
  aggregateOutstandingByCurrency,
  balanceByCurrency,
  formatLoanNumber,
  loanMatchesFilter,
  loanMatchesSearch,
  mapToSortedEntries,
} from "@/lib/loans/loans-helpers";
import { readNSKLoansStorage, writeNSKLoansStorage } from "@/lib/loans/storage";
import { useSessionStorageSuffix } from "@/lib/storage/session-storage-context";
import { persistAppViewBundle } from "@/lib/apps/view-persistence";
import { ConfirmDeleteAlertDialog } from "@/components/common/confirm-delete-alert-dialog";
import { kpiStatIconGlyphClass, kpiStatIconWrapClass } from "@/components/common/semantic-badge";
import { AppListToolbar } from "@/components/common/app-list-toolbar";
import {
  type FilterSidebarItem,
  FilterSidebarDesktopAside,
  FilterSidebarMobileBar,
  FilterSidebarMobileSheet,
} from "@/components/common/filter-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddLoanSheet } from "./add-loan-sheet";
import { LoanPaymentsSheet } from "./loan-payments-sheet";
import { LoanPaymentSheet } from "./loan-payment-sheet";
import { ListSearchEmptyState } from "@/components/common/list-search-empty";
import { LoansView } from "./loans-view";
import { LoansViewSkeleton } from "./loans-view-skeleton";

const EPS = 0.009;

const LOAN_FILTER_ICONS: Record<LoanFilterId, LucideIcon> = {
  all: HandCoins,
  lent: ArrowUpRight,
  borrowed: ArrowDownLeft,
  active: Activity,
  settled: CheckCircle2,
};

function buildLoansFilterItems(
  labels: {
    all: string;
    lent: string;
    borrowed: string;
    active: string;
    settled: string;
  },
  counts: Record<LoanFilterId, number>
): FilterSidebarItem<LoanFilterId>[] {
  return [
    { id: "all", label: labels.all, icon: LOAN_FILTER_ICONS.all, count: counts.all },
    { id: "lent", label: labels.lent, icon: LOAN_FILTER_ICONS.lent, count: counts.lent },
    {
      id: "borrowed",
      label: labels.borrowed,
      icon: LOAN_FILTER_ICONS.borrowed,
      count: counts.borrowed,
    },
    {
      id: "active",
      label: labels.active,
      icon: LOAN_FILTER_ICONS.active,
      count: counts.active,
      dividerBefore: true,
    },
    { id: "settled", label: labels.settled, icon: LOAN_FILTER_ICONS.settled, count: counts.settled },
  ];
}

type LoanSummaryStatCardProps = {
  icon: LucideIcon;
  title: string;
  iconWrapClass: string;
  iconClass: string;
  children: ReactNode;
};

function LoanSummaryStatCard({ icon: Icon, title, iconWrapClass, iconClass, children }: LoanSummaryStatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-card p-4 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-950/50">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", iconWrapClass)}>
        <Icon className={cn("size-5", iconClass)} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

type LoanFormSubmit = {
  direction: LoanDirection;
  counterparty_name: string;
  currency: string;
  amount: string;
  date: string;
  notes: string;
};

export function LoansAppPage() {
  const sessionSuffix = useSessionStorageSuffix();
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<LoanFilterId>("all");
  const [viewMode, setViewMode] = useState<LoansViewMode>("grid");
  const [store, setStore] = useState(createEmptyNSKLoansSchema);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [loanSearch, setLoanSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NSKLoanItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<NSKLoanItem | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoan, setPaymentLoan] = useState<NSKLoanItem | null>(null);
  const [paymentsListOpen, setPaymentsListOpen] = useState(false);
  const [paymentsListLoanId, setPaymentsListLoanId] = useState<string | null>(null);

  const paymentsListLoan =
    paymentsListLoanId != null
      ? (store.items.find((i) => i.id === paymentsListLoanId) ?? null)
      : null;

  useAppLocalHydration(() => readNSKLoansStorage(sessionSuffix), setStore, setIsStoreHydrated, {
    appViewKey: "loans",
    validModes: LOANS_VIEW_MODES,
    defaultView: "grid",
    setViewMode,
  });

  const filterCounts: Record<LoanFilterId, number> = {
    all: 0,
    lent: 0,
    borrowed: 0,
    active: 0,
    settled: 0,
  };
  for (const item of store.items) {
    (["all", "lent", "borrowed", "active", "settled"] as const).forEach((fid) => {
      if (loanMatchesFilter(item, fid)) filterCounts[fid]++;
    });
  }

  const filteredItems = store.items.filter((item) => loanMatchesFilter(item, activeFilter));
  const searchFilteredItems = filterItemsBySearch(filteredItems, loanSearch, loanMatchesSearch);

  const sortedItems = [...searchFilteredItems].sort((a, b) => {
    const byUpdated = b.updated_at.localeCompare(a.updated_at);
    if (byUpdated !== 0) return byUpdated;
    return a.counterparty_name.localeCompare(b.counterparty_name);
  });

  const loansFilterItems = buildLoansFilterItems(t.loans.filters, filterCounts);

  const lentLines = mapToSortedEntries(
    aggregateOutstandingByCurrency(store.items, (l) => l.direction === "lent")
  );
  const borrowedLines = mapToSortedEntries(
    aggregateOutstandingByCurrency(store.items, (l) => l.direction === "borrowed")
  );
  const balanceLines = mapToSortedEntries(balanceByCurrency(store.items)).filter(
    (e) => Math.abs(e.value) > EPS
  );

  function updateStore(nextItems: NSKLoanItem[]) {
    const nextStore = { ...store, items: nextItems };
    setStore(nextStore);
    writeNSKLoansStorage(sessionSuffix, nextStore);
  }

  function handleCreateOrUpdate(values: LoanFormSubmit) {
    const now = new Date().toISOString();
    const notes = values.notes.trim() ? values.notes.trim() : undefined;

    if (!editingItem) {
      const newItem: NSKLoanItem = {
        id: crypto.randomUUID(),
        direction: values.direction,
        counterparty_name: values.counterparty_name,
        currency: values.currency,
        amount: values.amount,
        date: values.date,
        notes,
        payments: [],
        created_at: now,
        updated_at: now,
      };
      updateStore([...store.items, newItem]);
      appCrudToast(t, "loans", "created");
    } else {
      updateStore(
        store.items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                direction: values.direction,
                counterparty_name: values.counterparty_name,
                currency: values.currency,
                amount: values.amount,
                date: values.date,
                notes,
                updated_at: now,
              }
            : item
        )
      );
      appCrudToast(t, "loans", "updated");
    }
    setEditingItem(null);
    setSheetOpen(false);
  }

  function handleRequestDelete(item: NSKLoanItem) {
    setItemPendingDelete(item);
  }

  function handleConfirmDelete() {
    if (!itemPendingDelete) return;
    updateStore(store.items.filter((entry) => entry.id !== itemPendingDelete.id));
    appCrudToast(t, "loans", "deleted");
    setItemPendingDelete(null);
  }

  function openCreateSheet() {
    setEditingItem(null);
    setSheetOpen(true);
  }

  function openEditSheet(item: NSKLoanItem) {
    setEditingItem(item);
    setSheetOpen(true);
  }

  function handleViewModeChange(next: LoansViewMode) {
    setViewMode(next);
    persistAppViewBundle("loans", next);
  }

  function openPaymentSheet(loan: NSKLoanItem) {
    setPaymentLoan(loan);
    setPaymentOpen(true);
  }

  function closePaymentSheet() {
    setPaymentOpen(false);
    setPaymentLoan(null);
  }

  function handlePaymentSubmit(amount: string, date: string) {
    if (!paymentLoan) return;
    const now = new Date().toISOString();
    const payment = { id: crypto.randomUUID(), amount, date };
    updateStore(
      store.items.map((item) =>
        item.id === paymentLoan.id
          ? {
              ...item,
              payments: [...item.payments, payment],
              updated_at: now,
            }
          : item
      )
    );
    appLoanPaymentRecordedToast(t);
    closePaymentSheet();
  }

  function openPaymentsListSheet(loan: NSKLoanItem) {
    setPaymentsListLoanId(loan.id);
    setPaymentsListOpen(true);
  }

  function closePaymentsListSheet() {
    setPaymentsListOpen(false);
    setPaymentsListLoanId(null);
  }

  function handleUpdateLoanPayments(loanId: string, payments: LoanPayment[]) {
    const now = new Date().toISOString();
    updateStore(
      store.items.map((item) =>
        item.id === loanId ? { ...item, payments, updated_at: now } : item
      )
    );
    appLoanPaymentsUpdatedToast(t);
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ConfirmDeleteAlertDialog
        open={itemPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
        title={t.loans.deleteDialogTitle}
        description={t.loans.deleteDialogDescription}
        itemLabel={itemPendingDelete?.counterparty_name ?? null}
        cancelLabel={t.loans.deleteDialogCancel}
        confirmLabel={t.loans.deleteDialogConfirm}
        onConfirm={handleConfirmDelete}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <FilterSidebarDesktopAside<LoanFilterId>
          title={t.loans.sidebarTitle}
          items={loansFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterSidebarMobileSheet<LoanFilterId>
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          title={t.loans.sidebarTitle}
          items={loansFilterItems}
          activeId={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <FilterSidebarMobileBar
            title={t.loans.sidebarTitle}
            onOpen={() => setFiltersOpen(true)}
            openButtonAriaLabel={t.loans.openFiltersNav}
          />
          <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
            {!isStoreHydrated ? (
              <LoansViewSkeleton viewMode={viewMode} />
            ) : (
              <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <LoanSummaryStatCard
                icon={ArrowUpRight}
                title={t.loans.summaryLentTitle}
                iconWrapClass={kpiStatIconWrapClass("emerald")}
                iconClass={kpiStatIconGlyphClass("emerald")}
              >
                {lentLines.length === 0 ? (
                  <p className="text-2xl font-semibold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
                    {formatLoanNumber(0, locale)}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {lentLines.map((row) => (
                      <li key={row.currency} className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{row.currency}</span>
                        <span className="text-xl font-semibold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
                          {formatLoanNumber(row.value, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </LoanSummaryStatCard>
              <LoanSummaryStatCard
                icon={ArrowDownRight}
                title={t.loans.summaryBorrowedTitle}
                iconWrapClass={kpiStatIconWrapClass("rose")}
                iconClass={kpiStatIconGlyphClass("rose")}
              >
                {borrowedLines.length === 0 ? (
                  <p className="text-2xl font-semibold tracking-tight text-red-600 tabular-nums dark:text-red-400">
                    {formatLoanNumber(0, locale)}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {borrowedLines.map((row) => (
                      <li key={row.currency} className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{row.currency}</span>
                        <span className="text-xl font-semibold tracking-tight text-red-600 tabular-nums dark:text-red-400">
                          {formatLoanNumber(row.value, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </LoanSummaryStatCard>
              <LoanSummaryStatCard
                icon={Scale}
                title={t.loans.summaryBalanceTitle}
                iconWrapClass={kpiStatIconWrapClass("amber")}
                iconClass={kpiStatIconGlyphClass("amber")}
              >
                {balanceLines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.loans.summaryEmpty}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {balanceLines.map((row) => {
                      const pos = row.value > EPS;
                      const neg = row.value < -EPS;
                      const tone = pos
                        ? "text-emerald-600 dark:text-emerald-400"
                        : neg
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground";
                      const prefix = pos ? "+" : neg ? "−" : "";
                      return (
                        <li key={row.currency} className="flex items-baseline justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{row.currency}</span>
                          <span
                            className={cn(
                              "text-xl font-semibold tracking-tight tabular-nums",
                              tone
                            )}
                          >
                            {prefix}
                            {formatLoanNumber(Math.abs(row.value), locale)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </LoanSummaryStatCard>
            </div>

            <AppListToolbar<LoansViewMode>
              totalLabel={t.loans.totalLabel.replace("{count}", String(searchFilteredItems.length))}
              viewModes={[
                { id: "grid", icon: LayoutGrid, ariaLabel: t.loans.viewGrid },
                { id: "list", icon: List, ariaLabel: t.loans.viewList },
              ]}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              addButtonLabel={t.loans.addNew}
              onAdd={openCreateSheet}
              search={{
                value: loanSearch,
                onChange: setLoanSearch,
                placeholder: t.loans.searchPlaceholder,
                "aria-label": t.loans.searchAriaLabel,
              }}
            />

            {store.items.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Banknote />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.loans.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.loans.emptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateSheet}>{t.loans.addNew}</Button>
                </EmptyContent>
              </Empty>
            ) : sortedItems.length === 0 && loanSearch.trim() ? (
              <ListSearchEmptyState
                labels={{
                  title: t.loans.searchEmptyTitle,
                  body: t.loans.searchEmptyBody,
                  clear: t.loans.searchClear,
                }}
                onClear={() => setLoanSearch("")}
              />
            ) : sortedItems.length === 0 ? (
              <Empty className="border border-border p-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Banknote />
                  </EmptyMedia>
                  <EmptyTitle className="text-xl font-semibold text-foreground">
                    {t.loans.emptyTitle}
                  </EmptyTitle>
                  <EmptyDescription>{t.loans.emptyBody}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={openCreateSheet}>{t.loans.addNew}</Button>
                </EmptyContent>
              </Empty>
            ) : (
              <LoansView
                items={sortedItems}
                viewMode={viewMode}
                locale={locale}
                onEdit={openEditSheet}
                onDelete={handleRequestDelete}
                onAddPayment={(item) => openPaymentSheet(item)}
                onViewPayments={openPaymentsListSheet}
              />
            )}
              </>
            )}
          </div>
        </div>
      </div>

      <AddLoanSheet
        open={sheetOpen}
        editingItem={editingItem}
        onClose={() => {
          setSheetOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />

      <LoanPaymentSheet
        open={paymentOpen}
        loan={paymentLoan}
        onClose={closePaymentSheet}
        onSubmit={handlePaymentSubmit}
      />

      <LoanPaymentsSheet
        open={paymentsListOpen && paymentsListLoan != null}
        loan={paymentsListLoan}
        onClose={closePaymentsListSheet}
        onUpdatePayments={handleUpdateLoanPayments}
      />
    </div>
  );
}
