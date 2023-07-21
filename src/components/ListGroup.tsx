const items = [
  'Tokyo',
  'New York',
  'Amsterdam',
  'Mumbai',
  'Seoul',
  'Shanghai',
  'Lagos',
];

const ListGroup = () => {
  return (
    <>
      <h2>My listing</h2>
      <ul className="list-group">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  );
};

export default ListGroup;
