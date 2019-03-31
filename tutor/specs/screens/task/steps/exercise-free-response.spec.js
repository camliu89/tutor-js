import {
  FreeResponseInput, FreeResponseReview,
} from '../../../../src/screens/task/step/exercise-free-response';
import { Factory, TimeMock, delay } from '../../../helpers';
import { setFreeResponse } from '../helpers';
import ResponseValidation from '../../../../src/models/response_validation';

jest.mock('../../../../src/models/response_validation');
jest.mock('../../../../../shared/src/components/html', () => ({ html }) =>
  html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
);

describe('Exercise Free Response', () => {
  let props;
  TimeMock.setTo('2017-10-14T12:00:00.000Z');

  beforeEach(() => {
    const task = Factory.studentTask({ type: 'homework', stepCount: 1 });
    const step = task.steps[0];
    props = {
      step,
      response_validation: new ResponseValidation(),
      course: Factory.course(),
      question: step.content.questions[0],
    };
  });

  it('matches snapshot', () => {
    expect(<FreeResponseInput {...props} />).toMatchSnapshot();
  });

  it('reviews text', () => {
    const fr = mount(<FreeResponseReview {...props} />);
    props.step.free_response = null;
    expect(fr.isEmptyRender()).toBeTruthy();
    props.step.free_response = 'test';
    expect(fr.text()).toContain('test');
    fr.unmount();
  });

  it('saves text immediately when not validating', () => {
    props.response_validation.isEnabled = false;
    const fr = mount(<FreeResponseInput {...props} />);
    const value = 'test test test';
    setFreeResponse(fr, { value });
    expect(props.step.response_validation).toEqual({});
    expect(props.step.free_response).toEqual(value);
    expect(props.step.needsFreeResponse).toBe(false);
    fr.unmount();
  });

  it('only submits validation when ui is disabled', async () => {
    props.response_validation.isUIEnabled = false;
    const fr = mount(<FreeResponseInput {...props} />);
    const value = 'test test test';
    setFreeResponse(fr, { value });
    expect(props.step.response_validation).toEqual({});
    expect(props.step.free_response).toEqual(value);
    expect(props.step.needsFreeResponse).toBe(false);

    await delay();

    expect(fr).toHaveRendered('ExerciseFooter RelatedContentLink');
    expect(fr).not.toHaveRendered('TextArea[isErrored=true]');

    fr.unmount();
  });

  it('validates text and has retry ui', async () => {
    props.response_validation.isEnabled = true;
    props.response_validation.isUIEnabled = true;
    props.response_validation.validate = jest.fn()
      .mockResolvedValue({ data: { valid: false } });
    const fr = mount(<FreeResponseInput {...props} />);

    const value = 'test test test';
    expect(fr).toHaveRendered('ExerciseFooter RelatedContentLink');

    setFreeResponse(fr, { value });

    fr.render();

    expect(props.response_validation.validate).toHaveBeenCalledWith(
      { response: value, uid: props.step.uid },
    );
    await delay();

    expect(props.step.response_validation.attempts).toHaveLength(1);
    expect(props.step.response_validation.attempts[0]).toMatchObject({
      valid: false,
      response: value,
    });

    expect(fr).toHaveRendered('TextArea[isErrored=true]');
    expect(fr).not.toHaveRendered('ExerciseFooter RelatedContentLink');

    expect(fr.text()).toContain('Re-answer');
    expect(fr).toHaveRendered('FrNudgeHelp');
    expect(fr).toHaveRendered('AnswerButton[disabled=true]');
    expect(fr.find('AnswerButton').text()).toEqual('Re-answer');
    expect(props.step.free_response).toBeUndefined();

    const updatedValue = 'a new value';
    setFreeResponse(fr, { value: updatedValue });

    await delay();

    expect(props.response_validation.validate).toHaveBeenCalledWith(
      { response: updatedValue, uid: props.step.uid },
    );

    expect(props.step.response_validation.attempts).toHaveLength(2);
    expect(props.step.response_validation.attempts[1]).toMatchObject({
      valid: false,
      response: updatedValue,
    });

    expect(props.step.free_response).toEqual(updatedValue);

    fr.unmount();
  });

});
