import Builder from '../../../src/screens/assignment-builder/builder';
import { C, TimeMock, createUX } from './helpers';

describe('Task Plan Builder', function() {
  let props;

  const now = TimeMock.setTo('2015-10-14T12:00:00.000Z');

  beforeEach(() => {
    props = { ux: createUX({ now }) };
  });

  it('sets name & description', () => {
    const builder = mount(<C><Builder {...props} /></C>);
    props.ux.plan.save = jest.fn();
    builder.find('.assignment-name input').simulate('change', {
      target: { value: 'an updated title' },
    });
    builder.find('.assignment-description textarea').simulate('change', {
      target: { value: 'an updated description' },
    });

    props.ux.onPublish({ preventDefault: jest.fn() });

    expect(props.ux.plan.title).toEqual('an updated title');
    expect(props.ux.plan.description).toEqual('an updated description');
    builder.unmount();
  });

  it('switches periods', () => {
    const builder = mount(<C><Builder {...props} /></C>);
    expect(builder.find('Tasking')).toHaveLength(1);
    builder.find('#show-periods-radio').simulate('change', {
      target: { value: 'periods' },
    });
    expect(builder.find('Tasking')).toHaveLength(props.ux.course.periods.length);
    builder.unmount();
  });
});
