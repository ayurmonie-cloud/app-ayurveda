import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { useProfile } from '@/hooks/use-profile';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const name = profile?.display_name;

  return (
    <Screen>
      <Text variant="title">
        {name ? t('today.greeting', { name }) : t('today.greetingAnonymous')}
      </Text>
      <Text color="textSecondary">{t('today.empty')}</Text>
    </Screen>
  );
}
