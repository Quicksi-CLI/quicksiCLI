
const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const Showcase = require(`${process.cwd()}/core/Showcase.js`);
const translate = require('../../server/translate.js').translate;

function HomeSplash(props) {
  const {siteConfig, language} = props;

  return (
    <div className="index-hero">
      <div className="index-hero-inner">
        <h1 className="index-hero-project-tagline">
          <img
            alt="Quicksi"
            className="index-hero-logo"
            src={`${siteConfig.baseUrl}img/quicksi.png`}
          />
          {siteConfig.title} is a command line{' '}
          {/* <span className="index-hero-project-keywords">Open Source</span>{' '} */}
          bot, and can help you start new projects easily
        </h1>
        <div className="index-ctas">
          <a
            className="button index-ctas-get-started-button"
            href={`${siteConfig.baseUrl}docs/${language}/installation`}>
            <translate>Get Started</translate>
          </a>
          <span className="index-ctas-github-button">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=Quicksi-CLI&amp;repo=quicksi&amp;type=star&amp;count=true&amp;size=large"
              frameBorder={0}
              scrolling={0}
              width={160}
              height={30}
              title="GitHub Stars"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = 'en'} = this.props;
    const pinnedUsersToShowcase = siteConfig.users.filter(
      (user) => user.pinned,
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="announcement">
          <div className="announcement-inner">
            Contribute to making quicksi better{' '}
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfENU2xyl29r5xIbeV2y4ivi5YdD9Yl6AmnGGMXRuX59BYSwQ/viewform">
              give us your feedback here
            </a>
            !
          </div>
        </div>
        <div className="mainContainer">
          <Container padding={['top']} background="light">
            <GridBlock
              align="center"
              contents={[
                {
                  content: `Reuseable starters in different languages, frameworks and libraries designed to make it easy for developers to start projects without having to worry about the setup.`,
                  image: `${siteConfig.baseUrl}img/productive.svg`,
                  imageAlign: 'left',
                  imageAlt: 'start',
                  title: <translate>Enhance productivity</translate>,
                },
                {
                  content: `Tech Speakers or code instructors during workshops, doing tutorials or conferences can enable students or audience get easy access to all their tutorial starters, without needing to clone a repository all the time`,
                  image: `${siteConfig.baseUrl}img/access.svg`,
                  imageAlign: 'right',
                  imageAlt: 'React',
                  title: <translate>Easy access to starters</translate>,
                },
                // {
                //   content: `[Localization](${siteConfig.baseUrl}docs/${this.props.language}/translation)
                //     comes pre-configured. Use [Crowdin](https://crowdin.com/) to translate your docs
                //     into over 70 languages.`,
                //   image: `${siteConfig.baseUrl}img/undraw_around_the_world.svg`,
                //   imageAlign: 'top',
                //   imageAlt: 'Translation',
                //   title: <translate>Ready for Translations</translate>,
                // },
              ]}
              layout="twoColumn"
            />
            <br />
            <br />
            {/* <GridBlock
              align="center"
              contents={[
                {
                  content: `Support users on all versions of your project. Document
                    [versioning](${siteConfig.baseUrl}docs/${this.props.language}/versioning)
                    helps you keep documentation in sync with project releases.`,
                  image: `${siteConfig.baseUrl}img/undraw_version_control.svg`,
                  imageAlign: 'top',
                  imageAlt: 'Document Versioning',
                  title: <translate>Document Versioning</translate>,
                },
                {
                  content: `Make it easy for your community to [find](${siteConfig.baseUrl}docs/${this.props.language}/search) what they need in your documentation.
                    We proudly support [Algolia documentation search](https://www.algolia.com/).`,
                  image: `${siteConfig.baseUrl}img/undraw_algolia.svg`,
                  imageAlign: 'top',
                  imageAlt: 'Document Search',
                  title: <translate>Document Search</translate>,
                },
              ]}
              layout="twoColumn"
            /> */}
          </Container>
          {/* <Container padding={['bottom', 'top']}>
            <GridBlock
              contents={[
                {
                  content: `Get [up and running](${siteConfig.baseUrl}docs/${this.props.language}/site-creation)
                    quickly without having to worry about site design.`,
                  imageAlign: 'right',
                  image: `${siteConfig.baseUrl}img/undraw_setup_wizard.svg`,
                  imageAlt: 'Docusaurus on a Scooter',
                  title: <translate>Quick Setup</translate>,
                },
              ]}
              layout="twoColumn"
            />
          </Container> */}
          {/* <Container padding={['bottom', 'top']} background="light">
            <GridBlock
              contents={[
                {
                  content: `Make design and documentation changes by using the included
                    [live server](${siteConfig.baseUrl}docs/${this.props.language}/site-preparation#verifying-installation).
                    [Publish](${siteConfig.baseUrl}docs/${this.props.language}/publishing)
                    your site to GitHub pages or other static file hosts
                    manually, using a script, or with continuous integration
                    like CircleCI.`,
                  imageAlign: 'left',
                  image: `${siteConfig.baseUrl}img/docusaurus_live.gif`,
                  imageAlt: 'Docusaurus Demo',
                  title: <translate>Develop and Deploy</translate>,
                },
              ]}
              layout="twoColumn"
            />
          </Container> */}
          {/* <Container padding={['bottom', 'top']}>
            <GridBlock
              contents={[
                {
                  content: `Docusaurus currently provides support to help your website
                    use [translations](${siteConfig.baseUrl}docs/${this.props.language}/translation),
                    [search](${siteConfig.baseUrl}docs/${this.props.language}/search),
                    and [versioning](${siteConfig.baseUrl}docs/${this.props.language}/versioning),
                    along with some other special [documentation markdown features](${siteConfig.baseUrl}docs/${this.props.language}/doc-markdown).
                    If you have ideas for useful features, feel free to
                    contribute on [GitHub](https://github.com/facebook/docusaurus)!`,
                  imageAlign: 'right',
                  image: `${siteConfig.baseUrl}img/undraw_features_overview.svg`,
                  imageAlt: 'Monochromatic Docusaurus',
                  title: <translate>Website Features</translate>,
                },
              ]}
              layout="twoColumn"
            />
          </Container> */}

{/* who Quicksi has helped */}
          {/* <div className="productShowcaseSection paddingBottom">
            <h2>
              <translate>Who is Using Quicksi?</translate>
            </h2>
            <p>
              <translate>
                Quicksi has helped start projects for this developers...
              </translate>
            </p>
            <Showcase users={pinnedUsersToShowcase} />
            <div className="more-users">
              <a
                className="button"
                href={`${siteConfig.baseUrl}${this.props.language}/users`}>
                <translate>All Quicksi Users</translate>
              </a>
            </div>
          </div> */}


          {/* <div className="testimonials">
            <Container padding={['bottom', 'top']}>
              <GridBlock
                align="center"
                contents={[
                  {
                    content:
                      "*I've helped open source many projects at Facebook and every one needed a website. They all had very similar constraints: the documentation should be written in markdown and be deployed via GitHub pages. None of the existing solutions were great, so I hacked my own and then forked it whenever we needed a new website. I’m so glad that Docusaurus now exists so that I don’t have to spend a week each time spinning up a new one.*",
                    image: `${siteConfig.baseUrl}img/christopher-chedeau.jpg`,
                    imageAlign: 'top',
                    imageAlt: 'Christopher "vjeux" Chedeau',
                    title:
                      'Christopher "vjeux" Chedeau <br/><font size="2">Lead Prettier Developer</font>',
                  },
                  {
                    content:
                      '*Open source contributions to the React Native docs have skyrocketed after our move to Docusaurus. The docs are now hosted on a small repo in plain markdown, with none of the clutter that a typical static site generator would require. Thanks Slash!*',
                    image: `${siteConfig.baseUrl}img/hector-ramos.png`,
                    imageAlign: 'top',
                    imageAlt: 'Hector Ramos',
                    title:
                      'Hector Ramos <br/><font size="2">Lead React Native Advocate</font>',
                  },
                  {
                    content:
                      '*Docusaurus has been a great choice for the ReasonML family of projects. It makes our documentation consistent, i18n-friendly, easy to maintain, and friendly for new contributors.*',
                    image: `${siteConfig.baseUrl}img/ricky-vetter.jpg`,
                    imageAlign: 'top',
                    imageAlt: 'Ricky Vetter',
                    title:
                      'Ricky Vetter <br/><font size="2">ReasonReact Developer</font>',
                  },
                ]}
                layout="threeColumn"
              />
            </Container>
          </div> */}
        </div>
      </div>
    );
  }
}

module.exports = Index;
