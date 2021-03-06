import ModalManager from '../../src/components/modal-manager';
import TermsModal from '../../src/components/terms-modal';
import User from '../../src/models/user';
import { Term, UserTerms } from '../../src/models/user/terms';

jest.mock('../../src/models/user', () => ({
  terms_signatures_needed: false,
  terms: { unsigned: [] },
  get shouldSignTerms() { return this.terms_signatures_needed && this.terms.unsigned.length > 0; },
}));

describe('Terms agreement modal', () => {

  let modalManager;

  beforeEach(() => {
    User.terms = new UserTerms({ user: User });
    modalManager = new ModalManager();
    modalManager.canDisplay = () => true;
  });

  describe('when there are no courses and no terms', () => {
    it('does not render', () => {
      const modal = shallow(<TermsModal modalManager={modalManager} />).dive();
      expect(modal.is('Modal')).toBe(false);
      expect(modal.text()).toBe('');
    });
  });

  describe('when there are courses and', () => {
    beforeEach(() => {
      User.terms_signatures_needed = true;
    });

    describe('only signed terms', () => {
      beforeEach(() => {
        User.terms.terms = [
          {
            id: 42,
            name: 'general_terms_of_use',
            title: 'Terms of Use',
            content: 'bunch of HTML',
            version: 2,
            is_signed: true,
            has_signed_before: true,
            is_proxy_signed: true,
          },
        ];
      });

      it('does not render', () => {
        const modal = shallow(<TermsModal canBeDisplayed modalManager={modalManager} />).dive();
        expect(modal.text()).toBe('');
      });
    });

    describe('some unsigned terms', () => {
      beforeEach(() => {
        User.terms.terms = [
          {
            id: 42,
            name: 'general_terms_of_use',
            title: 'Terms of Use',
            content: 'bunch of HTML',
            version: 2,
            is_signed: false,
            has_signed_before: true,
            is_proxy_signed: false,
          },
        ];
      });

      it('renders', () => {
        const modal = shallow(<TermsModal canBeDisplayed modalManager={modalManager} />).dive();
        expect(modal.text()).toContain('I agree');
      });
    });
  });

  it('signs term when agreed', () => {
    const term = new Term({
      id: 1, is_signed: false, content: 'TERMS TESTING CONTENT', title: 'SIGN ME',
    });
    term.sign = jest.fn();
    User.terms.terms = [ term ];
    User.terms.sign = jest.fn();
    User.terms_signatures_needed = true;
    const modal = mount(<TermsModal canBeDisplayed modalManager={modalManager} />);
    modal.find('Button').simulate('click');
    expect(User.terms.sign).toHaveBeenCalled();
  });
});
