import { formatDate } from '../utils/format-date';

export const CreatedDate = ({ createdDateTime }: { createdDateTime: Date }) => {
  return (
    <span className="tw-text-xs tw-text-foreground">
      {formatDate(createdDateTime)}
    </span>
  );
};
