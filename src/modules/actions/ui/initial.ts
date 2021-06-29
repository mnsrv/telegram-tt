import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ANIMATION_LEVEL_MAX } from '../../../config';
import {
  IS_ANDROID, IS_IOS, IS_SAFARI, IS_TOUCH_ENV,
} from '../../../util/environment';
import { setLanguage } from '../../../util/langProvider';
import switchTheme from '../../../util/switchTheme';
import { selectTheme } from '../../selectors';

subscribeToSystemThemeChange();

addReducer('init', (global) => {
  const { animationLevel, messageTextSize, language } = global.settings.byKey;
  const theme = selectTheme(global);

  setLanguage(language, undefined, true);

  document.documentElement.style.setProperty('--message-text-size', `${messageTextSize}px`);
  document.body.classList.add('initial');
  document.body.classList.add(`animation-level-${animationLevel}`);
  document.body.classList.add(IS_TOUCH_ENV ? 'is-touch-env' : 'is-pointer-env');
  switchTheme(theme, animationLevel === ANIMATION_LEVEL_MAX);

  if (IS_SAFARI) {
    document.body.classList.add('is-safari');
  }
  if (IS_IOS) {
    document.body.classList.add('is-ios');
  } else if (IS_ANDROID) {
    document.body.classList.add('is-android');
  }
});

addReducer('setIsUiReady', (global, actions, payload) => {
  const { uiReadyState } = payload!;

  if (uiReadyState === 2) {
    document.body.classList.remove('initial');
  }

  return {
    ...global,
    uiReadyState,
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  return {
    ...global,
    authPhoneNumber: phoneNumber,
  };
});

addReducer('setAuthRememberMe', (global, actions, payload) => {
  return {
    ...global,
    authRememberMe: Boolean(payload),
  };
});

addReducer('clearAuthError', (global) => {
  return {
    ...global,
    authError: undefined,
  };
});

function subscribeToSystemThemeChange() {
  function handleSystemThemeChange() {
    const currentThemeMatch = document.documentElement.className.match(/theme-(\w+)/);
    const currentTheme = currentThemeMatch ? currentThemeMatch[1] : 'light';
    const global = getGlobal();
    const nextTheme = selectTheme(global);
    const { animationLevel } = global.settings.byKey;

    if (nextTheme !== currentTheme) {
      switchTheme(nextTheme, animationLevel === ANIMATION_LEVEL_MAX);
      // Force-update component containers
      setGlobal({ ...global });
    }
  }

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handleSystemThemeChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(handleSystemThemeChange);
  }
}
