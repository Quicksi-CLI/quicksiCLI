const React = require('react');
const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const translate = require('../../server/translate.js').translate;

class Help extends React.Component {
  render() {
    const {config: siteConfig} = this.props;
    const supportLinks = [
      {
        title: <translate>Browse the GitHub docs</translate>,
        content: `Learn more about Quicksi using the [github documentation](https://github.com/Quicksi-CLI/quicksi)`,
      },
      {
        title: <translate>Spectrum</translate>,
        content:
          'You can join the community on [Spectrum](https://spectrum.chat/quicksi)',
      },
      {
        title: <translate>Twitter</translate>,
        content:
          'You can follow and contact the maintainer on [Twitter](https://twitter.com/AnayoOleru).',
      },
      {
        title: <translate>GitHub</translate>,
        content:
          'At our [GitHub repo](https://github.com/Quicksi-CLI/quicksi) Browse and submit [issues](https://github.com/Quicksi-CLI/quicksi/issues) or [pull requests](https://github.com/Quicksi-CLI/quicksi/pulls) for bugs you find or any new starter you may want implemented. Be sure to also check out our [contributing information](https://github.com/Quicksi-CLI/quicksi/blob/master/CONTRIBUTING.md).',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h1>
                <translate>Need Quicksi help?</translate>
              </h1>
            </header>
            <p>
              <translate desc="statement made to reader">
                If you need help with Quicksi, you can try one of the
                mechanisms below.
              </translate>
            </p>
            <GridBlock contents={supportLinks} layout="fourColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

Help.title = 'Help';

module.exports = Help;
