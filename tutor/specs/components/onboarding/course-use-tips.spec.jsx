import { C, R } from '../../helpers';
import Course from '../../../src/models/course';
import CourseUseTips from '../../../src/components/onboarding/course-use-tips';

import { observable } from 'mobx';


describe('Course Use Tips', () => {

  let ux, course, props;

  beforeEach(() => {
    course = new Course({ appearance_code: 'biology', id: 42 });
    ux = observable.object({ course });
    props = {
      ux,
      onDismiss: jest.fn(),
    };
  });

  it('renders and matches snapshot', () => {
    expect.snapshot(
      <C><CourseUseTips {...props} /></C>
    ).toMatchSnapshot();
  });

  it('has link to help', async () => {
    const wrapper = mount(<R><CourseUseTips {...props} /></R>);
    expect(wrapper).toHaveRendered('a.best-practices');
    course.appearance_code = 'gibberish';
    expect(wrapper).not.toHaveRendered('a.best-practices');
  });

  it('dismisses on btn click', () => {
    const tips = mount(<R><CourseUseTips {...props} /></R>);
    tips.find('Footer Button').simulate('click');
    expect(props.onDismiss).toHaveBeenCalled();
  });

});
