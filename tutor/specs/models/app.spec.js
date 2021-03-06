import App from '../../src/models/app';
import Toasts from '../../src/models/toasts';
import { readBootstrapData, documentReady } from '../../src/helpers/dom';
import Raven from '../../src/models/app/raven';

jest.mock('../../src/helpers/dom', () => ({
  readBootstrapData: jest.fn(() => ({ courses: [] })),
  documentReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('../../src/models/app/raven');
jest.mock('../../src/models/toasts', () => ({
  push: jest.fn(),
}));


describe('Tutor App model', () => {
  let app;

  beforeEach(() => app = new App());

  it('sends a toast notice when url changes', () => {
    app.onNotice({ tutor_js_url: 'test.com' });
    expect(app.tutor_js_url).toEqual('test.com');
    expect(Toasts.push).not.toHaveBeenCalled();

    app.onNotice({ tutor_js_url: 'test.com/new-js' });

    expect(app.tutor_js_url).toEqual('test.com');
    expect(Toasts.push).toHaveBeenCalledWith({ handler: 'reload' });
  });

  it('boots after document is ready, starts raven and reads data', async () => {
    await App.boot();
    expect(documentReady).toHaveBeenCalled();
    expect(readBootstrapData).toHaveBeenCalled();
    expect(Raven.boot).toHaveBeenCalled();
  });
});
