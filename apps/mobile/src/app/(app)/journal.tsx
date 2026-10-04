import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

export default function JournalScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('tabs.journal')}</Text>
      <Text color="textSecondary">{t('journal.empty')}</Text>
    </Screen>
  );
}
