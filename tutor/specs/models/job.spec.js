import Job from '../../src/models/job';

jest.useFakeTimers();

describe('Job Helper', function() {

  let job;

  beforeEach(() => {
    job = new Job({ interval: 0 });
  });

  it('should be able to queue a job for something', () => {
    job.requestJobStatus = jest.fn();
    job.startPolling('/foo/bar/123456');
    jest.runAllTimers();
    expect(job.requestJobStatus).toHaveBeenCalledTimes(1);
    job.onJobUpdate({ data: { progress: 0.1 } });
    expect(job.progress).toBeCloseTo(0.1);
    jest.runAllTimers();
    expect(job.requestJobStatus).toHaveBeenCalledTimes(2);
    job.onJobUpdate({ data: { status: 'succeeded' } });
    expect(job.isComplete).toEqual(true);
    jest.runAllTimers();
    expect(job.requestJobStatus).toHaveBeenCalledTimes(2);
  });

  it('can cancel jobs', () => {
    job.requestJobStatus = jest.fn();
    job.startPolling('/foo/bar/123456');
    jest.runAllTimers();
    expect(job.requestJobStatus).toHaveBeenCalledTimes(1);
    job.onJobUpdate({ data: { progress: 0.1 } });
    job.stopPolling();
    jest.runAllTimers();
    expect(job.requestJobStatus).toHaveBeenCalledTimes(1);
  });

});
