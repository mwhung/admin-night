export const cardLayout = {
  workbenchShell: "bg-workbench-shell supports-[backdrop-filter]:bg-workbench-shell/94 backdrop-blur-xl border border-workbench-divider rounded-[calc(var(--radius)+1rem)] shadow-[0_18px_44px_rgba(33,43,55,0.10)]",
  workbenchShellFrosted: "rounded-[calc(var(--radius)+1.2rem)] border border-transparent bg-workbench-shell/8 supports-[backdrop-filter]:bg-workbench-shell/4 backdrop-blur-2xl backdrop-saturate-130 shadow-none dark:shadow-[0_10px_24px_rgba(6,11,18,0.22)]",
  workbenchPrimary: "bg-workbench-panel/86 supports-[backdrop-filter]:bg-workbench-panel/78 backdrop-blur-lg border border-workbench-divider rounded-[calc(var(--radius)+0.9rem)] shadow-[0_12px_30px_rgba(33,43,55,0.09)]",
  workbenchSecondary: "bg-workbench-panel/78 supports-[backdrop-filter]:bg-workbench-panel/68 backdrop-blur-lg border border-workbench-divider rounded-[calc(var(--radius)+0.75rem)] shadow-[0_10px_24px_rgba(33,43,55,0.08)]",
  workbenchRail: "bg-workbench-rail/90 supports-[backdrop-filter]:bg-workbench-rail/80 backdrop-blur-md border border-workbench-divider rounded-[calc(var(--radius)+0.65rem)] shadow-[0_8px_20px_rgba(33,43,55,0.07)]",
  metricStrip: "bg-surface-elevated/66 border border-workbench-divider rounded-[calc(var(--radius)+0.2rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] dark:shadow-[inset_0_1px_0_rgba(233,242,255,0.08)]",
  metric: "bg-workbench-panel/86 supports-[backdrop-filter]:bg-workbench-panel/78 backdrop-blur-md border border-workbench-divider rounded-[calc(var(--radius)+0.5rem)] shadow-[0_10px_24px_rgba(33,43,55,0.08)]",
  insight: "bg-workbench-panel/90 supports-[backdrop-filter]:bg-workbench-panel/82 backdrop-blur-lg border border-workbench-divider rounded-[calc(var(--radius)+0.75rem)] shadow-[0_14px_30px_rgba(33,43,55,0.10)] overflow-hidden",
  dataSurface: "bg-workbench-rail/94 supports-[backdrop-filter]:bg-workbench-rail/86 backdrop-blur-md border border-workbench-divider rounded-[calc(var(--radius)+0.7rem)] shadow-[0_10px_24px_rgba(33,43,55,0.08)] overflow-hidden",
  interactive: "transition-[background-color,border-color,box-shadow] duration-150 hover:bg-surface-elevated/80 hover:border-white/88",
} as const
