const Bundler = require('parcel-bundler');
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const app = express();
const bundler = new Bundler('src/index.html', {});
const host = 'https://www.getpostman.com';
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.set('json spaces', 2);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.set('json spaces', 2);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.set('json spaces', 2);

app.use('/', express.static(path.join(__dirname, '..', 'dist')));

app.get('/pm_g', (req, res) => {
  fetch(host)
    .then(
      (r) => {
        r.text()
          .then(data => {
            const { document } = (new JSDOM(data)).window;

            const getHeader = () => {
              const header = {type: 'header'};
              const items = [];
              const get = isTail => {
                const nav = document.querySelector('[role="navigation"]');
                const ul = [...nav.querySelectorAll('ul')];
                const list = isTail && ul.pop() || ul.shift();

                if (!header.media) {
                  const media = nav.parentNode.querySelector('img').src;

                  header.media = media.indexOf('http') === -1 && `${host}${media}` || media;
                }

                let count = 0;

                [...list.querySelectorAll('li')].forEach(li => {
                  const links = [...li.querySelectorAll('a')];
                  const link = links.shift();
                  const href = link.href;
                  const lastChar = href[href.length - 1];
                  const hasItems = lastChar === '#';

                  if (href) {
                    const count = items.push({
                      title: link.textContent,
                      url: href.indexOf('http') === -1 && `${host}${href}` || href
                    });

                    if (hasItems) {
                      const lastItem = items[count - 1];

                      lastItem.items = [];

                      delete lastItem.url;

                      [...link.parentNode.querySelector('div').querySelectorAll('a')].forEach(link => {
                        const href = link.href;
                        const url = href && (href.indexOf('http') === -1 && `${host}${href}` || href) || null;
                        const data = {title: link.textContent};

                        if (url) {
                          data.url = url;
                        }

                        lastItem.items.push(data);
                      });
                    }
                  }

                  count++;
                });

                return count;
              };

              get();

              header.items = items;
              header.tail = get(true);

              return header;
            };

            const getFooter = () => {
              const footer = {type: 'footer', items: []};
              const sections = [...document.querySelector('footer').querySelectorAll('section')];

              sections.forEach(section => {
                const data = {items: []};
                const title = section.querySelector('p');

                if (title) {
                  data.title = title.textContent;

                  const list = section.querySelector('ul');

                  if (list) {
                    [...list.querySelectorAll('a')].forEach(link => {
                      const href = link.href;

                      data.items.push({
                        title: link.textContent,
                        url: href.indexOf('http') === -1 && `${host}${href}` || href
                      });
                    });
                  }
                } else {
                  [...section.querySelectorAll('a')].forEach(link => {
                    const href = link.href;

                    data.items.push({
                      body: link.innerHTML,
                      url: href.indexOf('http') === -1 && `${host}${href}` || href
                    });
                  });
                }

                footer.items.push(data);
              });

              return footer;
            }

            res.json([getHeader(), getFooter()]);
          });
      }
    );
});

app.get('/poc', (req, res) => {
  fetch(host)
    .then(
      (r) => {
        r.text()
          .then((data) => {
            const title = data.split('</h1>').shift().split('>').pop();
            const cta = data.split(title).pop().split('</p>').shift().split('>').pop();
            const url = data.split(cta).pop().split('</a>').shift().split('href="').pop().split('"').shift();
            const hero = data.substr(data.indexOf('<section')).substr(data.substr(data.indexOf('<section')).indexOf('src="') + 5).split('"').shift();
            const statsList = data.split(hero).pop().split('</p>').map(item => item.split('>').pop()).slice(0, 6);
            const stats = {
              [statsList[1]]: statsList[0],
              [statsList[3]]: statsList[2],
              [statsList[5]]: statsList[4]
            };
            const describe = [];

            let explaination = data.split('</h2>').shift().split('>').pop();

            describe.push({
              title: explaination,
              body: data.split(`${explaination}</h2>`).pop().substr(data.split(`${explaination}</h2>`).pop().indexOf('>') + 1).split('<').shift()
            });


            explaination = data.split('</h3>').shift().split('>').pop();

            describe.push({
              title: explaination,
              body: data.split(`${explaination}</h3>`).pop().split('</p>').shift().split('<p>').pop(),
              url: data.substr(data.indexOf(`${explaination}</h3>`)).substring(data.substr(data.indexOf(`${explaination}</h3>`)).indexOf('href="') + 6).split('"').shift()
            });

            const features = [];

            data.split('</h3>').forEach(item => {
              let snippet = item.substr(item.indexOf('h3'));

              snippet = snippet.substr(snippet.indexOf('>') + 1);

              if ( snippet.split(/\r?\n/).length < 2 && snippet.indexOf('<') === -1 && snippet.indexOf('>') === -1 ) {
                features.push(snippet);
              }
            });

            features.slice(0, 5).forEach(title => {
              describe.push({
                title,
                body: data.split(`${title}</h3>`).pop().substr(data.split(`${title}</h3>`).pop().indexOf('>') + 1).split('<').shift(),
                url: data.substr(data.indexOf(`${title}</h3>`)).substring(data.substr(data.indexOf(`${title}</h3>`)).indexOf('href="') + 6).split('"').shift()
              });
            });

            res.json({
              title,
              cta,
              url,
              hero,
              stats,
              describe
            });
          });
      }
    );
});

app.use(bundler.middleware());

app.listen(PORT, () => console.log(`app running at http://localhost:${PORT}`));
