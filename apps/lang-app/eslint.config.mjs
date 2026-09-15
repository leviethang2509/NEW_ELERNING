import { fixupPluginRules } from '@eslint/compat';
import base from '@lang/eslint-config/base';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  ...base,
  { ignores: ['next-env.d.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      // Plugin của Next 14 còn gọi API context cũ (getFilename…) mà ESLint 10
      // đã bỏ; fixupPluginRules bổ sung lại các API đó.
      '@next/next': fixupPluginRules(nextPlugin),
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // App Router, không có thư mục pages/.
      '@next/next/no-html-link-for-pages': 'off',
      // Chỉ bật 2 luật kinh điển; bộ luật React Compiler của v7 để sau.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
