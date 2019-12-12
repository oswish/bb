require('dotenv').config();

const React = require('react');
const ReactDOM = require('react-dom');

const { useState } = React;
const HOST = 'https://getpostman.com';
const API_HOST = process.env.API_HOST || '';

const PM = () => {
  const [payload, setPayload] = useState();

  if (!payload) {
    fetch(`${API_HOST}/pm`)
      .then(response => response.json())
      .then(data => {
        setPayload(data);
      });
  }

  function getDescriptionCards() {
    const describe = payload && payload.describe;
    const describeNodes =
      describe &&
      describe.map(item => {
        const { body, title, url } = item;
        const urlNode =
          (url &&
            React.createElement(
              'a',
              { className: 'link', href: `${HOST}${url}` },
              'Learn More',
              React.createElement(
                'style',
                null,
                `
          .link {
            display: inline-block;
            color: #FF6C37;
            font-weight: bold;
            padding: 20px 0 0;
          }

          .link:hover { color: red }
        `
              )
            )) ||
          null;

        return React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              border: '1px solid #666',
              borderRadius: 5,
              color: '#666',
              margin: '12px auto',
              padding: '2px 30px 40px',
              width: '60%'
            }
          },
          React.createElement('h4', null, title),
          React.createElement('div', {
            dangerouslySetInnerHTML: { __html: body }
          }),
          urlNode
        );
      });

    return describeNodes && React.createElement('div', null, ...describeNodes);
  }

  function getStatsCard() {
    const stats = payload && payload.stats;
    const statsKeys = (stats && Object.keys(stats)) || [];
    const statsNodes = statsKeys.map(key => {
      return React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#666',
            borderRadius: 5,
            color: 'white',
            display: 'inline-block',
            margin: 10,
            padding: '5px 10px'
          }
        },
        `${key}: ${stats[key]}`
      );
    });

    return React.createElement('div', null, ...statsNodes);
  }

  function getDownloadCard() {
    const title = React.createElement(
      'h1',
      null,
      (payload && payload.title) || ''
    );
    const cta = React.createElement(
      'h2',
      { style: { color: '#1C272B' } },
      (payload && payload.cta) || ''
    );
    const hero = React.createElement('img', {
      width: 400,
      style: {
        display: 'block',
        margin: '0 auto 20px'
      },
      src: payload && `${HOST}${payload.hero}`
    });
    const downLoadBtn = React.createElement(
      'button',
      {
        onClick: () => {
          document.location.href = `${HOST}${payload.url}`;
        },
        className: 'download'
      },
      'Download',
      React.createElement(
        'style',
        null,
        `
          .download {
            background-color: #1C272B;
            color: white;
            cursor: pointer;
            font-size: 20px;
            border-radius: 10px;
            margin-top: 20px;
            padding: 10px 20px;
          }

          .download:hover { background-color: red }
        `
      )
    );

    const innerDownloadCard = React.createElement(
      'div',
      null,
      title,
      cta,
      hero,
      downLoadBtn
    );

    return React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#FF6C37',
          borderRadius: 10,
          color: 'white',
          margin: '10px 50px 50px',
          padding: '40px 50px 80px',
          filter: 'drop-shadow(8px 8px 10px rgba(0, 0, 0, 0.4))'
        }
      },
      innerDownloadCard
    );
  }

  return React.createElement(
    'div',
    null,
    getStatsCard(),
    getDownloadCard(),
    getDescriptionCards()
  );
};

const App = () =>
  React.createElement(
    'div',
    {
      style: {
        boxSizing: 'content-box',
        fontFamily: 'Roboto,Tahoma,sans-serif',
        paddingBottom: 100,
        textAlign: 'center'
      }
    },
    React.createElement(PM)
  );

ReactDOM.render(React.createElement(App), document.getElementById('root'));
