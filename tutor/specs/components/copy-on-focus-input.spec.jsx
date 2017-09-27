import { React } from './helpers/component-testing';
import Clipboard from '../../src/helpers/clipboard';
import CopyOnFocusInput from '../../src/components/copy-on-focus-input';

jest.mock('../../src/helpers/clipboard');

describe('CopyOnFocusInput', () => {
  let props;

  beforeEach(() => {
    Clipboard.copy.mockClear();
    props = {
      value: 'a string that is important',
    };
  });

  it('renders and copys when focused', () => {
    const input = mount(<CopyOnFocusInput {...props} />);
    expect(Clipboard.copy).not.toHaveBeenCalled();
    input.simulate('focus');
    expect(Clipboard.copy).toHaveBeenCalled();
  });

  it('can auto-focus', () => {
    props.focusOnMount = true;
    expect(Clipboard.copy).not.toHaveBeenCalled();
    mount(<CopyOnFocusInput {...props} />);
    expect(Clipboard.copy).toHaveBeenCalled();
  });

  it('can render a label', () => {
    props.label = 'Click me!';
    props.className = 'test-123';
    const input = mount(<CopyOnFocusInput {...props} />);
    expect(input).toHaveRendered(`label[className="${props.className}"]`);
    expect(input).toHaveRendered(`input[value="${props.value}"]`);
    expect(input.text()).toContain('Click me!');
  });

});
