import Factory from '../../factories';
import ApLo from '../../../src/components/tags/aplo';


describe('ApLo tags component', () => {
  let props;
  beforeEach(() => {
    props = {
      exercise: Factory.exercise({ tags: [
        'book:stax-apbio', 'book:stax-apphys',
      ] }),
    };
  });

  it('renders and matches snapshot', () => {
    expect.snapshot(<ApLo {...props} />).toMatchSnapshot();
  });

  it('validates', () => {
    const lo = mount(<ApLo {...props} />);
    lo.find('Icon[type="plus-circle"] button').simulate('click');
    lo.find('BookSelection select').simulate('change', {
      target: { value: 'stax-apbio' },
    });
    const input = lo.find('Input input[type="text"]');
    expect(input.props()).toMatchObject({
      placeholder: '#.##',
    });

    input.simulate('change', { target: { value: '1.11111' } });
    input.simulate('blur');
    expect(lo).toHaveRendered('TagError');

    expect(lo.find('TagError').props()).toMatchObject({
      error: expect.stringContaining('Must have book and match LO pattern'),
    });

    input.simulate('change', { target: { value: '1.42' } });
    input.simulate('blur');
    expect(lo.find('TagError').props().error).toBeUndefined();

    lo.find('BookSelection select').simulate('change', {
      target: { value: 'stax-apphys' },
    });
    expect(lo.find('Input input[type="text"]').props()).toMatchObject({
      placeholder: '#.[A-Z].#.#',
    });

    lo.unmount();
  });

});
