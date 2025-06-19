import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { formatDate } from '../utils/format-date';

const InvitationCard = () => {
  return (
    <Card className="tw-rounded-none">
      <CardHeader>
        <VisuallyHidden>
          <CardTitle>Invitation</CardTitle>
        </VisuallyHidden>
      </CardHeader>
      <CardContent className="tw-flex tw-flex-row tw-justify-between tw-gap-2">
        <div className="tw-shrink">
          🔔김OO님을 그룹1에 초대하시겠습니까?초대하시겠습니까?초대하시겠습니까?
        </div>
        <div className="tw-shrink-0 tw-text-foreground">
          {formatDate(new Date())}
        </div>
      </CardContent>
      <CardFooter className="!tw-flex !tw-flex-row-reverse tw-gap-2">
        <Button className="tw-flex-1">수락</Button>
        <Button variant="outline" className="tw-flex-1">
          거절
        </Button>
      </CardFooter>
    </Card>
  );
};

export const FeedPage = () => {
  return (
    <div>
      <InvitationCard />
    </div>
  );
};
