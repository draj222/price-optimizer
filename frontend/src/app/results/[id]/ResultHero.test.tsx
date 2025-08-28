import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function ResultHero({ min, max, median, conf }: { min: number, max: number, median: number, conf: string }) {
  return (
    <section>
      <div data-testid="range">{min} – {max}</div>
      <div data-testid="median">Median: {median}</div>
      <div data-testid="conf">{conf}</div>
    </section>
  );
}

describe('ResultHero', () => {
  it('renders hero stats', () => {
    render(<ResultHero min={100} max={200} median={150} conf="high" />);
    expect(screen.getByTestId('range')).toHaveTextContent('100 – 200');
    expect(screen.getByTestId('median')).toHaveTextContent('Median: 150');
    expect(screen.getByTestId('conf')).toHaveTextContent('high');
  });
});
