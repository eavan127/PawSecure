import { Text, TextInput } from 'react-native';
import { ErrorBoundary } from './components';
import { Providers } from './app/providers';
import { AppNavigation } from './app/navigation';

// Prevent system accessibility settings from breaking layout
interface TextWithDefaultProps extends Text {
  defaultProps?: { maxFontSizeMultiplier?: number };
}
interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { maxFontSizeMultiplier?: number };
}

(Text as unknown as TextWithDefaultProps).defaultProps = {
  ...((Text as unknown as TextWithDefaultProps).defaultProps || {}),
  maxFontSizeMultiplier: 1.0,
};
(TextInput as unknown as TextInputWithDefaultProps).defaultProps = {
  ...((TextInput as unknown as TextInputWithDefaultProps).defaultProps || {}),
  maxFontSizeMultiplier: 1.0,
};

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppNavigation />
      </Providers>
    </ErrorBoundary>
  );
}
