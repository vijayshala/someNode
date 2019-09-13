import React, { Component } from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { connect } from 'react-redux';
import ru from 'react-intl/locale-data/ru';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
import ja from 'react-intl/locale-data/ja';
import ko from 'react-intl/locale-data/ko';
import pt from 'react-intl/locale-data/pt';
import zh from 'react-intl/locale-data/zh';

import messages from '../../_locale/messages';
import {
  getViewerLanguage,
  getViewerLanguageShort
} from '../../redux-state/features/viewer';

addLocaleData([
  ...en,
  ...ru,
  ...de,
  ...es,
  ...fr,
  ...it,
  ...ja,
  ...ko,
  ...pt,
  ...zh
]);

function mapStateToProps(state) {
  return {
    viewerLanguage: getViewerLanguage(state),
    viewerLanguageShort: getViewerLanguageShort(state)
  };
}

class IntlWrap extends Component {
  static defaultProps = {
    defaultLocale: 'en'
  };

  render() {
    const { viewerLanguage, viewerLanguageShort } = this.props;
    const msg = messages[viewerLanguage] || messages[viewerLanguageShort];

    if (!window.intl) {
      import('intl').then(() =>
        Promise.all([
          import('intl/locale-data/jsonp/ru.js'),
          import('intl/locale-data/jsonp/en.js'),
          import('intl/locale-data/jsonp/de.js'),
          import('intl/locale-data/jsonp/es.js'),
          import('intl/locale-data/jsonp/fr.js'),
          import('intl/locale-data/jsonp/it.js'),
          import('intl/locale-data/jsonp/ja.js'),
          import('intl/locale-data/jsonp/ko.js'),
          import('intl/locale-data/jsonp/pt.js'),
          import('intl/locale-data/jsonp/zh.js')
        ]).then(() => {
          return (
            <IntlProvider locale={viewerLanguage} messages={msg}>
              {this.props.children}
            </IntlProvider>
          );
        })
      );
    }
    return (
      <IntlProvider locale={viewerLanguage} messages={msg}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default connect(mapStateToProps)(IntlWrap);
