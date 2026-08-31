export function Legend() {
  return (
    <ul className="legend">
      <li>
        <span className="legend-swatch legend-swatch--public" /> public
      </li>
      <li>
        <span className="legend-swatch legend-swatch--sink" /> sink (RDS)
      </li>
      <li>
        <span className="legend-swatch legend-swatch--vulnerable" /> vulnerable
      </li>
    </ul>
  );
}
