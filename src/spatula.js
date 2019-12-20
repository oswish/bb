/**
 * Scrapes getpostman.com for data objects
 */

const host = 'https://www.getpostman.com';
const RE_TITLE = new RegExp('<h[0-9]( [a-z]+="[a-z,0-9, ,__,-]+")*>');

function hostURL(url) {
  return (url.indexOf('http') === -1 && `${host}${url}`) || url;
}

function addIfHas(items, data, name) {
  const d = data;

  if (items.length) {
    d[name] = items;
  }
}

function getAllTitles(sections, lastTitles) {
  /* some sections may have more than one title
   */
  const titles = [];

  sections.forEach((section, index) => {
    const splitByTitles = section.innerHTML.split(RE_TITLE);

    if (splitByTitles.length > 3) {
      splitByTitles.forEach(spl => {
        if (
          spl &&
          spl
            .charAt(0)
            .toLowerCase()
            .match(/[a-z]/)
        ) {
          titles.push(spl.split('<').shift());
        }
      });
    } else {
      titles.push(lastTitles[index]);
    }
  });

  return titles;
}

if (typeof exports === 'undefined') {
  window.pm = window.pm || {};
  window.exports = window.pm;
}

function spatula(doc) {
  const sections = [];
  const getLastTitles = () => {
    if (doc) {
      return [...doc.querySelectorAll('section')]
        .map(section => {
          const title = section.innerHTML
            .split(RE_TITLE)
            .pop()
            .split('<')
            .shift();

          if (title) {
            sections.push(section);
          }

          return title;
        })
        .filter(title => title.length);
    }

    return null;
  };
  const decodeEntities = str => {
    if (doc) {
      const div = doc.createElement('div');
      div.innerHTML = str;

      return div.textContent;
    }

    return null;
  };
  const deduplicateString = (items, str) => {
    const max = items.length;

    let i;
    let s = str;

    for (i = 0; i < max; i += 1) {
      s = s.split(decodeEntities(items[i])).join('');
    }

    return s;
  };
  const lastTitles = getLastTitles(sections);
  const titles = getAllTitles(sections, lastTitles);
  const data = [];

  let titleIndex = 0;

  sections.forEach(section => {
    const { innerHTML, textContent } = section;
    const sectionData = {};
    const sectionTitles = [];
    const sectionLinks = [];
    const sectionLinkMap = {};
    const sectionMedia = [];
    const sectionMediaMap = {};
    const sectionBody = [];
    const sectionBodyMap = {};
    const sectionTextMap = {};
    const sectionDuplicateLinkCopy = [];
    const sectionDuplicateLinkCopyMap = {};

    let remainingText = textContent;

    // TITLES
    while (innerHTML.indexOf(`>${titles[titleIndex]}<`) !== -1) {
      const title = titles[titleIndex];
      const titleText = title.trim();

      sectionTitles.push(titleText);
      sectionTextMap[titleText] = titleText;
      remainingText = remainingText.replace(title, '');

      titleIndex += 1;
    }

    // LINKS
    section.querySelector('a') &&
      [...section.querySelectorAll('a')].forEach(a => {
        const { href } = a;
        const encodedUrl = encodeURI(href);
        const encodedText = encodeURI(a.textContent);
        if (a.href) {
          if (!sectionLinkMap[encodedUrl]) {
            sectionLinkMap[encodedUrl] = a.textContent;
          } else if (!sectionDuplicateLinkCopyMap[a.textContent]) {
            sectionDuplicateLinkCopyMap[encodedText] = encodedText;
          }
        }
        sectionTextMap[a.textContent] = a.textContent;
      });

    Object.keys(sectionLinkMap).forEach(key => {
      const decodedUrl = decodeURI(key);

      sectionLinks.push({
        title: sectionLinkMap[key].trim(),
        url: hostURL(decodedUrl)
      });

      remainingText = remainingText.replace(sectionLinkMap[key], '');
    });

    // MEDIA
    section.querySelector('img') &&
      [...section.querySelectorAll('img')].forEach(img => {
        const src = img.getAttribute('data-src') || img.getAttribute('src');
        const encodedSrc = encodeURI(src);
        if (!sectionMediaMap[encodedSrc]) {
          sectionMediaMap[encodedSrc] = img.alt;
        }
      });

    Object.keys(sectionMediaMap).forEach(key => {
      const media = {
        url: hostURL(decodeURI(key))
      };
      addIfHas(sectionMediaMap[key], media, 'title');
      sectionMedia.push(media);
    });

    // BODY
    section.querySelector('p') &&
      [...section.querySelectorAll('p')].forEach(p => {
        const encodedText = encodeURI(p.textContent);

        if (!sectionBodyMap[encodedText] && !sectionTextMap[p.textContent]) {
          sectionBodyMap[encodedText] = p.textContent;
        }

        sectionTextMap[p.textContent] = p.textContent;
      });

    Object.keys(sectionBodyMap).forEach(key => {
      sectionBody.push(sectionBodyMap[key]);
      remainingText = remainingText.replace(sectionBodyMap[key], '');
    });

    // DUPLICATE LINK COPY
    Object.keys(sectionDuplicateLinkCopyMap).forEach(key => {
      const decodedText = decodeURI(key);
      sectionDuplicateLinkCopy.push(decodedText.trim());
      remainingText = remainingText.replace(decodedText, '');
    });
    remainingText = deduplicateString(sectionDuplicateLinkCopy, remainingText);
    remainingText = deduplicateString(sectionTitles, remainingText);
    remainingText = deduplicateString(sectionBody, remainingText);
    remainingText = remainingText.trim();
    // addIfHas(textContent, sectionData, '__')
    addIfHas(sectionTitles, sectionData, 'titles');
    addIfHas(sectionBody, sectionData, 'body');
    addIfHas(sectionLinks, sectionData, 'links');
    addIfHas(sectionMedia, sectionData, 'media');
    addIfHas(sectionDuplicateLinkCopy, sectionData, 'duplicateLinkCopy');
    addIfHas(remainingText, sectionData, 'otherContent');
    data.push(sectionData);
  });

  return data;
}

exports.spatula = spatula;
