import { Factory, ld } from '../../helpers';
import { ResponseValidationUX as UX } from '../../../src/screens/task/response-validation-ux';
jest.mock('lodash/random', () => () => 1);

describe('Task Response Validation', () => {
  let step;
  let ux;
  let validator;
  const messages = [
    { title: 'one' }, { title: 'two' }, { title: 'three' },
  ];
  beforeEach(() => {
    step = Factory.studentTask({ type: 'homework', stepCount: 1 }).steps[0];
    validator = {
      isEnabled: true,
      isUIEnabled: true,
      result: { valid: true },
      validate(args) {
        return Promise.resolve(ld.extend(args, this.result));
      },
    };
    ux = new UX({ step, validator, messages });
  });

  it('picks a random message', () => {
    ux = new UX({ step, validator, messages });
    expect(ux.nudge.title).toEqual('two');
  });

  it('does not set message when ui is off', async () => {
    validator.isUIEnabled = false;
    ux.setResponse({ target: { value: 'garbage all the way down' } });
    await ux.onSave();
    expect(step.response_validation.attempts).toHaveLength(1);
    expect(step.response_validation.attempts[0].nudge).toBeNull();
  });

});