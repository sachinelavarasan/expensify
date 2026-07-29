import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemedContext';

interface Props {
  message?: string | null;
}

const FormErrorBanner = ({ message }: Props) => {
  const { colors } = useThemeContext();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.danger + '1A', borderColor: colors.danger + '33' },
      ]}>
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
};

export default FormErrorBanner;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-500',
    lineHeight: 18,
  },
});
