import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';

export default function ProgramsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('tabs.programs')}</Text>
      <Text color="textSecondary">{t('programs.empty')}</Text>
    </Screen>
  );
}
