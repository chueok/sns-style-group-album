import { formatDate } from '../utils/format-date';

export const CreatedDate = ({
  createdDateTime,
}: {
  createdDateTime: string;
}) => {
  const date = new Date(createdDateTime);

  return (
    <span className="tw-text-xs tw-text-foreground">{formatDate(date)}</span>
  );
};
