import { buildCalendlyUrl } from './buildCalendlyUrl';

describe('buildCalendlyUrl', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { process.env = { ...OLD_ENV }; });
  afterEach(() => { process.env = OLD_ENV; });

  it('returns calendly url with prefill', () => {
    process.env.NEXT_PUBLIC_CALENDLY_URL = 'https://calendly.com/demo';
    expect(buildCalendlyUrl('123 Main St')).toContain('https://calendly.com/demo');
    expect(buildCalendlyUrl('123 Main St')).toContain('Tour%20for%20123%20Main%20St');
  });
  it('returns mailto fallback if env missing', () => {
    delete process.env.NEXT_PUBLIC_CALENDLY_URL;
    expect(buildCalendlyUrl('123 Main St')).toContain('mailto:');
    expect(buildCalendlyUrl('123 Main St')).toContain('Tour%20for%20123%20Main%20St');
  });
});
