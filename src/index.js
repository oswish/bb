const React = require('react');
const ReactDOM = require('react-dom');
const unique = require('uniq');

const { useState } = React;

const numbers = [1, 2, 2, 3, 4, 5, 5, 5, 6];

const style = {
  backgroundColor: 'green',
  boxSizing: 'content-box',
  color: 'white',
  margin: 50,
  padding: 50,
  textAlign: 'center'
};

const Hello = ({ nums }) => {
  const [payload, setPayload] = useState();

  if (!payload) {
    fetch('/api')
      .then(response => response.json())
      .then(data => {
        setPayload(data);
      });
  }

  return React.createElement(
    'div',
    null,
    React.createElement('b', null, (payload && payload.message) || ''),
    `: ${nums}`
  );
};

const App = props =>
  React.createElement(
    'div',
    { style },
    React.createElement(Hello, { ...props })
  );

ReactDOM.render(
  React.createElement(App, { style, nums: unique(numbers), head: 'hi' }, null),
  document.getElementById('root')
);
