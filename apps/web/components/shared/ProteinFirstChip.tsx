interface Props {
  eaten: number;
  target: number;
}

export function ProteinFirstChip({ eaten, target }: Props) {
  const percent = Math.min((eaten / target) * 100, 100);

  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Protein First
        </span>
        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          {percent.toFixed(0)}% of target
        </span>
      </div>
    </div>
  );
}
