import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Button from './index';

describe('Button', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button onClick={() => {}}>Test</Button>, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(<Button onClick={() => {}}>Test</Button>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});